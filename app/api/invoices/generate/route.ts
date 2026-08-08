import { NextResponse } from 'next/server';
import { EnterpriseBillingEngine, InvoiceLineItem } from '@/lib/billing-engine';
import { validateRequestBody } from '@/lib/api-middleware';
import { z } from 'zod';

const generateInvoiceSchema = z.object({
  tenant_id: z.string().uuid(),
  subscription_id: z.string().uuid().optional(),
  discount_percent: z.number().min(0).max(100).default(0),
  currency: z.string().default('INR'),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().int().min(1),
      unit_price: z.number().positive(),
      tax_rate: z.number().optional(),
    })
  ),
});

export async function POST(request: Request) {
  const { data: body, errorResponse } = await validateRequestBody(request, generateInvoiceSchema);
  if (errorResponse || !body) {
    return errorResponse || NextResponse.json({ error: 'Invalid invoice payload' }, { status: 400 });
  }

  try {
    const invoiceData = await EnterpriseBillingEngine.generateInvoice(
      body.tenant_id,
      body.items as InvoiceLineItem[],
      body.subscription_id,
      body.discount_percent,
      body.currency
    );

    return NextResponse.json({ success: true, invoice: invoiceData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invoice generation failed' }, { status: 500 });
  }
}
