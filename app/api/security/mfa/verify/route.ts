import { NextResponse } from 'next/server';
import { EnterpriseMFAEngine } from '@/lib/mfa-engine';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const verifySchema = z.object({
  secret: z.string().optional(),
  code: z.string(),
  is_backup_code: z.boolean().default(false),
  user_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, verifySchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    if (body.is_backup_code) {
      if (!body.user_id || !body.tenant_id) {
        return NextResponse.json({ error: 'user_id and tenant_id are required for backup code verification' }, { status: 400 });
      }
      const redeemed = await EnterpriseMFAEngine.verifyAndRedeemBackupCode(body.user_id, body.tenant_id, body.code);
      if (!redeemed) {
        return NextResponse.json({ error: 'Invalid or previously redeemed backup code' }, { status: 400 });
      }
      return NextResponse.json({ success: true, verified: true, type: 'backup_code' });
    }

    if (!body.secret) {
      return NextResponse.json({ error: 'secret is required for TOTP verification' }, { status: 400 });
    }

    const isValid = EnterpriseMFAEngine.verifyTOTPCode(body.secret, body.code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 6-digit TOTP verification code' }, { status: 400 });
    }

    return NextResponse.json({ success: true, verified: true, type: 'totp' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'MFA verification failed' }, { status: 500 });
  }
}
