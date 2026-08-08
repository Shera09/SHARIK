import { NextResponse } from 'next/server';
import { EnterpriseMFAEngine } from '@/lib/mfa-engine';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const setupSchema = z.object({
  user_email: z.string().email(),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, setupSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const setupData = EnterpriseMFAEngine.generateTOTPSecret(body.user_email);
    const backupCodes = EnterpriseMFAEngine.generateBackupCodes(10);

    return NextResponse.json({
      success: true,
      mfa_setup: setupData,
      backup_codes: backupCodes.rawCodes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'MFA setup failed' }, { status: 500 });
  }
}
