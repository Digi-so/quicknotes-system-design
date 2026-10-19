# QuickNotes Database Data Model

## 1. Database Choice

QuickNotes uses PostgreSQL, a relational SQL database. Users, notes, and tags have clear relationships, and foreign keys help maintain data integrity.

## 2. Tables and Relationships

### users

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | Primary key |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, defaults to current time |

### notes

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | Primary key |
| user_id | BIGINT | Foreign key to users.id, NOT NULL |
| title | VARCHAR(100) | NOT NULL |
| body | TEXT | NOT NULL, defaults to empty text |
| created_at | TIMESTAMPTZ | NOT NULL, defaults to current time |
| updated_at | TIMESTAMPTZ | NOT NULL, defaults to current time |

### tags

| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | Primary key |
| user_id | BIGINT | Foreign key to users.id, NOT NULL |
| name | VARCHAR(50) | NOT NULL |

### note_tags

| Column | Type | Constraints |
|---|---|---|
| note_id | BIGINT | Foreign key to notes.id, primary-key component |
| tag_id | BIGINT | Foreign key to tags.id, primary-key component |

The `note_tags` table uses a composite primary key made from `(note_id, tag_id)`.

## 3. Relationships

- **Users to notes:** One-to-many. One user can own many notes, but each note belongs to one user.
- **Users to tags:** One-to-many. One user can create many tags.
- **Notes to tags:** Many-to-many. A note can have multiple tags, and a tag can be attached to multiple notes. The `note_tags` junction table represents this relationship.
- Foreign keys protect relationships between records. Deleting a note can remove its `note_tags` rows using `ON DELETE CASCADE`.

## 4. SQL Table Definitions

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## 5. Example SQL Queries

### Query 1: Get all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 7
ORDER BY updated_at DESC;
```

### Query 2: Get one note and its owner's email

```sql
SELECT n.id, n.title, n.body, u.email
FROM notes AS n
JOIN users AS u ON u.id = n.user_id
WHERE n.id = 42 AND n.user_id = 7;
```

### Query 3: List tags attached to a note

```sql
SELECT t.id, t.name
FROM tags AS t
JOIN note_tags AS nt ON nt.tag_id = t.id
WHERE nt.note_id = 42
ORDER BY t.name;
```

### Query 4: Count notes per user

```sql
SELECT u.id, u.email, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

## 6. Indexes

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);

CREATE INDEX idx_note_tags_tag
ON note_tags (tag_id);
```

- `idx_notes_user_updated` helps retrieve one user's notes ordered by most recently updated.
- `idx_note_tags_tag` helps find notes associated with a given tag.
- The primary keys and unique constraints also create indexes in PostgreSQL.

## 7. SQL vs NoSQL

**Decision: PostgreSQL (SQL).**

SQL is a good fit because QuickNotes has structured records, clear relationships, and a need for reliable transactions and constraints. Foreign keys prevent notes and tags from referring to missing records. A NoSQL database could be useful for highly flexible document structures or certain large-scale access patterns, but it would add complexity for these relational requirements. PostgreSQL can scale with indexing, read replicas, connection pooling, and partitioning if needed.
