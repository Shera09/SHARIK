-- ============================================================================
-- Phase 3: Real Integrations & Background Worker Engine Migration
-- Date: 2026-07-30
-- Description: Schema definitions for Email logs, Razorpay payment orders,
--              Webhook logs, Background worker jobs, and API rate limiting.
-- ============================================================================

-- 1. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'resend', -- 'resend', 'ses', 'smtp'
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'failed', 'delivered'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2. PAYMENT ORDERS TABLE (Razorpay & Online Payments)
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created', -- 'created', 'authorized', 'captured', 'failed', 'refunded'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 3. WEBHOOK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'whatsapp', 'razorpay', 'resend', 'custom'
    event_type TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    signature TEXT,
    status TEXT NOT NULL DEFAULT 'received', -- 'received', 'processed', 'failed', 'duplicate'
    response_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 4. BACKGROUND JOBS TABLE (Worker Engine)
CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_name TEXT NOT NULL, -- 'invoice_reminder', 'payment_reminder', 'whatsapp_campaign', 'email_campaign', 'workflow_execution'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 5. API RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP address or tenant API key
    route TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    UNIQUE (identifier, route)
);

-- ============================================================================
-- INDEXES FOR HIGH PERFORMANCE AND FAST FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_email_logs_org ON public.email_logs(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_orders_org ON public.payment_orders(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_orders_invoice ON public.payment_orders(invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_orders_rzp_order ON public.payment_orders(razorpay_order_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON public.webhook_logs(provider, event_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_logs_idempotency ON public.webhook_logs(idempotency_key) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_background_jobs_pending ON public.background_jobs(status, scheduled_at) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_background_jobs_org ON public.background_jobs(organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(identifier, route, window_start);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- 1. EMAIL LOGS POLICIES
CREATE POLICY "Tenant users can view own email logs"
    ON public.email_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_role_assignments WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

-- 2. PAYMENT ORDERS POLICIES
CREATE POLICY "Tenant users can view own payment orders"
    ON public.payment_orders FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_role_assignments WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

-- 3. WEBHOOK LOGS POLICIES (Super Admin / Authenticated read)
CREATE POLICY "Authenticated users can read organization webhook logs"
    ON public.webhook_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IS NULL OR organization_id IN (
            SELECT organization_id FROM public.user_role_assignments WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

-- 4. BACKGROUND JOBS POLICIES
CREATE POLICY "Tenant users can view own background jobs"
    ON public.background_jobs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.user_role_assignments WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );
