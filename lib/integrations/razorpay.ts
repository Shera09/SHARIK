import crypto from 'crypto';
import { fetchWithRetry } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';

export type CreateRazorpayOrderOptions = {
  amount: number; // in INR (e.g. 500.00)
  currency?: string; // DEFAULT 'INR'
  invoice_id?: string;
  notes?: Record<string, string>;
  organization_id?: string;
};

export type VerifyRazorpaySignatureOptions = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  invoice_id?: string;
  organization_id?: string;
};

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Creates a Razorpay Order via official REST API.
 */
export async function createRazorpayOrder(options: CreateRazorpayOrderOptions): Promise<{
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
  status: string;
}> {
  if (!isRazorpayConfigured()) {
    console.warn('[Razorpay Integration] Credentials not set in environment.');
    return {
      success: false,
      error: 'Razorpay API credentials not configured in environment variables',
      status: 'disabled',
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const amountInPaise = Math.round(options.amount * 100);
  const currency = options.currency || 'INR';

  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const res = await fetchWithRetry(
      'https://api.razorpay.com/v1/orders',
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: options.invoice_id ? `inv_${options.invoice_id.substring(0, 8)}` : `rcpt_${Date.now()}`,
          notes: {
            invoice_id: options.invoice_id || '',
            organization_id: options.organization_id || '',
            ...options.notes,
          },
        }),
      },
      3,
      10000
    );

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.description || res.statusText;
      console.error('[Razorpay Integration] Error creating order:', errorMsg);
      return { success: false, error: errorMsg, status: 'failed' };
    }

    // Save order in Supabase payment_orders table
    await supabase.from('payment_orders').insert({
      invoice_id: options.invoice_id || null,
      razorpay_order_id: data.id,
      amount: options.amount,
      currency,
      status: 'created',
      organization_id: options.organization_id || null,
      metadata: data,
    });

    return {
      success: true,
      orderId: data.id,
      amount: options.amount,
      currency,
      status: 'created',
    };
  } catch (err: any) {
    console.error('[Razorpay Integration] Exception creating order:', err);
    return {
      success: false,
      error: err.message || 'Exception occurred creating Razorpay order',
      status: 'failed',
    };
  }
}

/**
 * Verifies Razorpay payment signature using HMAC SHA256.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret = process.env.RAZORPAY_KEY_SECRET || ''
): boolean {
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature (X-Razorpay-Signature header).
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
): boolean {
  if (!webhookSecret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Processes successful Razorpay payment and updates Invoice + Payments tables.
 */
export async function processSuccessfulPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  invoice_id?: string;
  organization_id?: string;
}): Promise<boolean> {
  try {
    // 1. Update payment_orders record
    await supabase
      .from('payment_orders')
      .update({
        razorpay_payment_id: payload.razorpay_payment_id,
        status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', payload.razorpay_order_id);

    // 2. If invoice_id exists, update invoice status and insert into payments
    if (payload.invoice_id) {
      const { data: inv } = await supabase
        .from('invoices')
        .select('id, total_amount, paid_amount')
        .eq('id', payload.invoice_id)
        .single();

      if (inv) {
        const newPaid = Number(inv.paid_amount || 0) + Number(payload.amount);
        const total = Number(inv.total_amount || 0);
        const newStatus = newPaid >= total ? 'paid' : 'partially_paid';

        await supabase
          .from('invoices')
          .update({
            paid_amount: newPaid,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.invoice_id);

        await supabase.from('payments').insert({
          invoice_id: payload.invoice_id,
          amount: payload.amount,
          payment_date: new Date().toISOString().slice(0, 10),
          payment_method: 'razorpay',
          reference_number: payload.razorpay_payment_id,
          notes: `Razorpay Payment Order: ${payload.razorpay_order_id}`,
          organization_id: payload.organization_id || null,
        });
      }
    }

    return true;
  } catch (err) {
    console.error('[Razorpay Integration] Error processing successful payment:', err);
    return false;
  }
}
