# Karachi Bites — Backend

Online restaurant ordering system for Karachi Bites with branches in **Clifton**, **Gulshan-e-Iqbal**, and **North Nazimabad**.

## Backend Features

- **Menu API** — Browse available items with categories, prices, tags, and availability
- **Order System** — Create orders with server-side price calculation and delivery charge (Rs. 150)
- **Order Tracking** — Customers track orders by ID with optional phone verification
- **Staff Authentication** — JWT login with optional TOTP 2FA
- **Admin Dashboard API** — List orders (filterable by branch/date), update status, export CSV
- **Menu Management** — Admin CRUD for menu items (add, edit, hide/disable)
- **Security** — Password hashing (bcrypt), rate limiting, Helmet, CORS, input validation

## Technology Stack

- **Runtime:** Node.js >= 22.0.0
- **Framework:** Express.js 4.x
- **Database:** SQLite (WAL mode, file-based persistence)
- **Authentication:** JWT tokens + optional TOTP 2FA (RFC 6238)
- **Testing:** Node built-in test runner + supertest
- **Security:** Helmet, CORS, express-rate-limit, bcryptjs

## Prerequisites

- Node.js 22+ installed
- npm (comes with Node.js)

## Installation

```bash
cd karachi-bites
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Required variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (test/development/production) |
| `FRONTEND_ORIGIN` | `http://localhost:5500` | Allowed CORS origin(s), comma-separated |
| `JWT_SECRET` | _(dev default)_ | JWT signing key — **must be changed in production** |
| `JWT_EXPIRES_IN` | `1h` | Token expiry |
| `ADMIN_USERNAME` | `admin` | Initial admin username (used by setup-admin script) |
| `ADMIN_PASSWORD` | _(dev default)_ | Initial admin password — **must be changed** |
| `TOTP_ISSUER` | `KarachiBites` | TOTP issuer name |
| `DELIVERY_CHARGE` | `150` | Delivery charge in PKR |
| `DB_PATH` | `./data/karachi-bites.db` | SQLite database path |

> **Never commit `.env` or real secrets.** The `.gitignore` excludes `.env` and all `*.db` files.

## Database Initialization

Database schema is applied automatically on server start via `src/db/migrate.js`. Menu seed data is also applied on startup if the seed version has changed (idempotent — uses UPSERT).

To manually re-seed or run migrations:

```bash
npm run migrate    # Apply schema only
npm run seed       # Apply schema + re-seed menu
```

## Seed Data

The system seeds 12 menu items matching the assignment specification:

| ID | Item | Category | Price (Rs.) | Tag |
|---:|---|---|---:|---|
| 1 | Chicken Malai Boti | BBQ | 850 | mild |
| 2 | Beef Seekh Kebab | BBQ | 780 | spicy |
| 3 | Mutton Karahi (half) | Karahi | 1650 | spicy |
| 4 | Chicken Karahi (half) | Karahi | 1250 | spicy |
| 5 | Chicken Biryani | Rice | 550 | spicy |
| 6 | Vegetable Pulao | Rice | 420 | veg |
| 7 | Zinger Paratha Roll | Rolls | 450 | spicy |
| 8 | Paneer Tikka Roll | Rolls | 480 | veg |
| 9 | Mint Margarita | Drinks | 220 | veg |
| 10 | Doodh Patti Chai | Drinks | 150 | veg |
| 11 | Gulab Jamun (2 pcs) | Desserts | 250 | veg |
| 12 | Kheer | Desserts | 300 | veg |

**Note:** Existing orders are preserved. If menu prices change, older orders retain their original prices (historical snapshot stored at order time).

## Running the Server

```bash
npm start          # Production mode
npm run dev        # Development with auto-restart
```

Server starts on `http://localhost:${PORT}` (default port 3000).

## Running Tests

```bash
npm test
```

Tests run against an in-memory SQLite database for isolation. All tests use `:memory:` DB and seed fresh data per suite.

## Staff Account Initialization

Create the first admin account:

```bash
# Via environment variables
ADMIN_USERNAME=admin ADMIN_PASSWORD=YourStrongPassword123 npm run setup-admin

# Or interactively
npm run setup-admin
```

After initial login, enable 2FA:

```bash
# 1. Get Bearer token from POST /api/auth/login
# 2. Enroll:
POST /api/auth/2fa/enroll   (Authorization: Bearer <token>)
# 3. Confirm with authenticator code:
POST /api/auth/2fa/confirm  { "token": "123456" }
# Save the 8 backup codes displayed after confirmation.
```

## API Documentation

See [API.md](./API.md) for complete endpoint documentation with request/response examples.

## Deployment Considerations

- **Database persistence:** SQLite data lives in the file specified by `DB_PATH`. Ensure this path is on **persistent storage** — ephemeral filesystems (common on some PaaS platforms) will lose data on restart.
- **Environment variables:** Supply `JWT_SECRET` (32+ random chars) and `ADMIN_PASSWORD` in production. Never use defaults.
- **CORS:** Set `FRONTEND_ORIGIN` to your deployed frontend URL (comma-separated for multiple origins).
- **Node.js version:** Requires Node.js 22+ for `node:sqlite` `DatabaseSync` support.

## Known Limitations

- SQLite is not suitable for high-concurrency write workloads (>100 concurrent writes). For production scale, consider migrating to PostgreSQL.
- No pagination on `GET /api/admin/orders` (current limit: 500 results).
- Order tracking rate limit is 30 requests/minute per IP.
- Test mode disables HTTP rate limiters (express-rate-limit) to prevent cross-file test interference. Account lockout logic is still tested separately.

## Project Structure

```
src/
  app.js              Express app setup (middleware, routes)
  config/             Environment configuration
  controllers/        Request handlers
  db/                 Database connection, migrations, seed
  middleware/         Auth, rate limiting, error handling
  routes/             Route definitions
  services/           Business logic
  utils/              Helpers (auth, validation, CSV, IDs)
scripts/
  migrate.js          Run migrations
  seed-menu.js        Re-seed menu items
  setup-admin.js      Create initial admin account
test/
  api.test.js         Main test suite (original tests)
  api.new.test.js     New tests (seed exactness, phone verification, etc.)
```
