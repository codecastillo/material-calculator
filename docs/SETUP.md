# Setup & Installation

## Prerequisites

- **Node.js 18+** -- download from [nodejs.org](https://nodejs.org)
- **npm** -- comes with Node.js

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

Edit `.env` and set a real secret key:

```
PORT=3000
JWT_SECRET=pick-something-random-here
DB_PATH=./data/calculator.db
CORS_ORIGIN=http://localhost:5500
```

### 3. Start the server

```bash
npm start
```

The server starts on `http://localhost:3000` and serves the frontend automatically.

## Environment Variables

| Variable      | What it does                                     | Default                 |
| ------------- | ------------------------------------------------ | ----------------------- |
| `PORT`        | Port the server runs on                          | `3000`                  |
| `JWT_SECRET`  | Secret key for login tokens -- keep this private | (none -- must be set)   |
| `DB_PATH`     | Path to the SQLite database file                 | `./data/calculator.db`  |
| `CORS_ORIGIN` | Allowed origin for cross-origin requests         | `http://localhost:5500` |

## Database

The SQLite database is created automatically the first time you start the server. No manual setup needed. The file lives at the path you set in `DB_PATH` (default: `backend/data/calculator.db`).

### Seeding Default Data

On first run, the server seeds the database with:

- Default material categories (Lath, Gray Coat, Color Coat, Stone, Drywall, Painting)
- Common materials for each category with typical coverage ratios
- A sample supplier entry

To reset to defaults, stop the server, delete the database file, and restart:

```bash
rm backend/data/calculator.db
npm start
```
