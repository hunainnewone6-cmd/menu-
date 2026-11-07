# Karachi Bites API Documentation

Base URL: `http://localhost:3000`

All responses are JSON unless otherwise noted.

---

## Public Endpoints

### GET /api/menu

Returns all available menu items.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Chicken Biryani",
    "category": "Rice",
    "price": 350,
    "tags": ["spicy", "popular"],
    "available": true
  }
]
```

**Status Codes:**
- `200 OK` - Success

---

### POST /api/orders

Create a new order. Prices and totals are calculated server-side.

**Request Body:**

The endpoint accepts either a **flat** shape or a **nested** `customer` object:

```json
// Flat shape
{
  "customerName": "Ali Khan",
  "mobile": "03001234567",
  "address": "House 12, Block A, Clifton",
  "branch": "Clifton",
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 3, "quantity": 1 }
  ]
}

// Nested shape (assignment example)
{
  "customer": {
    "name": "Ali Khan",
    "phone": "03001234567",
    "address": "Karachi, Pakistan"
  },
  "branch": "Clifton",
  "items": [
    { "menuItemId": 1, "quantity": 2 }
  ]
}
```

**Field Validation:**
- `customerName` or `customer.name`: Required, max 80 chars
- `mobile` or `customer.phone`: Required, Pakistani format (03xx-xxxxxxx or +92-3xx-xxxxxxx)
- `address` or `customer.address`: Required, max 300 chars
- `branch`: Required, one of: "Clifton", "Gulshan-e-Iqbal", "North Nazimabad"
- `items`: Required, non-empty array
  - `menuItemId`: Required, positive integer
  - `quantity`: Required, integer 1-50

> ⚠️ The server always reads prices from the database and calculates totals. Client-supplied prices are ignored.

**Response (201 Created):**

```json
{
  "orderId": "KB-M5X2K8A-7F3B9E",
  "total": 1150,
  "status": "Received"
}
```

**Total Calculation:**
- Subtotal: Sum of (item price × quantity)
- Delivery charge: Rs. 150 (configurable)
- Total: Subtotal + Delivery charge

**Status Codes:**
- `201 Created` - Order created successfully
- `400 Bad Request` - Invalid input
- `429 Too Many Requests` - Rate limit exceeded (10 orders/minute per IP)

**Example Error:**

```json
{
  "error": "customerName is required; mobile must be a valid Pakistani mobile number",
  "code": "INVALID_ORDER"
}
```

---

### GET /api/orders/:id

Retrieve order status and details. Does not expose customer PII.

**Query Parameters:**
- `mobile` (optional): Pakistani mobile number for phone verification. When provided and matching the order's stored phone, protected details are revealed. When absent or mismatched, the order is returned without PII or returns 404 respectively.

**Response (200 OK):**

```json
{
  "orderId": "KB-M5X2K8A-7F3B9E",
  "status": "Preparing",
  "branch": "Clifton",
  "createdAt": "2026-10-28T10:30:00Z",
  "updatedAt": "2026-10-28T10:35:00Z",
  "items": [
    {
      "name": "Chicken Biryani",
      "quantity": 2,
      "price": 350,
      "lineTotal": 700
    }
  ],
  "subtotal": 700,
  "deliveryCharge": 150,
  "total": 850
}
```

> **Note:** The response field is `orderId` (not `id`). Dates are in ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`). Customer PII (`customerName`, `mobile`) is never exposed on this public endpoint.

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Order ID does not exist or mobile mismatch

---

## Authentication

### POST /api/auth/login

Authenticate admin user. Returns access token or 2FA pending token.

**Request Body:**

