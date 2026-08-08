import { NextResponse } from 'next/server';
import { EnterpriseAISalesCopilot } from '@/lib/ai-sales-copilot';
import { SupportedAIProvider } from '@/lib/ai-provider-factory';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const copilotSchema = z.object({
  tenant_id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  lead_name: z.string().default('Acme Corp Lead'),
  company: z.string().default('Acme Corp'),
  value: z.number().positive().default(15000),
  provider: z.enum(['openai', 'gemini', 'anthropic', 'azure', 'local']).default('openai'),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, copilotSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid copilot payload' }, { status: 400 });
  }

  try {
    const analysis = await EnterpriseAISalesCopilot.analyzeLead(
      body.tenant_id,
      body.lead_id || '00000000-0000-0000-0000-000000000000',
      body.lead_name ?? 'Acme Corp Lead',
      body.company ?? 'Acme Corp',
      body.value ?? 15000,
      (body.provider as SupportedAIProvider) ?? 'openai'
    );

    const scoreData = EnterpriseAISalesCopilot.calculatePredictiveLeadScore(body.value ?? 15000, 4, 'Enterprise');

    return NextResponse.json({
      success: true,
      analysis,
      predictive_score: scoreData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI Copilot execution failed' }, { status: 500 });
  }
}
