import { fetchWithRetry } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';

export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio' | 'template';

export type SendWhatsAppOptions = {
  to: string; // Recipient phone number (E.164 format e.g. +919876543210)
  type: WhatsAppMessageType;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  templateName?: string;
  languageCode?: string;
  templateComponents?: any[];
  organization_id?: string;
  contact_name?: string;
};

/**
 * Checks whether WhatsApp Cloud API credentials are configured in environment.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_CLOUD_API_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

/**
 * Sends a message via Meta WhatsApp Business Cloud API v18.0.
 */
export async function sendWhatsAppMessage(options: SendWhatsAppOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  status: string;
}> {
  const recipient = options.to.replace(/[^0-9]/g, '');

  if (!isWhatsAppConfigured()) {
    console.warn('[WhatsApp Integration] API credentials not set in environment. Mocking disable log.');
    // Insert into DB as skipped/disabled for record keeping
    try {
      await supabase.from('whatsapp_messages').insert({
        phone: recipient,
        contact_name: options.contact_name || recipient,
        message: options.text || options.templateName || 'WhatsApp Message',
        direction: 'outbound',
        status: 'disabled_no_credentials',
        organization_id: options.organization_id || null,
      });
    } catch {}
    return {
      success: false,
      error: 'WhatsApp Cloud API credentials not configured in environment variables',
      status: 'disabled',
    };
  }

  const token = process.env.WHATSAPP_CLOUD_API_TOKEN!;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  let messageBody: Record<string, any> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: options.type,
  };

  switch (options.type) {
    case 'text':
      messageBody.text = { preview_url: false, body: options.text || '' };
      break;
    case 'image':
      messageBody.image = { link: options.mediaUrl, caption: options.caption || '' };
      break;
    case 'document':
      messageBody.document = { link: options.mediaUrl, caption: options.caption || '', filename: options.filename || 'document.pdf' };
      break;
    case 'audio':
      messageBody.audio = { link: options.mediaUrl };
      break;
    case 'template':
      messageBody.template = {
        name: options.templateName,
        language: { code: options.languageCode || 'en_US' },
        components: options.templateComponents || [],
      };
      break;
  }

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageBody),
      },
      3, // 3 retries
      10000 // 10s timeout
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || response.statusText;
      console.error('[WhatsApp Integration] Error from Meta Graph API:', errorMsg);

      await supabase.from('whatsapp_messages').insert({
        phone: recipient,
        contact_name: options.contact_name || recipient,
        message: options.text || options.templateName || 'Outbound Message',
        direction: 'outbound',
        status: 'failed',
        organization_id: options.organization_id || null,
      });

      return { success: false, error: errorMsg, status: 'failed' };
    }

    const waMessageId = data?.messages?.[0]?.id;

    // Log successfully sent message to Supabase
    await supabase.from('whatsapp_messages').insert({
      phone: recipient,
      contact_name: options.contact_name || recipient,
      message: options.text || options.templateName || 'Outbound Message',
      direction: 'outbound',
      status: 'sent',
      organization_id: options.organization_id || null,
    });

    return {
      success: true,
      messageId: waMessageId,
      status: 'sent',
    };
  } catch (err: any) {
    console.error('[WhatsApp Integration] Exception during request:', err);

    await supabase.from('whatsapp_messages').insert({
      phone: recipient,
      contact_name: options.contact_name || recipient,
      message: options.text || options.templateName || 'Outbound Message',
      direction: 'outbound',
      status: 'failed',
      organization_id: options.organization_id || null,
    });

    return {
      success: false,
      error: err.message || 'Network exception sending WhatsApp message',
      status: 'failed',
    };
  }
}
