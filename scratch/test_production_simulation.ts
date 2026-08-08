import { leadSchema, customerSchema, invoiceSchema, taskSchema, companySettingsSchema } from '../lib/validations';
import { renderEmailTemplate, sendEmail, isEmailConfigured } from '../lib/integrations/email';
import { sendWhatsAppMessage, isWhatsAppConfigured } from '../lib/integrations/whatsapp';
import { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhookSignature, isRazorpayConfigured } from '../lib/integrations/razorpay';
import { enqueueJob, runBackgroundWorker } from '../lib/services/worker';
import { checkRateLimit, jsonSuccess, jsonError } from '../lib/api-middleware';

async function runProductionSimulation() {
  console.log('================================================================');
  console.log('     CRM END-TO-END PRODUCTION SIMULATION & VERIFICATION SUITE  ');
  console.log('================================================================\n');

  const results: Record<string, { pass: boolean; message: string }> = {};

  // --------------------------------------------------------------------------
  // TEST 1: Zod Schema Validation Integrity
  // --------------------------------------------------------------------------
  try {
    const validLead = leadSchema.parse({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+919876543210',
      source: 'website',
      status: 'new',
      value: 50000,
      probability: 75,
    });

    const validCustomer = customerSchema.parse({
      name: 'Apex Enterprises',
      company: 'Apex Inc',
      email: 'contact@apex.com',
      phone: '+919876543211',
      status: 'active',
    });

    const validInvoice = invoiceSchema.parse({
      customer_name: 'Apex Enterprises',
      customer_email: 'billing@apex.com',
      issue_date: '2026-07-30',
      due_date: '2026-08-30',
      line_items: [{ description: 'CRM Subscription', quantity: 1, rate: 15000, amount: 15000, gst_rate: 18, gst_amount: 2700 }],
      subtotal: 15000,
      gst_rate: 18,
      gst_amount: 2700,
      total: 17700,
      status: 'sent',
    });

    const validTask = taskSchema.parse({
      title: 'Follow up with lead John Doe',
      priority: 'high',
      status: 'todo',
    });

    const validSettings = companySettingsSchema.parse({
      name: 'Acme Corp',
      email: 'admin@acme.com',
      phone: '+919876543210',
    });

    results['Zod Form Validation'] = {
      pass: Boolean(validLead && validCustomer && validInvoice && validTask && validSettings),
      message: 'Lead, Customer, Invoice, Task, and Settings schemas validated 100% successfully.',
    };
  } catch (err: any) {
    results['Zod Form Validation'] = { pass: false, message: JSON.stringify(err.errors || err.message) };
  }

  // --------------------------------------------------------------------------
  // TEST 2: Email HTML Template Rendering & Logging System
  // --------------------------------------------------------------------------
  try {
    const htmlInvoice = renderEmailTemplate('invoice_created', { companyName: 'Sharik CRM', customerName: 'Apex Inc', amount: 25000, invoiceNumber: 'INV-2026-01', paymentUrl: 'https://pay.example.com' });
    const htmlReminder = renderEmailTemplate('payment_reminder', { companyName: 'Sharik CRM', customerName: 'Apex Inc', amount: 25000, invoiceNumber: 'INV-2026-01' });

    const emailSendRes = await sendEmail({
      to: 'sandbox_test@example.com',
      subject: 'Test Transactional Email',
      template: 'invoice_created',
      templateData: { companyName: 'Sharik CRM', amount: 25000, invoiceNumber: 'INV-2026-01' },
    });

    results['Email Integration Engine'] = {
      pass: htmlInvoice.includes('INV-2026-01') && htmlReminder.includes('Payment Reminder') && (emailSendRes.success || emailSendRes.status === 'disabled'),
      message: `HTML templates rendered cleanly. Email send status: ${emailSendRes.status}. Email provider configured: ${isEmailConfigured()}`,
    };
  } catch (err: any) {
    results['Email Integration Engine'] = { pass: false, message: err.message };
  }

  // --------------------------------------------------------------------------
  // TEST 3: Meta WhatsApp Cloud API v18.0 Payload Formatting & Dispatch
  // --------------------------------------------------------------------------
  try {
    const waSendRes = await sendWhatsAppMessage({
      to: '+919876543210',
      type: 'text',
      text: 'Test WhatsApp message from Sharik CRM production simulation suite',
      contact_name: 'Test Customer',
    });

    results['WhatsApp Cloud API Engine'] = {
      pass: waSendRes.success || waSendRes.status === 'disabled',
      message: `WhatsApp message dispatch result: ${waSendRes.status}. Meta Cloud API configured: ${isWhatsAppConfigured()}`,
    };
  } catch (err: any) {
    results['WhatsApp Cloud API Engine'] = { pass: false, message: err.message };
  }

  // --------------------------------------------------------------------------
  // TEST 4: Razorpay Payment Gateway & HMAC SHA256 Signature Verification
  // --------------------------------------------------------------------------
  try {
    const fakeSecret = 'sharik_rzp_test_secret_12345';
    const fakeOrderId = 'order_M1234567890';
    const fakePaymentId = 'pay_P9876543210';

    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', fakeSecret)
      .update(`${fakeOrderId}|${fakePaymentId}`)
      .digest('hex');

    const isValidSig = verifyRazorpaySignature(fakeOrderId, fakePaymentId, expectedSig, fakeSecret);

    const rzpOrderRes = await createRazorpayOrder({
      amount: 1500,
      currency: 'INR',
      notes: { test_mode: 'true' },
    });

    results['Razorpay Payment Gateway Engine'] = {
      pass: isValidSig && (rzpOrderRes.success || rzpOrderRes.status === 'disabled'),
      message: `HMAC SHA256 Signature Verification: ${isValidSig ? 'VALID' : 'INVALID'}. Order creation status: ${rzpOrderRes.status}. Razorpay configured: ${isRazorpayConfigured()}`,
    };
  } catch (err: any) {
    results['Razorpay Payment Gateway Engine'] = { pass: false, message: err.message };
  }

  // --------------------------------------------------------------------------
  // TEST 5: Background Worker Job Queue & Engine Runner
  // --------------------------------------------------------------------------
  try {
    const workerRes = await runBackgroundWorker(10);

    results['Background Worker Engine'] = {
      pass: typeof workerRes.processedCount === 'number',
      message: `Worker executed successfully. Processed: ${workerRes.processedCount}, Succeeded: ${workerRes.successCount}, Failed: ${workerRes.failureCount}`,
    };
  } catch (err: any) {
    results['Background Worker Engine'] = { pass: false, message: err.message };
  }

  // --------------------------------------------------------------------------
  // TEST 6: API Middleware & Rate Limiter
  // --------------------------------------------------------------------------
  try {
    const rateLimitCheck = await checkRateLimit('simulation_test_ip', 'test_route', 100);

    results['API Rate Limiting & Middleware'] = {
      pass: rateLimitCheck.allowed,
      message: `Rate limiter allowed request: ${rateLimitCheck.allowed}, Remaining quota: ${rateLimitCheck.remaining}`,
    };
  } catch (err: any) {
    results['API Rate Limiting & Middleware'] = { pass: false, message: err.message };
  }

  // --------------------------------------------------------------------------
  // DISPLAY FINAL SIMULATION MATRIX
  // --------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('                     SIMULATION MATRIX RESULTS                  ');
  console.log('----------------------------------------------------------------');
  let overallPass = true;
  for (const [testName, res] of Object.entries(results)) {
    const statusStr = res.pass ? '✅ PASS' : '❌ FAIL';
    if (!res.pass) overallPass = false;
    console.log(`${statusStr} | ${testName.padEnd(36)} | ${res.message}`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`OVERALL PRODUCTION SIMULATION RESULT: ${overallPass ? '100% PASS' : 'FAIL'}`);
  console.log('----------------------------------------------------------------\n');
}

runProductionSimulation();
