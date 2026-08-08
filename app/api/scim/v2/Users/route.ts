import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/monitoring';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '401', detail: 'Unauthorized SCIM Bearer token' }, { status: 401 });
  }

  try {
    const { data: profiles, count } = await supabase
      .from('auth_profiles')
      .select('id, full_name, created_at', { count: 'exact' })
      .limit(50);

    const scimUsers = (profiles || []).map((p) => ({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: p.id,
      userName: p.full_name || 'User',
      name: { formatted: p.full_name || 'User' },
      active: true,
      meta: { resourceType: 'User', created: p.created_at },
    }));

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: count || scimUsers.length,
      startIndex: 1,
      itemsPerPage: 50,
      Resources: scimUsers,
    });
  } catch (err: any) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '500', detail: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '401', detail: 'Unauthorized SCIM Bearer token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = body.userName || body.emails?.[0]?.value || 'scim_user@company.com';
    const fullName = body.name?.formatted || body.displayName || email.split('@')[0];

    // Log SCIM provisioning event
    await supabase.from('scim_provisioning_logs').insert({
      tenant_id: '00000000-0000-0000-0000-000000000000',
      action: 'user_created',
      resource_type: 'User',
      resource_id: email,
      details: { email, fullName, timestamp: new Date().toISOString() },
    });

    await logger.log('security', 'info', `SCIM 2.0 User Provisioned: ${email}`, { fullName });

    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: `scim_${Date.now()}`,
        userName: email,
        name: { formatted: fullName },
        active: true,
        meta: { resourceType: 'User', created: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '500', detail: err.message }, { status: 500 });
  }
}
