/**
 * SHARIK CRM - Sprint 4A Global Payments Platform Test Suite
 * Vitest-compatible: tests Provider Abstraction, Stripe/Razorpay checkout,
 * Webhook signature verification, and invoice tax calculations.
 */

import { describe, it, expect } from 'vitest';
import { PaymentProviderFactory, StripePaymentProvider, RazorpayPaymentProvider } from '../lib/payment-provider-factory';
import { EnterpriseBillingEngine, InvoiceLineItem } from '../lib/billing-engine';

describe('Payment Provider Factory', () => {
  it('should resolve Stripe provider with correct id', () => {
    const provider = PaymentProviderFactory.getProvider('stripe');
    expect(provider.id).toBe('stripe');
    expect(provider.name).toBeTruthy();
  });

  it('should resolve Razorpay provider with correct id', () => {
    const provider = PaymentProviderFactory.getProvider('razorpay');
    expect(provider.id).toBe('razorpay');
  });

  it('should resolve PayPal provider', () => {
    const provider = PaymentProviderFactory.getProvider('paypal');
    expect(provider.id).toBe('paypal');
  });

  it('should throw for unsupported provider id', () => {
    expect(() => PaymentProviderFactory.getProvider('nonexistent' as any)).toThrow();
  });
});

describe('Stripe Engine', () => {
  it('should generate a checkout session with valid session_id and checkout_url', async () => {
    const provider = new StripePaymentProvider();
    const session = await provider.createCheckoutSession({
      tenant_id: '00000000-0000-0000-0000-000000000001',
      amount: 4999,
      currency: 'USD',
      plan_type: 'professional',
      billing_cycle: 'monthly',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    expect(session.session_id).toMatch(/^cs_stripe_/);
    expect(session.checkout_url).toBeTruthy();
    expect(session.provider).toBe('stripe');
  });

  it('should validate Stripe webhook signature format (t= v1=)', () => {
    const provider = new StripePaymentProvider();
    const validSig = 't=1600000000,v1=mock_signature_hash';
    const invalidSig = 'invalid_format_string';
    expect(provider.verifyWebhookSignature('payload', validSig, 'secret')).toBe(true);
    expect(provider.verifyWebhookSignature('payload', invalidSig, 'secret')).toBe(false);
  });

  it('should parse a Stripe webhook event payload', () => {
    const provider = new StripePaymentProvider();
    const mockPayload = {
      id: 'evt_stripe_123',
      type: 'payment_intent.succeeded',
      data: { object: { amount: 5000, currency: 'usd', id: 'pi_test', metadata: { tenant_id: 'tenant_abc' } } },
    };
    const parsed = provider.parseWebhookEvent(mockPayload);
    expect(parsed.provider).toBe('stripe');
    expect(parsed.event_type).toBe('payment_intent.succeeded');
    expect(parsed.amount).toBe(50); // 5000 cents -> $50
    expect(parsed.tenant_id).toBe('tenant_abc');
  });
});

describe('Razorpay Engine', () => {
  it('should create an order with order_id format', async () => {
    const provider = new RazorpayPaymentProvider();
    const result = await provider.createCheckoutSession({
      tenant_id: 'tenant_123',
      amount: 5000,
      currency: 'INR',
      plan_type: 'starter',
      billing_cycle: 'monthly',
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
    });
    expect(result.provider).toBe('razorpay');
    expect(result.session_id).toMatch(/^order_rzp_/);
  });
});

describe('Invoice Billing Engine', () => {
  it('should calculate 18% GST tax correctly on a single line item', () => {
    const items: InvoiceLineItem[] = [
      { description: 'Professional Plan', quantity: 1, unit_price: 4000, tax_rate: 18 },
    ];
    const totals = EnterpriseBillingEngine.calculateInvoiceTotals(items, 0, 'INR');
    expect(totals.subtotal).toBe(4000);
    expect(totals.tax_total).toBe(720);
    expect(totals.total_amount).toBe(4720);
    expect(totals.currency).toBe('INR');
  });

  it('should apply discount before tax calculation', () => {
    const items: InvoiceLineItem[] = [
      { description: 'Enterprise Plan', quantity: 1, unit_price: 10000, tax_rate: 18 },
    ];
    // 10% discount: taxable = 9000, tax = 1620, total = 10620
    const totals = EnterpriseBillingEngine.calculateInvoiceTotals(items, 10, 'INR');
    expect(totals.discount_total).toBe(1000);
    expect(totals.total_amount).toBe(10620);
  });

  it('should generate invoice numbers in INV-YYYYMM-XXXX format', () => {
    const number = EnterpriseBillingEngine.generateInvoiceNumber();
    expect(number).toMatch(/^INV-\d{6}-\d{4}$/);
  });
});
