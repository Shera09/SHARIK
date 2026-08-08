# SHARIK CRM REST API Documentation — v1.0.0

## Base URL
```
https://your-domain.com/api
```

## Authentication

### Session-Based (Default — Internal UI)
All internal API routes require a valid Supabase session cookie. Managed automatically by the browser/app.

### API Key (Public Developer API)
External API routes under `/api/v1/` require:
```
X-API-Key: sharik_live_<your-api-key>
```
Generate keys from **Settings → Developer → API Keys**.

---

## Core API Endpoints

### Payments

#### `POST /api/payments/razorpay/create-order`
Creates a Razorpay payment order for an invoice.
- **Auth**: Session
- **Body**: `{ "amount": 5000, "currency": "INR", "invoice_id": "uuid" }`
- **Response**: `{ "success": true, "orderId": "order_xxx" }`

#### `POST /api/payments/razorpay/verify`
Verifies client HMAC SHA256 payment signature and updates invoice state.
- **Auth**: Session
- **Body**: `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }`

---

### Subscriptions

#### `GET /api/subscriptions`
Returns active subscription data for the authenticated tenant.

#### `POST /api/subscriptions`
Creates or updates a subscription record for a tenant.

---

### Invoices

#### `GET /api/invoices`
Returns paginated invoice list for the authenticated tenant.

#### `POST /api/invoices`
Generates a new invoice with line items, tax calculations, and due date.

---

### Webhooks (Inbound)

#### `GET /api/webhooks/whatsapp`
Verifies WhatsApp Cloud API webhook subscription (token-based).

#### `POST /api/webhooks/whatsapp`
Receives inbound WhatsApp messages and delivery receipts. No auth required (Meta verifies with token).

#### `POST /api/webhooks/razorpay`
Receives Razorpay payment events. Verified via HMAC SHA-256 webhook signature.

#### `POST /api/webhooks/stripe`
Receives Stripe payment events. Verified via `X-Stripe-Signature` header.

---

### Cron Workers

#### `GET /api/cron/worker`
Executes pending background worker jobs.
- **Auth**: `Authorization: Bearer <CRON_SECRET>`
- Used by Vercel/Netlify scheduled functions.

---

## Sprint 4–7 Enterprise API Endpoints

### AI Platform (Requires `enable_ai_platform: true`)

#### `POST /api/ai/copilot`
Runs AI Sales Copilot analysis on a lead using the configured AI provider.
- **Auth**: Session
- **Body**:
  ```json
  {
    "tenant_id": "uuid",
    "lead_id": "uuid",
    "lead_name": "TechCorp Deal",
    "company": "TechCorp",
    "value": 25000,
    "provider": "gemini"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "analysis": {
      "provider": "gemini",
      "confidence": 0.96,
      "insight": { "summary": "...", "next_best_action": "..." }
    },
    "predictive_score": {
      "score": 89,
      "quality": "High",
      "conversionProbability": "80%"
    }
  }
  ```

---

### Developer / Public API

#### `GET /api/developer/keys`
Lists all API keys for the authenticated tenant (hashes only — raw keys never returned after creation).
- **Auth**: Session

#### `POST /api/developer/keys`
Creates a new scoped API key.
- **Auth**: Session
- **Body**:
  ```json
  {
    "tenant_id": "uuid",
    "name": "Production Zapier Key",
    "scopes": ["leads:read", "leads:write"],
    "expiration_days": 90
  }
  ```
- **Response**: `{ "api_key": { "rawApiKey": "sharik_live_...", "keyPrefix": "...", "scopes": [...] } }`

---

### Public REST API (Requires X-API-Key header)

#### `GET /api/v1/leads`
Returns up to 50 CRM leads for the authenticated tenant.
- **Auth**: `X-API-Key` with `leads:read` scope
- **Response**: `{ "success": true, "count": 12, "data": [...] }`

#### `POST /api/v1/leads`
Creates a new CRM lead via API.
- **Auth**: `X-API-Key` with `leads:write` scope
- **Body**: `{ "title": "...", "contact_name": "...", "email": "...", "value": 5000 }`

---

### Security

#### `POST /api/security/mfa/setup`
Generates a TOTP secret, OTPAuth URL, and QR code data for MFA enrollment.
- **Auth**: Session

#### `POST /api/security/mfa/verify`
Verifies a 6-digit TOTP code or redeems a backup recovery code.
- **Auth**: Session
- **Body**: `{ "code": "123456", "type": "totp" | "backup" }`

#### `GET /api/security/devices`
Returns list of trusted devices for the current user.
- **Auth**: Session

#### `POST /api/security/devices`
Registers or revokes a trusted device.
- **Auth**: Session

#### `GET /api/security/sessions`
Returns all active sessions for the current user.
- **Auth**: Session

#### `POST /api/security/sessions`
Terminates sessions (single or all devices).
- **Auth**: Session
- **Body**: `{ "action": "logout_all" | "logout_session", "session_id": "uuid" }`

---

### SCIM 2.0

#### `GET /api/scim/v2/Users`
Returns paginated SCIM user list.
- **Auth**: Bearer token (SCIM provisioning token)

#### `POST /api/scim/v2/Users`
Creates a new user via SCIM provisioning.

#### `GET /api/scim/v2/Groups`
Returns group/role data in SCIM format.

---

### Licenses

#### `POST /api/licenses/verify`
Verifies a HMAC-signed license token for a tenant.

#### `POST /api/licenses/activate`
Activates an enterprise license key for a tenant.

---

## OpenAPI 3.0 Specification

A machine-readable OpenAPI spec for the Public Developer API is available at:

```
GET /api/developer/openapi
```

Returns the OpenAPI 3.0 JSON schema covering all `/api/v1/` endpoints.

---

## Rate Limits

| Tier | Requests per minute |
| :--- | :---: |
| Session-authenticated internal API | 120 req/min |
| Public API (API Key) | 60 req/min (configurable per key) |
| Webhook delivery | No limit (outbound) |

---

## Error Responses

All API errors return a consistent envelope:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": "2026-07-31T12:00:00Z"
}
```

| HTTP Status | Meaning |
| :--- | :--- |
| `400` | Bad Request — invalid payload |
| `401` | Unauthorized — missing or invalid session/API key |
| `403` | Forbidden — insufficient scope or role |
| `404` | Not Found |
| `422` | Unprocessable Entity — Zod schema validation failed |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |
