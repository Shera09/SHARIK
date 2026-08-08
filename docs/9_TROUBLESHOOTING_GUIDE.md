# Production Troubleshooting Guide

## Common Issues & Diagnostics

### 1. Razorpay Webhook Signature Mismatch
- **Symptom**: Webhook returns HTTP 400.
- **Fix**: Verify `RAZORPAY_WEBHOOK_SECRET` matches signature key generated in Razorpay Dashboard.

### 2. WhatsApp Message Status Remains 'Disabled'
- **Symptom**: Message send returns `disabled`.
- **Fix**: Check that `WHATSAPP_CLOUD_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are set in `.env.local`.

### 3. Background Jobs Not Executing
- **Symptom**: Jobs remain in `pending` state in `background_jobs`.
- **Fix**: Ensure cron job is triggering `/api/cron/worker` with correct `Authorization: Bearer <CRON_SECRET>` header.
