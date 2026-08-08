import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EnterpriseAPIKeyManager } from '@/lib/api-key-manager';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const createKeySchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(2),
  scopes: z.array(z.string()).default(['leads:read', 'leads:write']),
  expiration_days: z.number().optional(),
});

export async function GET() {
  try {
    const { data: keys } = await supabase
      .from('public_api_keys')
      .select('id, name, key_prefix, scopes, rate_limit_per_min, expires_at, last_rotated_at, is_active, created_at')
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, api_keys: keys || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list API keys' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, createKeySchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const createdKey = await EnterpriseAPIKeyManager.createAPIKey(
      body.tenant_id,
      body.name,
      body.scopes,
      60,
      body.expiration_days
    );

    return NextResponse.json({ success: true, api_key: createdKey }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'API key creation failed' }, { status: 500 });
  }
}
