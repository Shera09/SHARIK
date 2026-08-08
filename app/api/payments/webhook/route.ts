import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PaymentProviderFactory, SupportedPaymentProvider } from '@/lib/payment-provider-factory';
import { logger } from '@/lib/monitoring';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const providerParam = (requestUrl.searchParams.get('provider') || 'stripe') as SupportedPaymentProvider;

  const signature = request.headers.get('stripe-signature') || request.headers.get('x-razorpay-signature') || 'mock_sig';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'sharik_webhook_secret_2026';

  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    const provider = PaymentProviderFactory.getProvider(providerParam);

    // 1. Verify Webhook Signature (if headers present)
    if (signature !== 'mock_sig') {
      const isValid = provider.verifyWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        await supabase.from('security_events').insert({
          event_type: 'webhook_signature_failed',
          severity: 'high',
          resource: `webhooks/${providerParam}`,
          action: 'signature_mismatch',
          details: { provider: providerParam, timestamp: new Date().toISOString() },
        });
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    // 2. Parse Webhook Event Payload
    const parsedEvent = provider.parseWebhookEvent(payload);

    // 3. Idempotency Protection: Check if event_id already processed
    const { data: existingWebhook } = await supabase
      .from('payment_webhooks')
      .select('id, processed')
      .eq('event_id', parsedEvent.event_id)
      .maybeSingle();

    if (existingWebhook && existingWebhook.processed) {
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
    }

    // Record Webhook Event
    await supabase.from('payment_webhooks').upsert({
      provider: providerParam,
      event_type: parsedEvent.event_type,
      event_id: parsedEvent.event_id,
      payload: parsedEvent.raw,
      processed: true,
      processed_at: new Date().toISOString(),
    });

    // 4. Update Payment & Subscription State
    if (parsedEvent.provider_payment_id) {
      await supabase
        .from('payments')
        .update({
          status: parsedEvent.status === 'succeeded' ? 'succeeded' : 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('provider_payment_id', parsedEvent.provider_payment_id);
    }

    if (parsedEvent.tenant_id) {
      await supabase.from('billing_events').insert({
        tenant_id: parsedEvent.tenant_id,
        event_type: parsedEvent.event_type,
        amount: parsedEvent.amount || 0,
        currency: parsedEvent.currency || 'INR',
        details: { provider: providerParam, status: parsedEvent.status },
      });
    }

    await logger.log(
      'security',
      'info',
      `Payment Webhook Processed (${providerParam})`,
      { event_id: parsedEvent.event_id, event_type: parsedEvent.event_type },
      parsedEvent.tenant_id
    );

    return NextResponse.json({ success: true, event_id: parsedEvent.event_id });
  } catch (err: any) {
    console.error('[Webhook Error]:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
