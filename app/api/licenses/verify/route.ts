import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySignedLicenseToken } from '@/lib/licensing-engine';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const key = requestUrl.searchParams.get('key');
  const domain = requestUrl.searchParams.get('domain');

  if (!key) {
    return NextResponse.json({ error: 'License key parameter is required' }, { status: 400 });
  }

  try {
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', key)
      .maybeSingle();

    if (fetchError || !license) {
      return NextResponse.json({ valid: false, status: 'revoked', reason: 'License key not found' }, { status: 404 });
    }

    if (license.status === 'revoked' || license.status === 'suspended') {
      return NextResponse.json({ valid: false, status: license.status, reason: `License is ${license.status}` });
    }

    const verification = verifySignedLicenseToken(license.license_token);

    if (license.bound_domain && domain && license.bound_domain.toLowerCase() !== domain.toLowerCase()) {
      return NextResponse.json({ valid: false, status: 'domain_mismatch', reason: `Domain ${domain} not bound to license` });
    }

    // Update last verified timestamp
    await supabase.from('licenses').update({ last_verified_at: new Date().toISOString() }).eq('id', license.id);

    return NextResponse.json({
      valid: verification.valid,
      status: verification.status,
      isInGracePeriod: verification.isInGracePeriod || false,
      graceDaysRemaining: verification.graceDaysRemaining || 0,
      plan_type: license.plan_type,
      valid_until: license.valid_until,
      max_users: license.max_users,
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, status: 'error', reason: err.message }, { status: 500 });
  }
}
