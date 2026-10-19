# QuickNotes System Design

QuickNotes is a note-taking application project that demonstrates frontend API integration and backend system design. The project includes a browser-based interface, REST API documentation, a relational database model, and a scalable architecture proposal.

## Features

- Load and display notes from a REST API.
- Create notes using a form with title validation.
- Delete notes from the current interface.
- Display loading, success, empty, and error states.
- Document REST endpoints and JSON request/response examples.
- Design a PostgreSQL data model with relationships, indexes, and SQL queries.
- Propose a scalable architecture for a system with one million registered users.

## Important API Note

The frontend uses JSONPlaceholder (`https://jsonplaceholder.typicode.com/posts`) as a demonstration API. Its create and delete endpoints simulate changes rather than permanently saving them. This project is a learning prototype, not a production-ready note service.

## How to Run the Client

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a browser.

For a more reliable local development experience, start a simple HTTP server in the project folder if Python is installed:

```bash id="o0f2jb"
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

An internet connection is required for the frontend to call JSONPlaceholder. No backend server or database is configured by this prototype.

## Project Documentation

- [REST API Design](docs/api-design.md)
- [Database Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## Technologies Used

- HTML5
- CSS3
- JavaScript Fetch API
- REST and JSON
- PostgreSQL and SQL design
- Git and GitHub

## What I Learned

1. How to use asynchronous JavaScript and Fetch to make HTTP requests and handle errors.
2. How REST endpoints, HTTP methods, status codes, and JSON responses fit together.
3. How relational tables, primary keys, foreign keys, and join tables model data.
4. How SQL queries and indexes support common application operations.
5. How load balancers, caching, read replicas, and background queues can support scalability.
6. Why trade-offs such as caching versus consistency matter when designing distributed systems.

## Project Status

This is an educational capstone project. The frontend demonstrates API operations against a mock REST service, while the documentation describes a proposed production architecture.
