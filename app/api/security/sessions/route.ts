import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EnterpriseSessionManager } from '@/lib/session-manager';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const sessionActionSchema = z.object({
  action: z.enum(['revoke_single', 'logout_all']),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const { data: sessions } = await supabase
      .from('user_active_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, sessions: sessions || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list active sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, sessionActionSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid session payload' }, { status: 400 });
  }

  try {
    if (body.action === 'revoke_single') {
      if (!body.session_id) {
        return NextResponse.json({ error: 'session_id is required for single revocation' }, { status: 400 });
      }
      await EnterpriseSessionManager.revokeSession(body.session_id);
      return NextResponse.json({ success: true, message: 'Session revoked' });
    }

    if (body.action === 'logout_all') {
      if (!body.user_id || !body.tenant_id) {
        return NextResponse.json({ error: 'user_id and tenant_id are required for logout_all' }, { status: 400 });
      }
      await EnterpriseSessionManager.logoutAllDevices(body.user_id, body.tenant_id);
      return NextResponse.json({ success: true, message: 'Logged out of all active devices' });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Session action failed' }, { status: 500 });
  }
}
