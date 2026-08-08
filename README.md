# SHARIK CRM — Enterprise Edition v1.0.0

**SHARIK CRM** is a production-grade, multi-tenant enterprise Customer Relationship Management platform built with Next.js 13, Supabase, and TypeScript.

---

## ✨ Key Features

| Module | Description |
| :--- | :--- |
| 🔐 **Authentication** | Email/Password, Google, Microsoft, GitHub, LinkedIn OAuth; MFA TOTP; Backup Codes |
| 🏢 **Multi-Tenant** | Row-Level Security (RLS) isolation per tenant in every database table |
| 👥 **RBAC** | Role-based access control: Super Admin, Admin, Manager, Sales, HR, Finance, Support |
| 📋 **CRM** | Leads, Clients, Projects, Tasks, Calendar, WhatsApp, Social, Google Reviews |
| 💳 **Billing** | Stripe, Razorpay, PayPal, Wise, Paddle, Lemon Squeezy payment providers |
| 📄 **Invoicing** | Invoice generation with GST/VAT tax lines, PDF export, credit notes |
| 🔑 **Licensing** | HMAC SHA-256 signed license tokens, secret rotation, 7-day grace period |
| 📁 **EDMS** | Enterprise Document Management: Vault, Versioning, Preview, Download |
| 🛡️ **Security** | MFA TOTP, Trusted Devices, Active Session Management, Audit Logs |
| 🔏 **SSO** | SAML 2.0 Service Provider (Okta, Azure AD, Google Workspace) |
| 👤 **SCIM** | SCIM 2.0 User and Group provisioning API |
| 🤖 **AI Platform** | AI Provider Abstraction (Gemini, OpenAI, Anthropic, Azure, Local LLM) |
| ⚡ **Workflows** | Automation Engine: Triggers, Conditions, Actions, Retry Logic |
| 🌐 **Public API** | Developer REST API with HMAC-hashed API Keys, Scopes, Rotation |
| 🪝 **Webhooks** | Outbound webhooks with HMAC signatures, DLQ, exponential backoff |
| 🔗 **Integrations** | Zapier, Make.com, n8n, Custom Connector plugin architecture |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works for development)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/sharik-crm.git
cd sharik-crm
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials and API keys
```

### 3. Apply Database Migrations

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or apply migrations manually in Supabase SQL Editor
# Each file in supabase/migrations/ should be run in order
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests

```bash
npm test           # Run all enterprise test suites once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 13 (App Router) |
| Language | TypeScript 5.2 |
| Database | Supabase (PostgreSQL + RLS + Auth) |
| UI Components | Radix UI + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Payments | Stripe, Razorpay, PayPal, Wise, Paddle, Lemon Squeezy |
| Email | Resend |
| AI | Google Gemini 1.5 Flash (primary), OpenAI GPT-4o Mini (fallback) |
| Testing | Vitest |
| Deployment | Vercel / Netlify / Docker |

---

## 📁 Project Structure

```
sharik-crm/
├── app/               # Next.js App Router pages & API routes
│   ├── api/           # Backend API endpoints
│   ├── auth/          # OAuth callbacks
│   ├── dashboard/     # Main CRM dashboard
│   ├── leads/         # Lead management
│   ├── security/      # MFA, sessions, devices
│   ├── portal/        # Customer billing portal
│   └── ...            # 60+ enterprise modules
├── lib/               # Core business logic engines
│   ├── auth.tsx           # Authentication context & providers
│   ├── ai-provider-factory.ts  # AI provider abstraction
│   ├── billing-engine.ts      # Invoice & checkout engine
│   ├── licensing-engine.ts    # License token management
│   ├── mfa-engine.ts          # RFC6238 TOTP engine
│   ├── payment-provider-factory.ts  # Payment providers
│   ├── saml-provider.ts       # SAML 2.0 SP engine
│   ├── session-manager.ts     # Active session management
│   ├── webhook-dispatcher.ts  # Outbound webhook delivery
│   ├── workflow-engine.ts     # Automation action executor
│   └── feature-flags.ts       # Server-side feature flags
├── components/        # Reusable UI components
├── supabase/
│   └── migrations/    # 47 additive SQL migrations
├── __tests__/         # Vitest enterprise test suites
└── docs/              # Technical documentation
```

---

## 🔐 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Server-Side Guards**: All private routes protected by Next.js middleware session validation
- **Feature Flags**: Server-side only via environment variables (not localStorage)
- **API Keys**: HMAC SHA-256 hashed with `API_KEY_HASH_SALT` env var
- **Webhooks**: HMAC SHA-256 `X-Sharik-Signature` verification
- **License Tokens**: Custom `SHARIK-LIC` HMAC-signed tokens with clock skew tolerance
- **MFA**: RFC6238-compatible TOTP with 10 hashed backup codes
- **RLS**: Row-Level Security enforced on every database table
- **Headers**: CSP, HSTS, X-Frame-Options, Permissions-Policy on every response

---

## 📝 Environment Variables

See [`.env.example`](.env.example) for a complete list of required environment variables.

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `GEMINI_API_KEY` | ✅ (for AI) | Google Gemini API key |
| `OPENAI_API_KEY` | Optional | OpenAI fallback API key |
| `API_KEY_HASH_SALT` | ✅ | HMAC salt for API key hashing |
| `RESEND_API_KEY` | ✅ (for email) | Resend email API key |
| `STRIPE_SECRET_KEY` | ✅ (for payments) | Stripe secret key |

---

## 📄 License

Proprietary — SHARIK CRM Enterprise Edition © 2026
