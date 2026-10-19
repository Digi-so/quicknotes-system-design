# QuickNotes REST API Design

## 1. Overview

Base URL: `https://api.quicknotes.example/v1`

The API uses REST conventions and JSON request and response bodies. Authenticated endpoints require a valid bearer token.

## 2. Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| POST | `/auth/login` | Authenticate a user and return an access token | 200 OK |
| GET | `/notes` | List the authenticated user's notes; supports pagination and search | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| GET | `/notes/{noteId}` | Retrieve one note by ID | 200 OK |
| PATCH | `/notes/{noteId}` | Update selected fields of a note | 200 OK |
| DELETE | `/notes/{noteId}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/notes/{noteId}/tags` | Attach a tag to a note | 201 Created |

## 3. Example: Create a Note

Request:

`POST /v1/notes`

Headers:

`Content-Type: application/json`

`Authorization: Bearer <access-token>`

Request body:

```json
{
  "title": "Study plan",
  "body": "Review REST APIs and database design."
}
```

Successful response — `201 Created`:

```json
{
  "id": 42,
  "userId": 7,
  "title": "Study plan",
  "body": "Review REST APIs and database design.",
  "createdAt": "2026-10-19T09:00:00Z",
  "updatedAt": "2026-10-19T09:00:00Z"
}
```

## 4. Example: List Notes

Request:

`GET /v1/notes?page=1&limit=10`

Successful response — `200 OK`:

```json
{
  "items": [
    {
      "id": 42,
      "title": "Study plan",
      "body": "Review REST APIs and database design."
    },
    {
      "id": 43,
      "title": "Shopping list",
      "body": "Milk, bread, and fruit."
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 2
}
```

## 5. Error Responses

The API returns a suitable HTTP status code and a JSON error body.

### 400 Bad Request

The request contains invalid fields, a missing title, or malformed JSON.

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "The title field is required."
  }
}
```

### 401 Unauthorized

The user is not authenticated or the access token is invalid.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

### 403 Forbidden

The authenticated user does not have permission to perform the action.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource."
  }
}
```

### 404 Not Found

The requested note or other resource does not exist or is not available to the user.

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested note was not found."
  }
}
```

### 500 Internal Server Error

An unexpected server-side problem occurred.

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

## 6. API Design Decisions

- Use nouns such as `/notes` and `/tags` for resource paths.
- Use HTTP methods to express actions: GET to read, POST to create, PATCH to update, and DELETE to remove.
- Use JSON for request and response bodies.
- Require authentication for private user data.
- Validate input on the server and return consistent error objects.
- Use pagination to avoid returning every note in a single response.
- Check ownership so users cannot access or modify another user's notes.
