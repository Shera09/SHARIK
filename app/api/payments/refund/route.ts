import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PaymentProviderFactory, SupportedPaymentProvider } from '@/lib/payment-provider-factory';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const refundSchema = z.object({
  payment_id: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, refundSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid refund payload' }, { status: 400 });
  }

  try {
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', body.payment_id)
      .maybeSingle();

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const provider = PaymentProviderFactory.getProvider(payment.provider as SupportedPaymentProvider);

    const refundResult = await provider.issueRefund({
      payment_id: payment.id,
      provider_payment_id: payment.provider_payment_id,
      amount: body.amount,
      currency: payment.currency,
      reason: body.reason,
    });

    if (!refundResult.success) {
      return NextResponse.json({ error: refundResult.error || 'Refund rejected by provider' }, { status: 400 });
    }

    // Record Refund
    await supabase.from('refunds').insert({
      payment_id: payment.id,
      tenant_id: payment.tenant_id,
      provider_refund_id: refundResult.refund_id,
      amount: body.amount,
      currency: payment.currency,
      reason: body.reason || 'Customer refund',
      status: 'succeeded',
    });

    await supabase
      .from('payments')
      .update({ status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', payment.id);

    await supabase.from('security_events').insert({
      event_type: 'refund_issued',
      severity: 'info',
      resource: 'payments/refund',
      action: 'issue_refund',
      details: { payment_id: payment.id, amount: body.amount, refund_id: refundResult.refund_id },
    });

    return NextResponse.json({ success: true, refund: refundResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Refund processing failed' }, { status: 500 });
  }
}
