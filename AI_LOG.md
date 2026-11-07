# AI Log — Karachi Bites Backend

This document records the most important prompts used during development, what the AI got wrong, and what was corrected. Prepared for capstone viva defense.

---

## Entry 1

**Prompt:** "Audit the existing Karachi Bites backend repository before making any changes."

**Intended result:** Comprehensive understanding of existing code, identify bugs and missing features.

**What the AI got wrong:** Initially, the AI did not fully verify the phone verification logic. It assumed the existing implementation was correct based on the test passing, but a live smoke test revealed that `GET /api/orders/:id?mobile=03001234567` returned 404 even with the correct phone number.

**What was corrected:** The bug was in `orderService.js` — the `getOrderForCustomer` function compared against `full.mobile`, but `getOrder()` named the field `customerMobile`. This caused phone verification to always fail. Fixed by changing `full.mobile` to `full.customerMobile`.

**How verified:** Live cURL test after fix confirmed correct mobile → 200, wrong mobile → 404.

---

## Entry 2

**Prompt:** "Rewrite the seed data to match the exact assignment menu with IDs 1-12, correct prices, categories, and tags."

**Intended result:** Replace the 12-sample menu with the exact 12 assignment items (Chicken Malai Boti, Beef Seekh Kebab, etc.).

**What the AI got wrong:** The first rewrite attempted used a simple INSERT loop that would fail with duplicate-key errors if the database already contained items with those IDs (which it did from the original seed). Also, the original seed had no versioning — re-running on every startup could cause errors.

**What was corrected:** Implemented UPSERT (`INSERT ... ON CONFLICT(id) DO UPDATE SET ...`) with a `meta.seed_version` table. This makes seeding idempotent and safe to re-run.

**How verified:** Ran server twice, confirmed menu count stayed at 12 and all prices/tags matched assignment.

---

## Entry 3

**Prompt:** "Add support for the nested customer shape in order creation: `customer: {name, phone, address}` as an alternative to the flat shape."

**Intended result:** Accept both `POST /api/orders` shapes — the existing flat `customerName/mobile/address` and the assignment's nested `customer: {name, phone, address}`.

**What the AI got wrong:** The first implementation created a separate validation path for nested shape, duplicating validation logic.

**What was corrected:** Unified into a single `validateOrderPayload` that accepts either shape via `body?.customerName ?? customer.name` fallback, keeping one source of truth.

**How verified:** Both shapes tested and creating orders successfully.

---

## Entry 4

**Prompt:** "Prevent spreadsheet formula injection in CSV export."

**Intended result:** Protect against Excel formula injection in untrusted text fields (customer name, address) exported to CSV.

**What the AI got wrong:** The AI initially added CSV sanitization but the test assertion used `assert.notMatch()` which doesn't exist in Node's `node:assert` module (should be `assert.doesNotMatch()`).

**What was corrected:** Fixed the test to use string inclusion checks instead. Also verified the `sanitizeCsvCell` function correctly prefixes `=+-@`-leading cells with `'`.

**How verified:** Created test with `=HACKER` and `+92300...` inputs, confirmed they appear quoted in CSV output.

---

## Entry 5

**Prompt:** "Normalize all SQLite datetime strings to ISO 8601 format in API responses."

**Intended result:** Change `YYYY-MM-DD HH:MM:SS` (SQLite default) to `YYYY-MM-DDTHH:MM:SSZ` (ISO 8601) for consistent client-side parsing.

**What the AI got wrong:** Initially, the `toIso()` function was only applied in `getOrder()`, but not in `listOrders()` or `updateStatus()`.

**What was corrected:** Applied `toIso()` consistently across all order response mappers.

**How verified:** Asserted `createdAt` matches `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/` in tracking and admin list tests.

---

## Entry 6

**Prompt:** "Sanitize the PATCH /api/admin/orders/:id/status response to not leak customer PII."

**Intended result:** Admin status updates should not expose `customerMobile` or `customerName` in the response.

**What the AI got wrong:** The status update returned the full order object from `getOrder()`, which includes `customerMobile`.

**What was corrected:** Added `toCustomerSafeOrder()` helper that strips PII fields before returning.

**How verified:** Patched an order's status, then tracked it publicly — confirmed no `customerName` or `mobile` in response.

---

## Entry 7

**Prompt:** "Add a rate limiter for the public order tracking endpoint."

**Intended result:** Protect `GET /api/orders/:id` from abuse (assignment suggests considering it).

**What the AI got wrong:** The first attempt added a rate limiter but it conflicted with the test suite running two test files against the same in-memory database, causing 429 errors.

**What was corrected:** Made rate limiters skip in `NODE_ENV=test` mode via a `limiter()` wrapper, while keeping them active in production. The business logic (account lockout) is still tested separately.

**How verified:** Full test suite passes (42/42). Confirmed rate limiters are active in production mode.

---

## Entry 8

**Prompt:** "Rename the order tracking response field from `id` to `orderId` to match the fixed API contract."

**Intended result:** Align response field name with assignment specification: "JSON response containing `orderId`, status, items, and total."

**What the AI got wrong:** The change in `orderService.js` was correct, but the existing test in `api.test.js` still asserted `res.body.id`.

**What was corrected:** Updated the test assertion from `res.body.id` to `res.body.orderId`.

**How verified:** Test passes with new field name. Confirmed no other code references `res.body.id` for orders.

---

*Note: Entries 1-8 represent the most important development decisions. Additional minor fixes were made during testing but these capture the key issues and resolutions.*
