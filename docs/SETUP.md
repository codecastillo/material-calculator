# Setup & Installation

## Prerequisites

- **Node.js 18+**: download from [nodejs.org](https://nodejs.org)
- **npm**: comes with Node.js

Check your versions:

```bash
node -v    # should be 18.x or higher
npm -v
```

## Frontend Only (Quickest Option)

No installation needed. Just open `frontend/index.html` in your browser. Everything runs locally in the browser with no server required. Your data is saved in the browser's local storage.

## Full Stack Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials and other settings:

```
PORT=3000
JWT_SECRET=pick-something-random-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
CORS_ORIGIN=http://localhost:5500
```

### 3. Start the server

```bash
npm start
```

The server starts on `http://localhost:3000` and serves the frontend automatically.

## Environment Variables

| Variable               | What it does                               | Default                 |
| ---------------------- | ------------------------------------------ | ----------------------- |
| `PORT`                 | Port the server runs on                    | `3000`                  |
| `JWT_SECRET`           | Secret key for login tokens (keep private) | (none, must be set)     |
| `SUPABASE_URL`         | Your Supabase project URL                  | (none, must be set)     |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key             | (none, must be set)     |
| `CORS_ORIGIN`          | Allowed origin for cross-origin requests   | `http://localhost:5500` |

## Database

The app uses Supabase as the backend database. Tables are created automatically when you start the server. Make sure your Supabase credentials are set in `.env` before running.

### Seeding Default Data

On first run, the server seeds the database with:

- Default material categories (Lath, Gray Coat, Color Coat, Stone, Drywall, Painting)
- Common materials for each category with typical coverage ratios
- A sample supplier entry

To reset to defaults, manually delete the relevant tables in Supabase and restart the server.
