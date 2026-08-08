# Production Deployment Guide

## Deployment Environment: Vercel + Supabase

### 1. Supabase Setup
1. Create a production Supabase project at [https://supabase.com](https://supabase.com).
2. Execute all SQL migrations under `supabase/migrations/`.
3. Verify RLS policies are enabled on all tables.

### 2. Vercel Deployment
1. Import project repository into Vercel Dashboard.
2. Configure environment variables matching `.env.example`.
3. Deploy automatically via Vercel GitHub integration.

### 3. Webhook Registration
- Meta WhatsApp Webhook: `https://your-domain.com/api/webhooks/whatsapp`
- Razorpay Webhook: `https://your-domain.com/api/webhooks/razorpay`

### 4. Background Cron Job Setup
Set up periodic HTTP GET request to `https://your-domain.com/api/cron/worker` with header `Authorization: Bearer <CRON_SECRET>` every 5 minutes.
