import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/integrations/whatsapp';
import { sendEmail } from '@/lib/integrations/email';

export type JobType = 'invoice_reminder' | 'payment_reminder' | 'whatsapp_campaign' | 'email_campaign' | 'workflow_execution';

export type BackgroundJob = {
  id: string;
  organization_id?: string;
  job_name: JobType;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  last_error?: string;
  scheduled_at: string;
};

/**
 * Enqueues a new background job into Supabase.
 */
export async function enqueueJob(
  jobName: JobType,
  payload: Record<string, any>,
  options?: {
    scheduledAt?: Date;
    maxRetries?: number;
    organization_id?: string;
  }
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('background_jobs')
      .insert({
        job_name: jobName,
        payload,
        status: 'pending',
        scheduled_at: (options?.scheduledAt || new Date()).toISOString(),
        max_retries: options?.maxRetries ?? 3,
        organization_id: options?.organization_id || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, jobId: data.id };
  } catch (err: any) {
    console.error('[Background Worker] Failed to enqueue job:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Main Worker Engine runner that fetches and executes pending background jobs.
 */
export async function runBackgroundWorker(batchSize = 20): Promise<{
  processedCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  const nowISO = new Date().toISOString();
  const errors: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  // 1. Fetch pending jobs scheduled for execution
  const { data: pendingJobs, error: fetchError } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('status', 'pending')
    .is('deleted_at', null)
    .lte('scheduled_at', nowISO)
    .order('scheduled_at', { ascending: true })
    .limit(batchSize);

  if (fetchError || !pendingJobs || pendingJobs.length === 0) {
    return { processedCount: 0, successCount: 0, failureCount: 0, errors: fetchError ? [fetchError.message] : [] };
  }

  for (const job of pendingJobs) {
    // Lock job status to 'processing'
    await supabase
      .from('background_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      await processSingleJob(job as BackgroundJob);

      // Mark completed
      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      successCount++;
    } catch (err: any) {
      failureCount++;
      const errorMessage = err.message || 'Job processing exception';
      errors.push(`Job ${job.id} (${job.job_name}): ${errorMessage}`);

      const nextRetryCount = (job.retry_count || 0) + 1;
      const isFailedPermanently = nextRetryCount >= (job.max_retries || 3);

      await supabase
        .from('background_jobs')
        .update({
          status: isFailedPermanently ? 'failed' : 'pending',
          retry_count: nextRetryCount,
          last_error: errorMessage,
          scheduled_at: isFailedPermanently ? job.scheduled_at : new Date(Date.now() + nextRetryCount * 60000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);
    }
  }

  return {
    processedCount: pendingJobs.length,
    successCount,
    failureCount,
    errors,
  };
}

/**
 * Individual job processor dispatcher.
 */
async function processSingleJob(job: BackgroundJob): Promise<void> {
  const { payload } = job;

  switch (job.job_name) {
    case 'invoice_reminder':
    case 'payment_reminder': {
      const { invoice_id, recipient_email, recipient_phone, customer_name, amount, invoice_number, due_date } = payload;

      if (recipient_email) {
        await sendEmail({
          to: recipient_email,
          subject: `Payment Reminder: Invoice #${invoice_number || 'INV'}`,
          template: 'payment_reminder',
          templateData: { customerName: customer_name, amount, invoiceNumber: invoice_number, dueDate: due_date },
          organization_id: job.organization_id,
        });
      }

      if (recipient_phone) {
        await sendWhatsAppMessage({
          to: recipient_phone,
          type: 'text',
          text: `Hi ${customer_name || 'Customer'}, this is a payment reminder for Invoice #${invoice_number} (Amount: ₹${Number(amount || 0).toLocaleString('en-IN')}). Due date: ${due_date || 'Today'}.`,
          organization_id: job.organization_id,
        });
      }
      break;
    }

    case 'whatsapp_campaign': {
      const { campaign_id, messages } = payload;
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          await sendWhatsAppMessage({
            to: msg.phone,
            type: 'text',
            text: msg.message,
            contact_name: msg.contact_name,
            organization_id: job.organization_id,
          });
        }
      }
      if (campaign_id) {
        await supabase
          .from('whatsapp_campaigns')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
      }
      break;
    }

    case 'email_campaign': {
      const { campaign_id, recipients, subject, body } = payload;
      if (Array.isArray(recipients)) {
        for (const email of recipients) {
          await sendEmail({
            to: email,
            subject: subject || 'Campaign Update',
            html: body,
            organization_id: job.organization_id,
          });
        }
      }
      if (campaign_id) {
        await supabase
          .from('email_campaigns')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
      }
      break;
    }

    case 'workflow_execution': {
      // Execute business rule or automated workflow logic
      console.log(`[Background Worker] Executing workflow: ${payload.workflow_id}`);
      break;
    }

    default:
      throw new Error(`Unsupported job type: ${job.job_name}`);
  }
}
