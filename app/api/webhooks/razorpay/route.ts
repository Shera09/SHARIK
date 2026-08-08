import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, jsonError, jsonSuccess } from '@/lib/api-middleware';
import { verifyRazorpayWebhookSignature, processSuccessfulPayment } from '@/lib/integrations/razorpay';

/**
 * POST Handler: Razorpay Payment Webhooks (payment.captured, payment.failed, order.paid)
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit(ip, 'api/webhooks/razorpay', 100);
  if (!allowed) {
    return jsonError('Rate limit exceeded', 429);
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Signature Verification
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('[Razorpay Webhook] Invalid webhook signature');
        return jsonError('Invalid Razorpay Webhook Signature', 400);
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const idempotencyKey = req.headers.get('x-razorpay-event-id') || `rzp_${payload.created_at}_${event}`;

    // 2. Deduplication check
    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingLog) {
      return jsonSuccess({ duplicate: true }, 'Event already processed');
    }

    // Log webhook payload
    await supabase.from('webhook_logs').insert({
      provider: 'razorpay',
      event_type: event || 'unknown',
      idempotency_key: idempotencyKey,
      payload,
      signature: signature || null,
      status: 'received',
    });

    // 3. Process Event
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amountInRupees = Number(paymentEntity?.amount || 0) / 100;
      const invoiceId = paymentEntity?.notes?.invoice_id;
      const organizationId = paymentEntity?.notes?.organization_id;

      if (orderId && paymentId) {
        await processSuccessfulPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          amount: amountInRupees,
          invoice_id: invoiceId,
          organization_id: organizationId,
        });
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        await supabase
          .from('payment_orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('razorpay_order_id', orderId);
      }
    }

    return jsonSuccess({ processed: true, event }, 'Razorpay webhook processed');
  } catch (err: any) {
    console.error('[Razorpay Webhook] Error:', err);
    return jsonError(err.message || 'Error processing Razorpay webhook', 500);
  }
}
