import { fetchWithRetry } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';

export type TransactionalEmailTemplate = 'invoice_created' | 'payment_reminder' | 'welcome' | 'notification';

export type SendEmailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: TransactionalEmailTemplate;
  templateData?: Record<string, any>;
  organization_id?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));
}

/**
 * Renders built-in HTML template based on template type and variables.
 */
export function renderEmailTemplate(template: TransactionalEmailTemplate, data: Record<string, any>): string {
  const brandColor = '#4f46e5';
  const companyName = data.companyName || 'CRM Platform';

  switch (template) {
    case 'invoice_created':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: ${brandColor}; margin-bottom: 8px;">${companyName}</h2>
          <h3 style="color: #111827;">New Invoice Issued: #${data.invoiceNumber || 'INV-001'}</h3>
          <p style="color: #4b5563;">Hello ${data.customerName || 'Valued Customer'},</p>
          <p style="color: #4b5563;">An invoice for <strong>₹${Number(data.amount || 0).toLocaleString('en-IN')}</strong> has been generated for your account.</p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #374151;"><strong>Due Date:</strong> ${data.dueDate || 'Upon receipt'}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Amount Due:</strong> ₹${Number(data.amount || 0).toLocaleString('en-IN')}</p>
          </div>
          ${data.paymentUrl ? `<a href="${data.paymentUrl}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Pay Invoice Now</a>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Thank you for your business!</p>
        </div>
      `;

    case 'payment_reminder':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: ${brandColor}; margin-bottom: 8px;">${companyName}</h2>
          <h3 style="color: #dc2626;">Payment Reminder: Invoice #${data.invoiceNumber || 'INV-001'}</h3>
          <p style="color: #4b5563;">Hello ${data.customerName || 'Valued Customer'},</p>
          <p style="color: #4b5563;">This is a friendly reminder that invoice #${data.invoiceNumber} for <strong>₹${Number(data.amount || 0).toLocaleString('en-IN')}</strong> is due for payment.</p>
          ${data.paymentUrl ? `<a href="${data.paymentUrl}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">Make Payment</a>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you have already paid, please ignore this notice.</p>
        </div>
      `;

    case 'welcome':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: ${brandColor}; margin-bottom: 8px;">Welcome to ${companyName}!</h2>
          <p style="color: #4b5563;">Hello ${data.userName || 'there'},</p>
          <p style="color: #4b5563;">We are excited to have you on board. Your account has been configured successfully.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Need help? Reply to this email anytime.</p>
        </div>
      `;

    case 'notification':
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: ${brandColor}; margin-bottom: 8px;">${companyName} Notification</h2>
          <p style="color: #4b5563;">${data.message || data.body || 'You have a new update in your CRM account.'}</p>
        </div>
      `;
  }
}

/**
 * Sends transactional or marketing email via Resend REST API or SMTP fallback.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  emailId?: string;
  error?: string;
  status: string;
}> {
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com';
  const htmlContent = options.template
    ? renderEmailTemplate(options.template, options.templateData || {})
    : options.html || `<p>${options.text || options.subject}</p>`;

  if (!isEmailConfigured()) {
    console.warn('[Email Integration] No API key / SMTP credentials in env. Logging disabled state.');
    try {
      await supabase.from('email_logs').insert({
        recipient: options.to,
        subject: options.subject,
        provider: 'disabled',
        status: 'disabled_no_credentials',
        organization_id: options.organization_id || null,
        metadata: { template: options.template },
      });
    } catch {}
    return {
      success: false,
      error: 'Email provider credentials not configured in environment variables',
      status: 'disabled',
    };
  }

  // Primary Provider: Resend REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetchWithRetry(
        'https://api.resend.com/emails',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [options.to],
            subject: options.subject,
            html: htmlContent,
          }),
        },
        3,
        10000
      );

      const resData = await res.json();

      if (!res.ok) {
        const errorMsg = resData?.message || res.statusText;
        console.error('[Email Integration] Resend API error:', errorMsg);

        await supabase.from('email_logs').insert({
          recipient: options.to,
          subject: options.subject,
          provider: 'resend',
          status: 'failed',
          error_message: errorMsg,
          organization_id: options.organization_id || null,
        });

        return { success: false, error: errorMsg, status: 'failed' };
      }

      await supabase.from('email_logs').insert({
        recipient: options.to,
        subject: options.subject,
        provider: 'resend',
        status: 'sent',
        organization_id: options.organization_id || null,
        metadata: { resend_id: resData.id, template: options.template },
      });

      return { success: true, emailId: resData.id, status: 'sent' };
    } catch (err: any) {
      console.error('[Email Integration] Exception during Resend request:', err);

      await supabase.from('email_logs').insert({
        recipient: options.to,
        subject: options.subject,
        provider: 'resend',
        status: 'failed',
        error_message: err.message,
        organization_id: options.organization_id || null,
      });

      return { success: false, error: err.message, status: 'failed' };
    }
  }

  return { success: false, error: 'Configured email provider failed execution', status: 'failed' };
}
