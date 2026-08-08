import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySignedLicenseToken } from '@/lib/licensing-engine';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const activateSchema = z.object({
  license_key: z.string().min(10),
  device_fingerprint: z.string().min(3),
  domain: z.string().optional(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, activateSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  try {
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', body.license_key)
      .maybeSingle();

    if (fetchError || !license) {
      return NextResponse.json({ error: 'License key not found' }, { status: 404 });
    }

    if (license.status === 'revoked' || license.status === 'suspended') {
      await supabase.from('security_events').insert({
        event_type: 'license_revoked_attempt',
        severity: 'warning',
        resource: 'licenses/activate',
        action: 'activate_blocked',
        details: { license_key: body.license_key, status: license.status },
      });
      return NextResponse.json({ error: `License is ${license.status}` }, { status: 403 });
    }

    const verification = verifySignedLicenseToken(license.license_token);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.reason || 'License token invalid' }, { status: 403 });
    }

    if (license.bound_domain && body.domain && license.bound_domain.toLowerCase() !== body.domain.toLowerCase()) {
      await supabase.from('security_events').insert({
        event_type: 'domain_mismatch',
        severity: 'warning',
        resource: 'licenses/activate',
        action: 'domain_mismatch_detected',
        details: { bound_domain: license.bound_domain, requested_domain: body.domain },
      });
      return NextResponse.json({ error: `License bound to domain ${license.bound_domain}` }, { status: 403 });
    }

    const { count: activeDevices } = await supabase
      .from('license_activations')
      .select('*', { count: 'exact', head: true })
      .eq('license_id', license.id)
      .eq('is_active', true);

    if (activeDevices && activeDevices >= (license.max_devices || 10)) {
      await supabase.from('security_events').insert({
        event_type: 'device_limit_exceeded',
        severity: 'warning',
        resource: 'licenses/activate',
        action: 'device_limit_reached',
        details: { max_devices: license.max_devices, current: activeDevices },
      });
      return NextResponse.json({ error: `Maximum device limit (${license.max_devices}) reached` }, { status: 403 });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const forwardHeader = request.headers.get('x-forwarded-for');
    const ipAddress = forwardHeader ? forwardHeader.split(',')[0].trim() : '127.0.0.1';

    await supabase.from('license_activations').insert({
      license_id: license.id,
      device_fingerprint: body.device_fingerprint,
      domain: body.domain || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      is_active: true,
    });

    await supabase
      .from('licenses')
      .update({ last_verified_at: new Date().toISOString() })
      .eq('id', license.id);

    await supabase.from('security_events').insert({
      event_type: 'license_activated',
      severity: 'info',
      resource: 'licenses',
      action: 'activate_success',
      details: { license_key: body.license_key, device_fingerprint: body.device_fingerprint },
    });

    return NextResponse.json({
      success: true,
      message: 'License activated successfully',
      license: {
        license_key: license.license_key,
        plan_type: license.plan_type,
        status: license.status,
        valid_until: license.valid_until,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Activation failed' }, { status: 500 });
  }
}
