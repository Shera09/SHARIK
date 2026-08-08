import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '401', detail: 'Unauthorized SCIM Bearer token' }, { status: 401 });
  }

  const defaultGroups = [
    { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], id: 'grp_admin', displayName: 'Administrators', members: [] },
    { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], id: 'grp_sales', displayName: 'Sales Team', members: [] },
    { schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'], id: 'grp_support', displayName: 'Support Agents', members: [] },
  ];

  return NextResponse.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: defaultGroups.length,
    startIndex: 1,
    itemsPerPage: 50,
    Resources: defaultGroups,
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '401', detail: 'Unauthorized SCIM Bearer token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const groupName = body.displayName || 'Synced Group';
    const groupId = `grp_${Date.now()}`;

    await supabase.from('scim_provisioning_logs').insert({
      tenant_id: '00000000-0000-0000-0000-000000000000',
      action: 'group_synced',
      resource_type: 'Group',
      resource_id: groupId,
      details: { displayName: groupName, timestamp: new Date().toISOString() },
    });

    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        id: groupId,
        displayName: groupName,
        members: body.members || [],
        meta: { resourceType: 'Group', created: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], status: '500', detail: err.message }, { status: 500 });
  }
}
