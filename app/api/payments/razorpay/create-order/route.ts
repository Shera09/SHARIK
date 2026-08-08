import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, jsonError, jsonSuccess, validateRequestBody } from '@/lib/api-middleware';
import { createRazorpayOrder } from '@/lib/integrations/razorpay';

const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  currency: z.string().default('INR'),
  invoice_id: z.string().optional(),
  organization_id: z.string().optional(),
  notes: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit(ip, 'api/payments/razorpay/create-order', 30);
  if (!allowed) {
    return jsonError('Rate limit exceeded', 429);
  }

  const { data, errorResponse } = await validateRequestBody(req, createOrderSchema);
  if (errorResponse) return errorResponse;

  const result = await createRazorpayOrder({
    amount: data!.amount,
    currency: data!.currency,
    invoice_id: data!.invoice_id,
    organization_id: data!.organization_id,
    notes: data!.notes,
  });

  if (!result.success) {
    return jsonError(result.error || 'Failed to create Razorpay order', 400);
  }

  return jsonSuccess(result, 'Razorpay order created successfully');
}
