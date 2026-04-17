# Stucco Material Calculator

Full-stack material estimating and order management for stucco, stone, drywall, and painting contractors.

## Features

- **Multi-supplier pricing** -- track material costs across vendors and compare side-by-side
- **Phase-based calculations** -- Lath, Gray Coat, Color Coat, Stone, Drywall, Painting
- **Job calculator** -- enter square footage, pick phases, see totals with profit/margin
- **Order forms** -- generate printable order sheets filtered by phase or supplier
- **Saved jobs** -- save, load, and revisit past estimates
- **CSV import/export** -- bulk-load pricing or export data for spreadsheets
- **Supplier price comparison** -- see which vendor saves you money on each material
- **Dark/light theme** -- easy on the eyes in the office or on-site

## Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend  | Node.js, Express, SQLite      |
| Auth     | JWT (JSON Web Tokens)         |

## Quick Start

### Frontend Only (no server needed)

Open `frontend/index.html` in any browser. All calculator features work locally -- data is stored in your browser.

### Full Stack (server + database)

```bash
cd backend
cp .env.example .env        # edit .env if needed
npm install
npm start                   # starts server on http://localhost:3000
```

The backend serves the frontend automatically. Open `http://localhost:3000` in your browser.

## Project Structure

```
projects/
  frontend/
    index.html              # main app
    css/                    # stylesheets
    js/                     # app logic, calculators, UI
  backend/
    server.js               # Express server entry point
    routes/                 # API route handlers
    models/                 # SQLite data layer
    data/                   # database file (auto-created)
    .env                    # environment config (not committed)
  docs/
    SETUP.md                # installation & setup
    API.md                  # REST API reference
    USER_GUIDE.md           # how to use the app
```

## Documentation

- [Setup & Installation](docs/SETUP.md)
- [API Reference](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
