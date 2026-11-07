# Architecture Decisions

This document records key architectural and technical decisions made for the Karachi Bites backend.

---

## 1. Database: SQLite with WAL Mode

**Decision:** Use SQLite instead of PostgreSQL or MongoDB.

**Rationale:**
- **Simplicity**: Zero configuration, no separate server process
- **Persistence**: File-based storage survives server restarts
- **Portability**: Single file can be copied, backed up, or version-controlled
- **Performance**: WAL (Write-Ahead Logging) mode provides good concurrent read performance
- **Educational**: Easier for students to understand and debug

**Trade-offs:**
- Not suitable for high-concurrency production workloads (>100 concurrent writes)
- No built-in replication or clustering
- Single-writer limitation (mitigated by WAL mode for readers)

**Configuration:**
```javascript
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
```

---

## 2. Authentication: JWT + TOTP 2FA

**Decision:** Use JWT access tokens with optional TOTP-based two-factor authentication.

**Rationale:**
- **Stateless**: JWT tokens don't require server-side session storage
- **Security**: TOTP (RFC 6238) is industry standard for 2FA
- **Compatibility**: Works with Google Authenticator, Authy, and other standard apps
- **Recovery**: Backup codes provide account recovery if authenticator is lost

**Implementation:**
- Access tokens: 1-hour expiry (configurable)
- Pending tokens: 10-minute expiry (for 2FA verification)
- Password hashing: bcrypt with 12 rounds
- TOTP secrets: Stored in database, never exposed via API
- Backup codes: SHA-256 hashed, single-use

**Flow:**
1. Login with username/password
2. If 2FA enabled: receive pending token
3. Verify with TOTP code → receive access token
4. Use access token for admin endpoints

---

## 3. Price Calculation: Server-Side Only

**Decision:** All prices and totals are calculated on the backend. Frontend sends only `menuItemId` and `quantity`.

**Rationale:**
- **Security**: Prevents price manipulation attacks
- **Consistency**: Single source of truth for pricing
- **Auditability**: Order records include exact prices at time of purchase
- **Simplicity**: Frontend doesn't need to maintain price state

**Implementation:**
```javascript
// Frontend sends:
{
  "items": [
    { "menuItemId": 1, "quantity": 2 }
  ]
}

// Backend calculates:
const menuItem = db.get('SELECT price FROM menu_items WHERE id = ?', menuItemId);
const lineTotal = menuItem.price * quantity;
```

**Trade-off:** Requires an extra database query per order item, but this is negligible for typical order sizes (<20 items).

---

## 4. Order Status: Strict Linear Progression

**Decision:** Orders follow a fixed sequence: `Received → Preparing → Out for Delivery → Delivered`

**Rationale:**
- **Simplicity**: Easy to understand and implement
- **Predictability**: Clear workflow for staff
- **Validation**: Server enforces valid transitions, prevents invalid states

**Implementation:**
```javascript
const STATUSES = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
const currentIdx = STATUSES.indexOf(currentStatus);
const nextIdx = STATUSES.indexOf(nextStatus);

if (nextIdx !== currentIdx + 1) {
  throw new BadRequestError('Invalid status transition');
}
```

**Rejected alternatives:**
- **State machine with arbitrary transitions**: Too complex for this use case
- **Parallel statuses** (e.g., "Preparing" + "Payment Pending"): Not required by spec

---

## 5. Input Validation: Centralized in Services

**Decision:** Validation logic lives in service layer, not controllers or middleware.

**Rationale:**
- **Reusability**: Services can be called from multiple controllers or tests
- **Testability**: Easier to unit test validation without HTTP overhead
- **Separation of concerns**: Controllers handle HTTP, services handle business logic

**Structure:**
```
Controller → Service → Database
     ↓           ↓
   HTTP      Validation
```

