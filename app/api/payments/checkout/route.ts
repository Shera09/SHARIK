import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PaymentProviderFactory, SupportedPaymentProvider } from '@/lib/payment-provider-factory';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const checkoutSchema = z.object({
  tenant_id: z.string().uuid(),
  provider: z.enum(['stripe', 'razorpay', 'paypal', 'wise', 'paddle', 'lemonsqueezy']),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  plan_type: z.enum(['starter', 'professional', 'business', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'yearly', 'custom']).default('monthly'),
  customer_email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, checkoutSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const provider = PaymentProviderFactory.getProvider(body.provider as SupportedPaymentProvider);

    const session = await provider.createCheckoutSession({
      tenant_id: body.tenant_id,
      amount: body.amount,
      currency: body.currency ?? 'INR',
      plan_type: body.plan_type,
      billing_cycle: body.billing_cycle ?? 'monthly',
      success_url: `${origin}/portal/billing?status=success`,
      cancel_url: `${origin}/portal/billing?status=cancelled`,
      customer_email: body.customer_email,
    });

    // Record pending payment in DB
    await supabase.from('payments').insert({
      tenant_id: body.tenant_id,
      provider: body.provider,
      provider_payment_id: session.session_id,
      amount: body.amount,
      currency: body.currency,
      status: 'pending',
      metadata: { plan_type: body.plan_type, billing_cycle: body.billing_cycle },
    });

    await supabase.from('security_events').insert({
      event_type: 'checkout_session_created',
      severity: 'info',
      resource: `payments/${body.provider}`,
      action: 'create_checkout',
      details: { provider: body.provider, amount: body.amount, tenant_id: body.tenant_id },
    });

    return NextResponse.json({ success: true, checkout: session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout session creation failed' }, { status: 500 });
  }
}
