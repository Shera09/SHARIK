import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const changePlanSchema = z.object({
  tenant_id: z.string().uuid(),
  new_plan: z.enum(['starter', 'professional', 'business', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'yearly', 'custom']).default('monthly'),
  seats: z.number().int().min(1).optional(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, changePlanSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('current_plan')
      .eq('id', body.tenant_id)
      .maybeSingle();

    const oldPlan = tenant?.current_plan || 'free';

    await supabase
      .from('tenants')
      .update({
        current_plan: body.new_plan,
        max_users: body.seats || (body.new_plan === 'enterprise' ? 100 : body.new_plan === 'business' ? 25 : 5),
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.tenant_id);

    await supabase.from('subscription_events').insert({
      tenant_id: body.tenant_id,
      event_type: oldPlan === 'free' || oldPlan === 'starter' ? 'upgraded' : 'downgraded',
      old_plan: oldPlan,
      new_plan: body.new_plan,
      details: { billing_cycle: body.billing_cycle, seats: body.seats, timestamp: new Date().toISOString() },
    });

    await supabase.from('security_events').insert({
      event_type: 'plan_changed',
      severity: 'info',
      resource: 'subscriptions',
      action: 'change_plan',
      details: { tenant_id: body.tenant_id, old_plan: oldPlan, new_plan: body.new_plan },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully changed plan to ${body.new_plan}`,
      old_plan: oldPlan,
      new_plan: body.new_plan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Plan change failed' }, { status: 500 });
  }
}