**Example:**
```javascript
// controller
async function create(req, res, next) {
  const { errors, data } = validateOrderPayload(req.body);
  if (errors.length) throw new BadRequestError(errors.join('; '));
  const result = orderService.createOrder(data);
  res.status(201).json(result);
}

// service
function createOrder({ customerName, mobile, ... }) {
  // Business logic validation (e.g., menu item exists and is available)
  const menuItem = menuService.getById(id);
  if (!menuItem.available) throw new BadRequestError('Item unavailable');
}
```

---

## 6. Rate Limiting: Tiered by Endpoint Sensitivity

**Decision:** Different rate limits for different endpoint types.

**Limits:**
- **Login**: 10 attempts / 15 minutes (per username+IP)
- **2FA verification**: 20 attempts / 15 minutes (per IP)
- **Order creation**: 10 orders / minute (per IP)
- **General API**: 120 requests / minute (per IP)

**Rationale:**
- **Security**: Prevents brute-force attacks on authentication
- **Fairness**: Prevents single user from monopolizing resources
- **Usability**: Generous limits for normal usage patterns

**Implementation:**
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip + ':' + (req.body?.username || ''),
});
```

---

## 7. Error Handling: Typed Errors with JSON Responses

**Decision:** Use custom error classes with consistent JSON error format.

**Format:**
```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

**Rationale:**
- **Consistency**: All errors follow the same structure
- **Debugging**: Error codes make it easy to search logs and documentation
- **Frontend integration**: Predictable error format simplifies client-side handling
- **Security**: Stack traces never exposed to clients

**Error Classes:**
```javascript
class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}
```

**Middleware:**
```javascript
function errorHandler(err, req, res, next) {
  const message = err.isOperational ? err.message : 'Internal server error';
  res.status(err.statusCode || 500).json({ error: message, code: err.code });
}
```

---

## 8. CORS: Configurable via Environment

**Decision:** CORS origins configured via `FRONTEND_ORIGIN` environment variable.

**Rationale:**
- **Security**: Prevents unauthorized cross-origin requests
- **Flexibility**: Different origins for development, staging, production
- **Simplicity**: Single environment variable, comma-separated for multiple origins

**Implementation:**
```javascript
const allowedOrigins = config.frontendOrigin.split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 9. Folder Structure: Feature-Based Organization

**Decision:** Organize code by feature/layer, not by file type.

**Structure:**
```
src/
  config/          # Environment and app configuration
  db/              # Database connection and migrations
  middleware/      # Express middleware (auth, rate limiting, errors)
  routes/          # Route definitions
  controllers/     # Request handlers
  services/        # Business logic
  utils/           # Shared helpers
```

**Rationale:**
- **Discoverability**: Related code is colocated
- **Scalability**: Easy to add new features without restructuring
- **Separation of concerns**: Clear boundaries between layers

**Rejected alternative:**
- **File-type organization** (all controllers in one folder, all services in another): Harder to navigate as project grows

---

## 10. Testing: In-Memory Database for Isolation

**Decision:** Tests use `:memory:` SQLite database for fast, isolated test runs.

**Rationale:**
- **Speed**: No disk I/O overhead
- **Isolation**: Each test run starts with a clean database
- **Simplicity**: No test database setup or cleanup required

**Implementation:**
```javascript
// test/api.test.js
process.env.DB_PATH = ':memory:';

before(async () => {
  migrate();
  seedMenu();
  // ...
});
```

**Trade-off:** Cannot test database persistence across process restarts. For production-like testing, use a file-based database in a temporary directory.

---

## 11. Admin Setup: Interactive Script

**Decision:** Use interactive CLI script (`scripts/setup-admin.js`) for initial admin creation.

**Rationale:**
- **Security**: No hardcoded credentials in source code
- **Flexibility**: Credentials can come from environment or interactive prompts
- **Simplicity**: Single command to initialize the system

**Usage:**
```bash
# Via environment variables
ADMIN_USERNAME=admin ADMIN_PASSWORD=securepass npm run setup-admin

