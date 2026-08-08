# Database Schema & Entity Relationship Overview

## Core Tables Architecture

- `organizations`: Multi-tenant root organization entity.
- `leads`: Lead pipeline entities (`deleted_at` soft delete).
- `customers`: Customer records & GST details (`deleted_at` soft delete).
- `invoices`: Sales invoices & payment status (`paid_amount`, `total_amount`).
- `payments`: Customer payment transaction records.
- `payment_orders`: Online payment gateway order states.
- `whatsapp_messages`: Inbound & outbound WhatsApp message log.
- `email_logs`: Sent & failed transactional email history.
- `background_jobs`: Background worker task execution queue.
- `organization_settings`: Tenant configurations & company metadata.

All tables enforce Row Level Security (RLS) policies scoped to tenant `organization_id`.
