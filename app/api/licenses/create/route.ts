import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateFormattedLicenseKey, createSignedLicenseToken, LicensePlanType, LicenseTokenPayload } from '@/lib/licensing-engine';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const createLicenseSchema = z.object({
  tenant_id: z.string().uuid(),
  plan_type: z.enum(['starter', 'professional', 'business', 'enterprise', 'trial']),
  billing_cycle: z.enum(['monthly', 'yearly', 'lifetime', 'custom']).default('monthly'),
  max_users: z.number().int().min(1).default(5),
  max_devices: z.number().int().min(1).default(10),
  bound_domain: z.string().optional(),
  valid_days: z.number().int().min(1).default(365),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, createLicenseSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  try {
    const licenseKey = generateFormattedLicenseKey(body.plan_type as LicensePlanType);
    const validFrom = new Date();
    const validDays = body.valid_days ?? 365;
    const validUntil = new Date(validFrom.getTime() + validDays * 24 * 60 * 60 * 1000);

    const payload: LicenseTokenPayload = {
      license_key: licenseKey,
      tenant_id: body.tenant_id,
      plan_type: body.plan_type as LicensePlanType,
      valid_from: validFrom.toISOString(),
      valid_until: validUntil.toISOString(),
      bound_domain: body.bound_domain,
      max_users: body.max_users ?? 5,
      max_devices: body.max_devices ?? 10,
      issued_at: validFrom.toISOString(),
      jti: `jti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const signedToken = createSignedLicenseToken(payload);

    const { data: license, error: dbError } = await supabase
      .from('licenses')
      .insert({
        license_key: licenseKey,
        license_token: signedToken,
        tenant_id: body.tenant_id,
        plan_type: body.plan_type,
        status: body.plan_type === 'trial' ? 'trialing' : 'active',
        billing_cycle: body.billing_cycle,
        max_users: body.max_users ?? 5,
        max_devices: body.max_devices ?? 10,
        bound_domain: body.bound_domain || null,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
      })
      .select('*')
      .single();

    if (dbError) {
      console.error('License creation DB error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await supabase.from('security_events').insert({
      event_type: 'license_created',
      severity: 'info',
      resource: 'licenses',
      action: 'create_license',
      details: { license_key: licenseKey, plan: body.plan_type, tenant_id: body.tenant_id },
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create license' }, { status: 500 });
  }
}
