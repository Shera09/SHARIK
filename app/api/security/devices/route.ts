import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EnterpriseDeviceTrustEngine } from '@/lib/device-trust';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const revokeDeviceSchema = z.object({
  device_id: z.string().uuid(),
});

export async function GET() {
  try {
    const { data: devices } = await supabase
      .from('user_trusted_devices')
      .select('*')
      .order('last_used_at', { ascending: false });

    return NextResponse.json({ success: true, devices: devices || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list devices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, revokeDeviceSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid device revocation payload' }, { status: 400 });
  }

  try {
    const revoked = await EnterpriseDeviceTrustEngine.revokeDevice(body.device_id);
    if (!revoked) {
      return NextResponse.json({ error: 'Device not found or failed to revoke' }, { status: 400 });
    }
    return NextResponse.json({ success: true, revoked: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Device revocation failed' }, { status: 500 });
  }
}
