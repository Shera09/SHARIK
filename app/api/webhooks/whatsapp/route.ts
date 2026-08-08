import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, jsonError, jsonSuccess } from '@/lib/api-middleware';

/**
 * GET Handler: Meta WhatsApp Webhook Verification
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'sharik_wa_verify_token_2026';

  if (mode === 'subscribe' && token === expectedVerifyToken) {
    console.log('[WhatsApp Webhook] Webhook challenge verified successfully.');
    return new Response(challenge || '', { status: 200 });
  }

  return jsonError('Forbidden: Invalid webhook verify token', 403);
}

/**
 * POST Handler: Inbound WhatsApp Messages & Status Receipts
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit(ip, 'api/webhooks/whatsapp', 100);
  if (!allowed) {
    return jsonError('Rate limit exceeded', 429);
  }

  try {
    const payload = await req.json();

    // Idempotency / Deduplication check
    const eventId = payload?.entry?.[0]?.id || `wa_${Date.now()}`;
    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('idempotency_key', eventId)
      .single();

    if (existingLog) {
      return jsonSuccess({ duplicate: true }, 'Webhook already processed');
    }

    // Log incoming webhook payload
    await supabase.from('webhook_logs').insert({
      provider: 'whatsapp',
      event_type: 'whatsapp_webhook_event',
      idempotency_key: eventId,
      payload,
      status: 'received',
    });

    const entries = payload?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        // 1. Process Status Receipts (sent, delivered, read, failed)
        const statuses = value.statuses || [];
        for (const statusObj of statuses) {
          const status = statusObj.status; // 'sent', 'delivered', 'read', 'failed'
          const recipientPhone = statusObj.recipient_id;

          if (recipientPhone && status) {
            await supabase
              .from('whatsapp_messages')
              .update({ status, updated_at: new Date().toISOString() })
              .eq('phone', recipientPhone);
          }
        }

        // 2. Process Inbound Messages
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        const contactMap = new Map(contacts.map((c: any) => [c.wa_id, c.profile?.name || 'Contact']));

        for (const msg of messages) {
          const senderPhone = msg.from;
          const contactName = contactMap.get(senderPhone) || senderPhone;
          let bodyText = '[Media/Unsupported Message]';

          if (msg.type === 'text') {
            bodyText = msg.text?.body || '';
          } else if (msg.type === 'image') {
            bodyText = `[Image] ${msg.image?.caption || ''}`;
          } else if (msg.type === 'document') {
            bodyText = `[Document] ${msg.document?.filename || ''}`;
          }

          // Insert inbound message into Supabase
          await supabase.from('whatsapp_messages').insert({
            phone: senderPhone,
            contact_name: contactName,
            message: bodyText,
            direction: 'inbound',
            status: 'received',
          });
        }
      }
    }

    return jsonSuccess({ processed: true }, 'Webhook processed successfully');
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Processing Exception:', err);
    return jsonError(err.message || 'Webhook processing failed', 500);
  }
}
