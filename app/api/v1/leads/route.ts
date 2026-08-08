import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EnterpriseAPIKeyManager } from '@/lib/api-key-manager';

export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const authResult = await EnterpriseAPIKeyManager.authenticateKey(apiKey || '', 'leads:read');

  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.reason || 'Unauthorized API Key' }, { status: 401 });
  }

  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .limit(50);

    return NextResponse.json({
      success: true,
      count: leads?.length || 0,
      data: leads || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const authResult = await EnterpriseAPIKeyManager.authenticateKey(apiKey || '', 'leads:write');

  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.reason || 'Unauthorized API Key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data: created, error } = await supabase
      .from('leads')
      .insert({
        title: body.title || 'New API Lead',
        contact_name: body.contact_name || 'Prospect',
        email: body.email || 'prospect@company.com',
        phone: body.phone || '',
        value: body.value || 5000,
        status: 'new',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, lead: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create lead via API' }, { status: 500 });
  }
}