# Interactive prompts
npm run setup-admin
# → Admin username: admin
# → Admin password (min 10 chars): ********
```

**Rejected alternatives:**
- **Auto-generated credentials**: Hard to communicate securely
- **Web-based setup wizard**: Adds complexity, potential security risk if left enabled

---

## 12. Order ID Format: Human-Readable with Timestamp

**Decision:** Order IDs follow format `KB-{TIMESTAMP}-{RANDOM}`

**Example:** `KB-M5X2K8A-7F3B9E`

**Rationale:**
- **Human-readable**: Easy to communicate over phone/email
- **Sortable**: Timestamp component provides chronological ordering
- **Unique**: Random component prevents collisions
- **Compact**: Shorter than UUID, easier to type

**Implementation:**
```javascript
function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `KB-${ts}-${rand}`;
}
```

**Rejected alternatives:**
- **UUID**: Too long for verbal communication
- **Auto-increment**: Predictable, reveals order volume
- **Pure random**: No chronological ordering

---

## 13. Mobile Number Validation: Pakistani Format

**Decision:** Validate and normalize Pakistani mobile numbers.

**Accepted formats:**
- `03001234567` (local)
- `+923001234567` (international)
- `923001234567` (without +)
- `0300-1234567` (with separator)

**Normalization:** All numbers stored as `03xxxxxxxxx` (11 digits, leading 0).

**Rationale:**
- **Consistency**: Single format in database
- **Validation**: Ensures numbers are reachable
- **User experience**: Accepts multiple input formats

**Implementation:**
```javascript
const PAKISTANI_MOBILE_REGEX = /^(\+92|0)?3[0-9]{2}[ -]?[0-9]{7}$/;

function normalizeMobile(raw) {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (!PAKISTANI_MOBILE_REGEX.test(digits)) return null;
  
  if (digits.startsWith('+92')) return '0' + digits.slice(3);
  if (digits.startsWith('92')) return '0' + digits.slice(2);
  if (!digits.startsWith('0')) return '0' + digits;
  return digits;
}
```

---

## 14. Delivery Charge: Configurable Default

**Decision:** Delivery charge is configurable via `DELIVERY_CHARGE` environment variable, default Rs. 150.

**Rationale:**
- **Flexibility**: Can adjust without code changes
- **Consistency**: Single source of truth
- **Transparency**: Charge is stored with each order (allows historical tracking if charge changes)

**Implementation:**
```javascript
// config/index.js
delivery: {
  charge: parseInt(process.env.DELIVERY_CHARGE || '150', 10),
}

// orderService.js
const deliveryCharge = config.delivery.charge;
const total = subtotal + deliveryCharge;
```

---

## 15. CSV Export: Synchronous Generation

**Decision:** Generate CSV synchronously in-memory for export endpoint.

**Rationale:**
- **Simplicity**: No temporary files or streaming complexity
- **Performance**: Typical order volumes (<1000) generate quickly
- **Correctness**: Synchronous generation ensures complete data

**Implementation:**
```javascript
const { stringify } = require('csv-stringify/sync');

function ordersToCsv(orders) {
  const rows = orders.map(order => ({
    order_id: order.id,
    customer_name: order.customer_name,
    // ...
  }));
  return stringify(rows, { header: true });
}
```

**Trade-off:** Not suitable for very large exports (>10,000 orders). For production systems with high volume, consider streaming CSV generation with pagination.

---

## Future Considerations

These decisions were not implemented but could be added in future iterations:

1. **Pagination**: Add `limit` and `offset` to list endpoints for large datasets
2. **Soft deletes**: Mark menu items as deleted instead of removing them
3. **Audit log**: Track all admin actions (who changed what, when)
4. **Webhooks**: Notify external systems of order status changes
5. **Multi-language support**: i18n for menu items and error messages
6. **Image uploads**: Add menu item photos with cloud storage
7. **Email notifications**: Send order confirmations and status updates
8. **Payment integration**: Online payment processing (Stripe, JazzCash, EasyPaisa)
9. **Real-time updates**: WebSocket for live order tracking
10. **Analytics dashboard**: Sales reports, popular items, peak hours
