import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, jsonError, jsonSuccess, validateRequestBody } from '@/lib/api-middleware';
import { verifyRazorpaySignature, processSuccessfulPayment } from '@/lib/integrations/razorpay';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  amount: z.number().positive(),
  invoice_id: z.string().optional(),
  organization_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit(ip, 'api/payments/razorpay/verify', 30);
  if (!allowed) {
    return jsonError('Rate limit exceeded', 429);
  }

  const { data, errorResponse } = await validateRequestBody(req, verifyPaymentSchema);
  if (errorResponse) return errorResponse;

  const isValid = verifyRazorpaySignature(
    data!.razorpay_order_id,
    data!.razorpay_payment_id,
    data!.razorpay_signature
  );

  if (!isValid) {
    return jsonError('Invalid payment signature', 400);
  }

  const processed = await processSuccessfulPayment({
    razorpay_order_id: data!.razorpay_order_id,
    razorpay_payment_id: data!.razorpay_payment_id,
    amount: data!.amount,
    invoice_id: data!.invoice_id,
    organization_id: data!.organization_id,
  });

  if (!processed) {
    return jsonError('Failed to record verified payment', 500);
  }

  return jsonSuccess({ verified: true }, 'Payment verified and invoice updated');
}
