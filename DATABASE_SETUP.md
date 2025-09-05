# Database Setup Instructions

## Option 1: Direct PostgreSQL Connection

You need to run the SQL migration script directly on your PostgreSQL database. Here are your options:

### Method 1: Using Railway CLI
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Connect to your database: `railway connect postgres`
4. Run the migration script from `migrations/001_initial_schema.sql`

### Method 2: Using Database URL
If you have the PostgreSQL connection URL, you can use the Node.js script below.

## Option 2: Automated Setup Script

Run the database setup script:

```bash
npm run setup-db
```

This will execute the `scripts/setup-database.js` file.

## What Gets Created

The migration creates:
- **Enum Types**: `session_status`, `connection_status`
- **Tables**: `sessions`, `players`, `game_results`
- **Indexes**: For better query performance
- **Functions**: `create_session`, `join_session`, `get_session_details`, etc.
- **Triggers**: Auto-update timestamps

## Testing the Setup

After running the migration, you can test that it worked by checking your PostgREST API:

```bash
curl https://postgrestpostgrest-production-dd5b.up.railway.app/sessions
```

You should see an empty array `[]` instead of an error, which means the table exists.

## Required Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=your_postgresql_connection_string
POSTGREST_URL=https://postgrestpostgrest-production-dd5b.up.railway.app
```
