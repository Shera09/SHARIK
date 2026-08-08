import { supabase } from '@/lib/supabase';

export type ResponseBlock =
  | { kind: 'data'; title: string; lines: string[] }
  | { kind: 'recommendation'; lines: string[] }
  | { kind: 'clarify'; lines: string[] };

export type AIResult = {
  blocks: ResponseBlock[];
  sources: string[];
};

interface LeadRecord {
  name: string;
  company?: string;
  status: string;
  value?: number | string;
  probability?: number;
  follow_up_date?: string;
  assigned_to?: string;
}

interface InvoiceRecord {
  invoice_number: string;
  customer_name: string;
  total: number | string;
  due_date?: string;
  status: string;
}

interface PaymentRecord {
  amount: number | string;
  payment_date: string;
  method?: string;
  status: string;
}

interface CustomerRecord {
  name: string;
  company?: string;
  status?: string;
  total_revenue?: number | string;
  city?: string;
  state?: string;
  created_at?: string;
}

interface TaskRecord {
  title: string;
  assignee?: string;
  priority: string;
  status: string;
  due_date?: string;
}

interface EmployeeRecord {
  name: string;
  role?: string;
  department?: string;
  status: string;
  salary?: number | string;
  hire_date?: string;
}

interface ExpenseRecord {
  category?: string;
  amount: number | string;
  vendor?: string;
  status: string;
  expense_date?: string;
}

type Intent =
  | 'pipeline'
  | 'overdue_invoices'
  | 'revenue'
  | 'customers'
  | 'tasks'
  | 'employees'
  | 'expenses'
  | 'unknown';

const INTENT_KEYWORDS: { intent: Intent; words: string[] }[] = [
  { intent: 'pipeline', words: ['pipeline', 'lead', 'deal', 'prospect', 'follow up', 'follow-up'] },
  { intent: 'overdue_invoices', words: ['overdue', 'invoice', 'unpaid', 'bill', 'gst'] },
  { intent: 'revenue', words: ['revenue', 'income', 'payment', 'quarter', 'earn', 'cash flow', 'mrr'] },
  { intent: 'customers', words: ['customer', 'client', 'churn', 're-engage', 'reengage'] },
  { intent: 'tasks', words: ['task', 'todo', 'to-do', 'pending', 'due'] },
  { intent: 'employees', words: ['employee', 'team', 'staff', 'payroll', 'hire', 'headcount'] },
  { intent: 'expenses', words: ['expense', 'spend', 'cost', 'vendor', 'budget'] },
];

