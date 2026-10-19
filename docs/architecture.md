# QuickNotes System Architecture

## 1. Functional Requirements

1. Users can register and log in securely.
2. Users can create, view, update, and delete their own notes.
3. Users can organize notes with tags.
4. Users can search and paginate through their notes.
5. The system returns useful validation and error messages.

## 2. Non-Functional Requirements

1. **Availability:** Target 99.9% monthly availability.
2. **Performance:** Aim for typical note-list requests to complete within 300 ms under normal load.
3. **Scalability:** Add application servers as traffic grows.
4. **Security:** Use HTTPS, secure password hashing, authentication, and authorization checks.
5. **Durability:** Back up the database and test recovery procedures.
6. **Maintainability:** Use clear API contracts, logs, metrics, and automated tests.

## 3. Capacity Estimates for 1 Million Registered Users

These are planning assumptions, not measured production traffic.

### Assumptions

- 1,000,000 registered users.
- 10% are active each day: 100,000 daily active users.
- Each active user makes 50 read requests per day.
- Each active user makes 1 write request per day.
- Each stored note averages 2 KB of content and metadata.
- Each active user creates one note per day.
- Ignore attachments, indexes, replicas, backups, and replication overhead in the initial storage estimate.

### Read requests per second

Daily reads:

100,000 users × 50 reads = 5,000,000 reads/day

Average reads per second:

5,000,000 ÷ 86,400 ≈ 57.9 reads/second

### Write requests per second

Daily writes:

100,000 users × 1 write = 100,000 writes/day

Average writes per second:

100,000 ÷ 86,400 ≈ 1.16 writes/second

Actual peak traffic may be several times higher than the daily average, so capacity testing is required.

### Storage per year

Annual new notes:

100,000 notes/day × 365 = 36,500,000 notes/year

Estimated annual note data:

36,500,000 × 2 KB = 73,000,000 KB, or approximately 73 GB using decimal units.

This is a simplified estimate for one year of new notes. Real storage needs will be higher after indexes, database overhead, replicas, backups, and other data are included.

## 4. High-Level Architecture

```text
                         Users / Browsers
                                |
                              DNS
                                |
                         CDN / HTTPS Edge
                                |
                         Load Balancer
                         /             \
                App Server 1         App Server 2
                    |                     |
                    +----------+----------+
                               |
                         Cache (Redis)
                               |
                    +----------+----------+
                    |                     |
              Primary Database       Read Replica
                    |
               Job Queue
                    |
             Background Worker
                    |
          Emails / Cleanup / Other Jobs
```

## 5. Component Responsibilities

- **Users / Browsers:** Display the web interface and send API requests.
- **DNS:** Resolves the application's domain name to the service endpoint.
- **CDN / HTTPS Edge:** Serves cacheable static assets close to users and terminates or forwards secure connections.
- **Load Balancer:** Distributes incoming requests across healthy application servers.
- **Application Servers:** Validate requests, enforce authentication and note ownership, and implement API logic.
- **Redis Cache:** Stores selected frequently read data with expiration rules to reduce database load.
- **Primary Database:** Handles durable writes and the authoritative copy of the data.
- **Read Replica:** Serves eligible read queries to distribute database load; replication lag may mean it is briefly behind the primary.
- **Job Queue:** Holds background work so API requests do not need to wait for every task to finish.
- **Background Worker:** Processes queued work such as notifications, cleanup, and other asynchronous tasks.

## 6. GET /notes Request Flow

1. The browser sends `GET /notes` over HTTPS.
2. DNS resolves the application's domain.
3. The CDN or edge layer forwards the API request to the load balancer.
4. The load balancer selects a healthy application server.
5. The application server validates the access token and checks the user's identity.
6. The server checks the cache for the user's notes and relevant query parameters.
7. If cached data is available and valid, the server returns it; otherwise, it queries the read replica when appropriate, or the primary database when consistency requires it.
8. The server returns a paginated JSON response to the browser.
9. The cache may be populated or refreshed after a database read.

## 7. POST /notes Request Flow

1. The browser sends `POST /notes` with a JSON body and access token.
2. DNS and the edge layer route the request to the load balancer.
3. The load balancer forwards the request to a healthy application server.
4. The server authenticates the user and validates the title and body.
5. The server inserts the note into the primary database in a transaction.
6. After the write succeeds, the server invalidates or updates relevant cached note lists.
7. The server returns `201 Created` with the new note representation.
8. Any optional background work is placed on the job queue for a worker to process asynchronously.

## 8. Trade-Offs

### Cache speed vs consistency

Caching reduces database load and can improve response time. However, cached data can become stale. QuickNotes should invalidate or update affected cache entries after writes and use short expiration times. Requests requiring fresh data should read from the primary database.

### Read replicas vs consistency

Read replicas distribute read traffic and can improve read capacity. However, replication is not always immediate. Newly created or updated notes may not appear on a replica immediately. The application can read from the primary after a write when read-after-write consistency is required.

### More servers vs operational complexity

Multiple application servers improve horizontal scalability and resilience, but add deployment, monitoring, and configuration complexity. Automated health checks and repeatable deployments help manage that complexity.

### Background jobs vs immediate completion

Queues keep slow tasks out of the user's request path, improving responsiveness. They also introduce retry handling, monitoring, and the possibility of duplicate job delivery, so workers should be designed to safely retry work.

## 9. Avoiding Single Points of Failure

- Run at least two application servers across separate failure domains.
- Use a health-checked load balancer and automatically replace unhealthy application instances.
- Deploy redundant DNS and edge infrastructure through a managed provider.
- Configure database backups, point-in-time recovery, and a tested failover plan.
- Use a highly available cache configuration or ensure the application can fall back to the database if caching is unavailable.
- Configure durable queues, retry policies, dead-letter handling, and monitored workers.
- Monitor errors, latency, resource use, replication lag, and backup success.
- Test disaster recovery and failover rather than relying on configuration alone.

The architecture reduces common single points of failure, but actual resilience depends on deployment choices, provider capabilities, monitoring, and regularly tested recovery procedures.