```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200 OK, 2FA disabled):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (202 Accepted, 2FA enabled):**

```json
{
  "requires2FA": true,
  "pendingToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "2FA verification required"
}
```

**Status Codes:**
- `200 OK` - Login successful, access token returned
- `202 Accepted` - Login successful, 2FA verification required
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials or account locked
- `429 Too Many Requests` - Rate limit exceeded (10 attempts/15 min)

**Rate Limiting:**
- 10 login attempts per 15 minutes per username+IP
- After 5 failed attempts: 15-minute account lockout

---

### POST /api/auth/verify-2fa

Complete 2FA verification after login.

**Request Headers:**

```
Authorization: Bearer PENDING_TOKEN
```

**Request Body:**

```json
{
  "token": "123456"
}
```

Or using a backup code:

```json
{
  "token": "abcdef12",
  "useBackupCode": true
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Verification successful, access token returned
- `400 Bad Request` - Missing token
- `401 Unauthorized` - Invalid TOTP code or backup code
- `429 Too Many Requests` - Rate limit exceeded (20 attempts/15 min)

---

## Admin Endpoints

All admin endpoints require a valid Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### GET /api/admin/orders

List orders with optional filters.

**Query Parameters:**
- `branch` (optional): Filter by branch name
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Example:**

```
GET /api/admin/orders?branch=Clifton&date=2026-10-28
```

**Response (200 OK):**

```json
{
  "count": 15,
  "orders": [
    {
      "id": "KB-M5X2K8A-7F3B9E",
      "customer_name": "Ali Khan",
      "mobile": "03001234567",
      "address": "House 12, Block A, Clifton",
      "branch": "Clifton",
      "status": "Preparing",
      "subtotal": 700,
      "delivery_charge": 150,
      "total": 850,
      "created_at": "2026-10-28T10:30:00.000Z",
      "updated_at": "2026-10-28T10:35:00.000Z",
      "items": [
        {
          "menuItemId": 1,
          "name": "Chicken Biryani",
          "price": 350,
          "quantity": 2
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid branch or date format
- `401 Unauthorized` - Missing or invalid token

---

### PATCH /api/admin/orders/:id/status

Update order status. Enforces strict progression.

**Request Body:**

```json
{
  "status": "Preparing"
}
```

**Allowed Transitions:**

```
Received → Preparing
Preparing → Out for Delivery
Out for Delivery → Delivered
```

**Response (200 OK):**

```json
{
  "id": "KB-M5X2K8A-7F3B9E",
  "status": "Preparing",
  "branch": "Clifton",
  "createdAt": "2026-10-28T10:30:00.000Z",
  "updatedAt": "2026-10-28T10:35:00.000Z",
  "items": [...],
  "subtotal": 700,
  "deliveryCharge": 150,
  "total": 850
}
```

**Status Codes:**
- `200 OK` - Status updated
- `400 Bad Request` - Invalid transition or status value
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Order ID does not exist

**Example Error:**

```json
{
  "error": "cannot transition from \"Preparing\" to \"Delivered\". Allowed next status: \"Out for Delivery\"",
  "code": "INVALID_STATUS_TRANSITION"
}
```

---

### GET /api/admin/orders/export.csv

Export orders as CSV file.

**Query Parameters:**
- `branch` (optional): Filter by branch
- `date` (optional): Filter by date

**Response Headers:**

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="orders-1698487200000.csv"
```

**Response Body:**

```csv
order_id,customer_name,mobile,address,branch,items,subtotal,delivery_charge,total,status,created_at
KB-M5X2K8A-7F3B9E,Ali Khan,03001234567,House 12 Block A Clifton,Clifton,Chicken Biryani x2;Chicken Karahi x1,1500,150,1650,Preparing,2026-10-28T10:30:00.000Z
```

---

### GET /api/menu/admin

List all menu items (including unavailable).

**Query Parameters:**
- `includeHidden` (optional): "true" (default) or "false"

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Chicken Biryani",
    "category": "Rice",
    "price": 350,
    "tags": ["spicy", "popular"],
    "available": true,
    "createdAt": "2026-10-28T08:00:00.000Z",
    "updatedAt": "2026-10-28T08:00:00.000Z"
  }
]
```

---

### POST /api/menu/admin

Create a new menu item.

**Request Body:**

```json
{
  "name": "Mutton Karahi",
  "category": "Curry",
  "price": 1200,
  "tags": "spicy,signature",
  "available": true
}
```

**Field Validation:**
- `name`: Required, max 100 chars
- `category`: Required, max 50 chars
- `price`: Required, positive number (rounded to integer)
- `tags`: Optional, comma-separated string, max 200 chars
- `available`: Optional, boolean (default: true)

**Response (201 Created):**

```json
{
  "id": 13,
  "name": "Mutton Karahi",
  "category": "Curry",
  "price": 1200,
  "tags": ["spicy", "signature"],
  "available": true,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T12:00:00.000Z"
}
```

---

### PATCH /api/menu/admin/:id

Update an existing menu item.

**Request Body** (partial update, include only fields to change):

```json
{
  "price": 400,
  "available": false
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "Chicken Biryani",
  "category": "Rice",
  "price": 400,
  "tags": ["spicy", "popular"],
  "available": false,
  "createdAt": "2026-10-28T08:00:00.000Z",
  "updatedAt": "2026-10-28T12:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Updated successfully
- `400 Bad Request` - Invalid fields or no fields provided
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Menu item ID does not exist

---

## 2FA Management

### POST /api/auth/2fa/enroll

Start 2FA enrollment process.

**Response (200 OK):**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "otpAuthUrl": "otpauth://totp/KarachiBites:admin?secret=JBSWY3DPEHPK3PXP&issuer=KarachiBites"
}
```

Scan the QR code with an authenticator app, then confirm with `/api/auth/2fa/confirm`.

---

### POST /api/auth/2fa/confirm

Confirm 2FA enrollment with a valid TOTP code.

**Request Body:**

```json
{
  "token": "123456"
}
```

**Response (200 OK):**

```json
{
  "message": "2FA enabled successfully",
  "backupCodes": [
    "a1b2c3d4",
    "e5f6g7h8",
    "i9j0k1l2",
    "m3n4o5p6",
    "q7r8s9t0",
    "u1v2w3x4",
    "y5z6a7b8",
    "c9d0e1f2"
  ]
}
```

**Save these backup codes in a secure location.** Each code can be used once if you lose access to your authenticator app.

---

### POST /api/auth/2fa/disable

Disable 2FA (requires current TOTP code).

**Request Body:**

```json
{
  "token": "654321"
}
```

**Response (200 OK):**

```json
{
  "message": "2FA disabled"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `INVALID_TOKEN` | 401 | Invalid or expired JWT |
| `ACCOUNT_LOCKED` | 401 | Too many failed login attempts |
| `INVALID_TOTP` | 401 | Invalid 2FA code |
| `INVALID_STATUS_TRANSITION` | 400 | Order status change not allowed |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 10 requests | 15 minutes (per username+IP) |
| POST /api/auth/verify-2fa | 20 requests | 15 minutes (per IP) |
| POST /api/orders | 10 requests | 1 minute (per IP) |
| All other endpoints | 120 requests | 1 minute (per IP) |

Rate limit headers are included in responses:

```
RateLimit-Limit: 10
RateLimit-Remaining: 7
RateLimit-Reset: 1698487800
```

---

## Authentication Flow

### Without 2FA:

```
1. POST /api/auth/login {username, password}
   → 200 OK {token}

2. Use token in Authorization header:
   Authorization: Bearer {token}
```

### With 2FA:

```
1. POST /api/auth/login {username, password}
   → 202 Accepted {requires2FA: true, pendingToken}

2. POST /api/auth/verify-2fa (with pendingToken) {token: "123456"}
   → 200 OK {token}

3. Use access token in Authorization header:
   Authorization: Bearer {token}
```

---

## Testing with cURL

### Create an order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "mobile": "03001234567",
    "address": "Test Address",
    "branch": "Clifton",
    "items": [
      {"menuItemId": 1, "quantity": 2}
    ]
  }'
```

### Track an order:

```bash
curl http://localhost:3000/api/orders/KB-M5X2K8A-7F3B9E
```

### Admin login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### List orders (admin):

```bash
curl http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update order status:

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/KB-M5X2K8A-7F3B9E/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Preparing"}'
```

### Export orders as CSV:

```bash
curl http://localhost:3000/api/admin/orders/export.csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o orders.csv
```
