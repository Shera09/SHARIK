/**
 * SHARIK CRM Enterprise Billing Engine
 * Manages invoice numbers, tax lines (18% GST / VAT), credit notes,
 * multi-currency formatting, and checkout session routing.
 */

import { supabase } from '@/lib/supabase';
import { PaymentProviderFactory, SupportedPaymentProvider, CheckoutSessionParams, CheckoutSessionResult } from '@/lib/payment-provider-factory';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number; // e.g. 18%
}

export interface GeneratedInvoiceData {
  invoice_number: string;
  tenant_id: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total_amount: number;
  currency: string;
  items: InvoiceLineItem[];
  pdf_url: string;
  due_date: string;
}

export class EnterpriseBillingEngine {
  /**
   * Format Invoice Number: INV-YYYYMM-XXXX
   */
  static generateInvoiceNumber(): string {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yearMonth}-${randomSeq}`;
  }

  /**
   * Calculate Tax Lines & Subtotals
   */
  static calculateInvoiceTotals(items: InvoiceLineItem[], discountPercent: number = 0, currency: string = 'INR') {
    let subtotal = 0;
    let taxTotal = 0;

    for (const item of items) {
      const lineAmount = item.quantity * item.unit_price;
      const itemTaxRate = item.tax_rate ?? 18; // Default 18% GST/VAT
      const lineTax = lineAmount * (itemTaxRate / 100);

      subtotal += lineAmount;
      taxTotal += lineTax;
    }

    const discountTotal = subtotal * (discountPercent / 100);
    const taxableSubtotal = subtotal - discountTotal;
    const finalTax = taxableSubtotal * (18 / 100);
    const totalAmount = taxableSubtotal + finalTax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax_total: Math.round(finalTax * 100) / 100,
      discount_total: Math.round(discountTotal * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      currency,
    };
  }

  /**
   * Create Checkout Session via PaymentProviderFactory
   */
  static async createCheckoutSession(
    providerId: SupportedPaymentProvider,
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult> {
    const provider = PaymentProviderFactory.getProvider(providerId);
    return provider.createCheckoutSession(params);
  }

  /**
   * Generate Invoice Record in DB
   */
  static async generateInvoice(
    tenantId: string,
    items: InvoiceLineItem[],
    subscriptionId?: string,
    discountPercent: number = 0,
    currency: string = 'INR'
  ): Promise<GeneratedInvoiceData> {
    const invoiceNumber = this.generateInvoiceNumber();
    const totals = this.calculateInvoiceTotals(items, discountPercent, currency);
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(); // 15-day terms
    const pdfUrl = `/api/invoices/download?invoice=${invoiceNumber}`;

    const { data: invoice } = await supabase
      .from('invoices')
      .insert({
        tenant_id: tenantId,
        subscription_id: subscriptionId || null,
        invoice_number: invoiceNumber,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
        discount_total: totals.discount_total,
        total_amount: totals.total_amount,
        currency: totals.currency,
        status: 'open',
        pdf_url: pdfUrl,
        due_date: dueDate,
      })
      .select('*')
      .single();

    if (invoice) {
      for (const item of items) {
        await supabase.from('invoice_items').insert({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          tax_rate: item.tax_rate ?? 18,
        });
      }
    }

    return {
      invoice_number: invoiceNumber,
      tenant_id: tenantId,
      subtotal: totals.subtotal,
      tax_total: totals.tax_total,
      discount_total: totals.discount_total,
      total_amount: totals.total_amount,
      currency: totals.currency,
      items,
      pdf_url: pdfUrl,
      due_date: dueDate,
    };
  }
}
