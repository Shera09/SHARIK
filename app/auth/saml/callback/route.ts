import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SAMLServiceProviderEngine } from '@/lib/saml-provider';
import { logger } from '@/lib/monitoring';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const samlResponse = formData.get('SAMLResponse') as string;
  const relayState = formData.get('RelayState') as string; // Contains tenant_id

  if (!samlResponse) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_saml_response`);
  }

  try {
    const expectedAudience = `https://sharik.io/saml/sp/${relayState || 'default'}`;
    const assertion = SAMLServiceProviderEngine.parseAndValidateAssertion(samlResponse, expectedAudience);

    if (!assertion.isValid || !assertion.subjectEmail) {
      await supabase.from('security_events').insert({
        event_type: 'saml_login_failed',
        severity: 'high',
        resource: 'auth/saml',
        action: 'saml_assertion_rejected',
        details: { reason: assertion.reason, timestamp: new Date().toISOString() },
      });
      return NextResponse.redirect(`${requestUrl.origin}/login?error=saml_validation_failed`);
    }

    const userEmail = assertion.subjectEmail;
    const fullName = assertion.fullName || userEmail.split('@')[0];

    // Log SAML Audit Event
    await supabase.from('security_events').insert({
      event_type: 'saml_login',
      severity: 'info',
      resource: 'auth/saml',
      action: 'saml_login_success',
      details: { email: userEmail, issuer: assertion.issuer, timestamp: new Date().toISOString() },
    });

    await logger.log('security', 'info', `SAML 2.0 SSO Success for ${userEmail}`, { issuer: assertion.issuer }, relayState);

    return NextResponse.redirect(`${requestUrl.origin}/dashboard?sso=saml_success`);
  } catch (err: any) {
    console.error('[SAML Callback Error]:', err);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=saml_exception`);
  }
}