function classifyIntent(question: string): Intent {
  const q = question.toLowerCase();
  let best: Intent = 'unknown';
  let bestScore = 0;
  for (const { intent, words } of INTENT_KEYWORDS) {
    const score = words.filter((w) => q.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export async function answerBusinessQuestion(question: string): Promise<AIResult> {
  const intent = classifyIntent(question);

  switch (intent) {
    case 'pipeline':
      return handlePipeline(question);
    case 'overdue_invoices':
      return handleOverdueInvoices();
    case 'revenue':
      return handleRevenue(question);
    case 'customers':
      return handleCustomers();
    case 'tasks':
      return handleTasks();
    case 'employees':
      return handleEmployees();
    case 'expenses':
      return handleExpenses();
    default:
      return handleUnknown(question);
  }
}

async function handlePipeline(question: string): Promise<AIResult> {
  const q = question.toLowerCase();
  const needsFollowUp = q.includes('follow');

  const { data: leads } = await supabase
    .from('leads')
    .select('name, company, status, value, probability, follow_up_date, assigned_to')
    .order('created_at', { ascending: false });

  if (!leads || leads.length === 0) {
    return {
      blocks: [
        { kind: 'clarify', lines: ['There are no leads in your system yet. Once you add leads, I can analyze your pipeline value, stage distribution, and follow-up priorities.'] },
      ],
      sources: ['leads'],
    };
  }

  const open = leads.filter((l: LeadRecord) => l.status !== 'won' && l.status !== 'lost');
  const pipelineValue = open.reduce((s: number, l: LeadRecord) => s + Number(l.value || 0), 0);
  const won = leads.filter((l: LeadRecord) => l.status === 'won');
  const wonValue = won.reduce((s: number, l: LeadRecord) => s + Number(l.value || 0), 0);

  const byStatus: Record<string, number> = {};
  for (const l of open) byStatus[l.status] = (byStatus[l.status] || 0) + 1;

  const dataLines = [
    `Open pipeline value: ${inr(pipelineValue)} across ${open.length} active lead${open.length === 1 ? '' : 's'}.`,
    `Closed-won: ${won.length} lead${won.length === 1 ? '' : 's'} worth ${inr(wonValue)}.`,
    `Stage distribution: ${Object.entries(byStatus).map(([s, c]) => `${s} (${c})`).join(', ')}.`,
  ];

  const blocks: ResponseBlock[] = [
    { kind: 'data', title: 'Pipeline Overview (verified from leads table)', lines: dataLines },
  ];

  if (needsFollowUp) {
    const today = new Date().toISOString().slice(0, 10);
    const overdueFollowUps = open
      .filter((l: LeadRecord) => l.follow_up_date && l.follow_up_date < today)
      .sort((a: LeadRecord, b: LeadRecord) => (a.follow_up_date! < b.follow_up_date! ? -1 : 1));
    if (overdueFollowUps.length > 0) {
      blocks.push({
        kind: 'data',
        title: `Leads with overdue follow-ups (${overdueFollowUps.length})`,
        lines: overdueFollowUps.slice(0, 5).map((l: LeadRecord) => `• ${l.name}${l.company ? ` — ${l.company}` : ''} | follow-up was ${l.follow_up_date} | ${inr(Number(l.value || 0))}`),
      });
      blocks.push({
        kind: 'recommendation',
        lines: [`Reach out to the ${overdueFollowUps.length} lead${overdueFollowUps.length === 1 ? '' : 's'} above today — every day past the follow-up date reduces close probability.`],
      });
    } else {
      blocks.push({ kind: 'data', title: 'Follow-ups', lines: ['No overdue follow-ups. All open leads are on schedule.'] });
    }
  }

  blocks.push({
    kind: 'recommendation',
    lines: ['Focus on leads in the "proposal" or "qualified" stage — they have the highest probability of closing. Move stalled leads to "lost" to keep your pipeline accurate.'],
  });

  return { blocks, sources: ['leads'] };
}

async function handleOverdueInvoices(): Promise<AIResult> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_number, customer_name, total, due_date, status')
    .neq('status', 'paid')
    .order('due_date', { ascending: true });

  if (!invoices || invoices.length === 0) {
    return {
      blocks: [{ kind: 'data', title: 'Invoices (verified)', lines: ['No unpaid invoices found. All invoices are marked as paid.'] }],
      sources: ['invoices'],
    };
  }

  const overdue = invoices.filter((i: InvoiceRecord) => i.due_date && i.due_date < today);
  const outstanding = invoices.reduce((s: number, i: InvoiceRecord) => s + Number(i.total || 0), 0);
  const overdueTotal = overdue.reduce((s: number, i: InvoiceRecord) => s + Number(i.total || 0), 0);

  const blocks: ResponseBlock[] = [
    {
      kind: 'data',
      title: 'Invoice Status (verified from invoices table)',
      lines: [
        `Outstanding: ${invoices.length} unpaid invoice${invoices.length === 1 ? '' : 's'} totaling ${inr(outstanding)}.`,
        overdue.length > 0
          ? `Overdue: ${overdue.length} invoice${overdue.length === 1 ? '' : 's'} past their due date, totaling ${inr(overdueTotal)}.`
          : 'No invoices are past their due date yet.',
      ],
    },
  ];

  if (overdue.length > 0) {
    blocks.push({
      kind: 'data',
      title: `Overdue invoices (${Math.min(overdue.length, 5)} shown)`,
      lines: overdue.slice(0, 5).map((i: InvoiceRecord) => `• ${i.invoice_number} — ${i.customer_name} | due ${i.due_date} | ${inr(Number(i.total))}`),
    });
    blocks.push({
      kind: 'recommendation',
      lines: [
        'Send payment reminders via Email Campaigns or WhatsApp for the overdue invoices above.',
        'For repeat offenders, consider requiring advance payments on future invoices.',
      ],
    });
  }

  return { blocks, sources: ['invoices'] };
}

async function handleRevenue(question: string): Promise<AIResult> {
  const q = question.toLowerCase();
  const isQuarter = q.includes('quarter') || q.includes('q1') || q.includes('q2') || q.includes('q3') || q.includes('q4');

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, payment_date, method, status')
    .eq('status', 'completed')
    .order('payment_date', { ascending: false });

  if (!payments || payments.length === 0) {
    return {
      blocks: [
        { kind: 'clarify', lines: ['No completed payments are recorded yet. Once you log payments, I can break down revenue by month, method, or quarter.'] },
      ],
      sources: ['payments'],
    };
  }

  const now = new Date();
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalRevenue = payments.reduce((s: number, p: PaymentRecord) => s + Number(p.amount || 0), 0);
  const quarterRevenue = payments
    .filter((p: PaymentRecord) => new Date(p.payment_date) >= startOfQuarter)
    .reduce((s: number, p: PaymentRecord) => s + Number(p.amount || 0), 0);
  const monthRevenue = payments
    .filter((p: PaymentRecord) => new Date(p.payment_date) >= startOfMonth)
    .reduce((s: number, p: PaymentRecord) => s + Number(p.amount || 0), 0);

  const byMethod: Record<string, number> = {};
  for (const p of payments) byMethod[p.method || 'unknown'] = (byMethod[p.method || 'unknown'] || 0) + Number(p.amount || 0);

  const lines = [
    `Total revenue (all completed payments): ${inr(totalRevenue)}.`,
    `This quarter (${startOfQuarter.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}–now): ${inr(quarterRevenue)}.`,
    `This month: ${inr(monthRevenue)}.`,
    `By method: ${Object.entries(byMethod).map(([m, v]) => `${m} (${inr(v)})`).join(', ')}.`,
  ];

  return {
    blocks: [
      { kind: 'data', title: 'Revenue Breakdown (verified from payments table)', lines },
      {
        kind: 'recommendation',
        lines: [
          isQuarter
            ? 'Your quarterly figure includes all completed payments since the quarter started. Pending payments are not counted.'
            : 'Track MRR by tagging recurring invoice patterns. The Analytics page shows month-over-month trends.',
        ],
      },
    ],
    sources: ['payments'],
  };
}

async function handleCustomers(): Promise<AIResult> {
  const { data: customers } = await supabase
    .from('customers')
    .select('name, company, status, total_revenue, city, state, created_at')
    .order('total_revenue', { ascending: false });

  if (!customers || customers.length === 0) {
    return {
      blocks: [{ kind: 'clarify', lines: ['No customers found. Add customers to get segmentation, revenue, and re-engagement insights.'] }],
      sources: ['customers'],
    };
  }

  const byStatus: Record<string, { count: number; revenue: number }> = {};
  for (const c of customers) {
    const s = c.status || 'unknown';
    if (!byStatus[s]) byStatus[s] = { count: 0, revenue: 0 };
    byStatus[s].count++;
    byStatus[s].revenue += Number(c.total_revenue || 0);
  }

  const topCustomers = customers.slice(0, 5);
  const inactive = customers.filter((c: CustomerRecord) => c.status === 'inactive' || c.status === 'churned');

  const blocks: ResponseBlock[] = [
    {
      kind: 'data',
      title: 'Customer Segmentation (verified from customers table)',
      lines: [
        `Total customers: ${customers.length}.`,
        ...Object.entries(byStatus).map(([s, v]) => `• ${s}: ${v.count} customer${v.count === 1 ? '' : 's'}, ${inr(v.revenue)} revenue.`),
      ],
    },
    {
      kind: 'data',
      title: 'Top customers by revenue',
      lines: topCustomers.map((c: CustomerRecord) => `• ${c.name}${c.company ? ` — ${c.company}` : ''} | ${inr(Number(c.total_revenue || 0))}`),
    },
  ];

  if (inactive.length > 0) {
    blocks.push({
      kind: 'recommendation',
      lines: [
        `${inactive.length} customer${inactive.length === 1 ? ' is' : 's are'} inactive or churned. A re-engagement campaign (email or WhatsApp) could recover some of them — focus on those with the highest historical revenue.`,
      ],
    });
  }

  return { blocks, sources: ['customers'] };
}

async function handleTasks(): Promise<AIResult> {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('title, assignee, priority, status, due_date')
    .neq('status', 'done')
    .order('due_date', { ascending: true });

  if (!tasks || tasks.length === 0) {
    return {
      blocks: [{ kind: 'data', title: 'Tasks (verified)', lines: ['No open tasks. Everything is marked as done.'] }],
      sources: ['tasks'],
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((t: TaskRecord) => t.due_date && t.due_date < today);
  const highPriority = tasks.filter((t: TaskRecord) => t.priority === 'high' || t.priority === 'urgent');
  const byStatus: Record<string, number> = {};
  for (const t of tasks) byStatus[t.status] = (byStatus[t.status] || 0) + 1;

  const blocks: ResponseBlock[] = [
    {
      kind: 'data',
      title: 'Task Summary (verified from tasks table)',
      lines: [
        `Open tasks: ${tasks.length}.`,
        `By status: ${Object.entries(byStatus).map(([s, c]) => `${s} (${c})`).join(', ')}.`,
        overdue.length > 0 ? `Overdue: ${overdue.length} task${overdue.length === 1 ? '' : 's'} past their due date.` : 'No overdue tasks.',
        highPriority.length > 0 ? `High priority: ${highPriority.length} task${highPriority.length === 1 ? '' : 's'} need attention.` : 'No high-priority tasks.',
      ],
    },
  ];

  if (overdue.length > 0) {
    blocks.push({
      kind: 'data',
      title: 'Overdue tasks (next 5)',
      lines: overdue.slice(0, 5).map((t: TaskRecord) => `• ${t.title} | assigned to ${t.assignee || 'unassigned'} | due ${t.due_date} | ${t.priority}`),
    });
  }

  blocks.push({
    kind: 'recommendation',
    lines: ['Start with overdue high-priority tasks. If any are blocked, move them to "review" and reassign. Use the Tasks Kanban to drag items across stages.'],
  });

  return { blocks, sources: ['tasks'] };
}

async function handleEmployees(): Promise<AIResult> {
  const { data: employees } = await supabase
    .from('employees')
    .select('name, role, department, status, salary, hire_date')
    .order('created_at', { ascending: false });

  if (!employees || employees.length === 0) {
    return {
      blocks: [{ kind: 'clarify', lines: ['No employees found. Add team members to get headcount, department, and payroll insights.'] }],
      sources: ['employees'],
    };
  }

  const active = employees.filter((e: EmployeeRecord) => e.status === 'active');
  const onLeave = employees.filter((e: EmployeeRecord) => e.status === 'on_leave' || e.status === 'on-leave');
  const byDept: Record<string, number> = {};
  for (const e of active) byDept[e.department || 'unassigned'] = (byDept[e.department || 'unassigned'] || 0) + 1;
  const payroll = active.reduce((s: number, e: EmployeeRecord) => s + Number(e.salary || 0), 0);

  return {
    blocks: [
      {
        kind: 'data',
        title: 'Team Overview (verified from employees table)',
        lines: [
          `Total: ${employees.length} employee${employees.length === 1 ? '' : 's'} (${active.length} active, ${onLeave.length} on leave).`,
          `Departments: ${Object.entries(byDept).map(([d, c]) => `${d} (${c})`).join(', ')}.`,
          `Monthly payroll (active): ${inr(payroll)}.`,
        ],
      },
      {
        kind: 'recommendation',
        lines: ['Monitor department headcount for resource planning. Review upcoming work anniversaries for team morale.'],
      },
    ],
    sources: ['employees'],
  };
}

async function handleExpenses(): Promise<AIResult> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const { data: expenses } = await supabase
    .from('expenses')
    .select('category, amount, vendor, status, expense_date')
    .order('expense_date', { ascending: false });

  if (!expenses || expenses.length === 0) {
    return {
      blocks: [{ kind: 'clarify', lines: ['No expenses recorded. Log expenses to see category breakdowns and budget insights.'] }],
      sources: ['expenses'],
    };
  }

  const total = expenses.reduce((s: number, e: ExpenseRecord) => s + Number(e.amount || 0), 0);
  const monthExpenses = expenses
    .filter((e: ExpenseRecord) => e.expense_date && new Date(e.expense_date) >= startOfMonth)
    .reduce((s: number, e: ExpenseRecord) => s + Number(e.amount || 0), 0);
  const byCategory: Record<string, number> = {};
  for (const e of expenses) byCategory[e.category || 'uncategorized'] = (byCategory[e.category || 'uncategorized'] || 0) + Number(e.amount || 0);

  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    blocks: [
      {
        kind: 'data',
        title: 'Expense Breakdown (verified from expenses table)',
        lines: [
          `Total expenses: ${inr(total)} across ${expenses.length} entries.`,
          `This month: ${inr(monthExpenses)}.`,
          `Top categories: ${topCategories.map(([c, v]) => `${c} (${inr(v)})`).join(', ')}.`,
        ],
      },
      {
        kind: 'recommendation',
        lines: ['Compare this month\'s spend against revenue. If a single category exceeds 30% of expenses, review vendor contracts for savings.'],
      },
    ],
    sources: ['expenses'],
  };
}

async function handleUnknown(question: string): Promise<AIResult> {
  const q = question.toLowerCase().trim();
  if (!q || q.length < 3) {
    return {
      blocks: [
        { kind: 'clarify', lines: ['Could you tell me more about what you\'d like to know? I can analyze your leads, customers, invoices, payments, tasks, employees, and expenses.'] },
      ],
      sources: [],
    };
  }

  return {
    blocks: [
      {
        kind: 'clarify',
        lines: [
          'I\'m not sure which part of your business you\'re asking about. I can pull verified data for:',
          '• Leads & pipeline value',
          '• Overdue invoices & outstanding amounts',
          '• Revenue & payment breakdowns',
          '• Customer segmentation & top accounts',
          '• Open tasks & overdue work',
          '• Team headcount & payroll',
          '• Expense categories & budget',
          'Try rephrasing with one of those topics.',
        ],
      },
    ],
    sources: [],
  };
}
