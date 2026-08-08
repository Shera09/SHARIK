import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  gst_number: z.string().optional().nullable(),
  status: z.enum(['active', 'prospect', 'inactive', 'churned']),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const leadSchema = z.object({
  name: z.string().min(2, 'Lead name must be at least 2 characters'),
  company: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  source: z.enum(['direct', 'referral', 'website', 'social', 'whatsapp', 'cold_call', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
  value: z.number().min(0, 'Value cannot be negative'),
  probability: z.number().min(0, 'Probability cannot be below 0').max(100, 'Probability cannot exceed 100'),
  assigned_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  hsn: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  amount: z.number(),
  gst_rate: z.number().min(0),
  gst_amount: z.number(),
});

export const invoiceSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customer_phone: z.string().optional().nullable(),
  customer_gst: z.string().optional().nullable(),
  billing_address: z.string().optional().nullable(),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().optional().nullable(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number().min(0),
  gst_rate: z.number().min(0),
  gst_amount: z.number().min(0),
  total: z.number().min(0),
  status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']),
  notes: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  assignee: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  due_date: z.string().optional().nullable(),
});

export const companySettingsSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  tagline: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
});
