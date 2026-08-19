# PostgreSQL Setup Guide for Skill Gap Simulator

This guide explains how to set up and use PostgreSQL with the Skill Gap Simulator microservices.

## Overview

The Skill Gap Simulator uses PostgreSQL 15 with the pgvector extension for storing user data, skill information, job descriptions, skill gaps, learning roadmaps, GitHub repository data, and code evaluation results.

## Database Schema

The database schema is defined in `init-db.sql` and includes the following tables:
- `users`: User account information
- `resumes`: Uploaded resume data
- `job_descriptions`: Job description data
- `skills`: Skill taxonomy
- `user_skills`: User skill proficiencies
- `skill_gaps`: Calculated skill gaps between resumes and job descriptions
- `learning_roadmaps`: Generated learning roadmaps
- `github_repos**: GitHub repository analysis data
- `code_evaluations**: Code evaluation results
- `audit_logs**: System audit logs

## Connecting to PostgreSQL from Microservices

Each microservice should connect to the PostgreSQL database using connection parameters defined in environment variables.

### Environment Variables

The following environment variables should be set for each service that needs database access:

```
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=skillgap
POSTGRES_USER=skillgap_user
POSTGRES_PASSWORD=skillgap_pass
```

### Using a PostgreSQL Client

In Node.js services (like the API gateway), you can use the `pg` package:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Example query
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

In Python services, you can use `psycopg2` or `asyncpg`:

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=int(os.getenv("POSTGRES_PORT")),
    database=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD")
)

# Example query
with conn.cursor(cursor_factory=RealDictCursor) as cursor:
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
```

### Using an ORM

For better maintainability, consider using an ORM:
- Node.js: Sequelize or TypeORM
- Python: SQLAlchemy or Pydantic with raw queries

## Migration Strategy

To migrate from the current in-memory/MongoDB implementation to PostgreSQL:

1. Update the API gateway to use PostgreSQL instead of MongoDB
2. Add PostgreSQL clients to each microservice
3. Modify each service to store/retrieve data from PostgreSQL instead of using in-memory structures
4. Update the docker-compose.yml files to include database connection environment variables
5. Test each service to ensure data persistence works correctly

## Benefits of Using PostgreSQL

1. **Data Persistence**: Data survives service restarts
2. **Relational Data Modeling**: Proper relationships between entities
3. **ACID Transactions**: Data consistency and integrity
4. **Horizontal Scaling**: Can be scaled with read replicas
5. **Advanced Features**: pgvector for similarity searches, JSONB for flexible data, etc.
6. **Performance**: Better performance for complex queries and reporting
7. **Maturity**: Well-established, battle-tested database technology

## pgvector Extension

The pgvector extension is used for storing and querying skill embeddings for similarity calculations. This enables efficient skill gap calculations using cosine similarity.

Example usage:
```sql
-- Store skill embeddings
ALTER TABLE skills ADD COLUMN embedding vector(384);

-- Find similar skills
SELECT name, 1 - (embedding <=> '[0.1,0.2,...]'::vector) AS similarity
FROM skills
ORDER BY similarity DESC
LIMIT 10;
```

## Security Considerations

1. Use strong passwords for database users
2. Limit database network exposure (only allow backend services to connect)
3. Regularly backup the database
4. Keep PostgreSQL and extensions updated
5. Use parameterized queries to prevent SQL injection