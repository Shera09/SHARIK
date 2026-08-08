import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SAMLServiceProviderEngine } from '@/lib/saml-provider';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tenantId = requestUrl.searchParams.get('tenant_id');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id parameter is required' }, { status: 400 });
  }

  try {
    const { data: samlConfig } = await supabase
      .from('saml_configurations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .maybeSingle();

    if (!samlConfig || !samlConfig.sso_url) {
      return NextResponse.json({ error: 'SAML 2.0 not configured or inactive for this tenant' }, { status: 404 });
    }

    const origin = requestUrl.origin;
    const acsUrl = `${origin}/auth/saml/callback`;
    const spEntityId = `https://sharik.io/saml/sp/${tenantId}`;

    const redirectUrl = SAMLServiceProviderEngine.generateAuthnRequestUrl(
      samlConfig.sso_url,
      spEntityId,
      acsUrl,
      tenantId
    );

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to initiate SAML SSO' }, { status: 500 });
  }
}
