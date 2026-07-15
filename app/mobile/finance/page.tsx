'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  Download,
  Share2,
  Camera,
  CheckCircle,
  Clock,
  Users,
  Smartphone,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const mobileFinanceFeatures = [
  { label: 'Create Invoice', icon: FileText, description: 'Generate invoices on-the-go', available: true },
  { label: 'Send Quotation', icon: Receipt, description: 'Quick quotes with templates', available: true },
  { label: 'Record Payment', icon: CreditCard, description: 'Capture payments instantly', available: true },
  { label: 'View Reports', icon: BarChart3, description: 'Real-time financial dashboards', available: true },
  { label: 'Track Expenses', icon: DollarSign, description: 'Submit expenses with receipts', available: true },
  { label: 'Approve Invoices', icon: CheckCircle, description: 'Manager approvals workflow', available: true },
  { label: 'Download PDFs', icon: Download, description: 'Export documents offline', available: true },
  { label: 'Share Documents', icon: Share2, description: 'Email/WhatsApp share', available: true },
];

const recentTransactions = [
  { id: '1', type: 'invoice', title: 'INV-2024-001', amount: 25000, status: 'paid', time: '10 min ago', user: 'John Smith' },
  { id: '2', type: 'payment', title: 'Payment from Acme Corp', amount: 50000, status: 'completed', time: '1 hour ago', user: 'Sarah Johnson' },
  { id: '3', type: 'quotation', title: 'QUO-2024-045', amount: 125000, status: 'pending', time: '2 hours ago', user: 'Mike Chen' },
  { id: '4', type: 'expense', title: 'Travel expense', amount: 4500, status: 'approved', time: '3 hours ago', user: 'Emily Davis' },
];

const transactionColors: Record<string, string> = {
  invoice: 'bg-blue-500/10 text-blue-600',
  payment: 'bg-green-500/10 text-green-600',
  quotation: 'bg-purple-500/10 text-purple-600',
  expense: 'bg-orange-500/10 text-orange-600',
};

const statusColors: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-600',
  completed: 'bg-green-500/10 text-green-600',
  approved: 'bg-green-500/10 text-green-600',
  pending: 'bg-yellow-500/10 text-yellow-600',
};

export default function MobileFinancePage() {
  const stats = {
    mobileInvoices: 89,
    paymentsRecorded: 1560000,
    quotaionsSent: 45,
    expensesSubmitted: 23000,
  };

  return (
    <AppShell>
      <PageHeader
        title="Mobile Finance"
        description="Invoice, payment, and expense management on the go"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Mobile Invoices', value: stats.mobileInvoices, icon: FileText, color: 'text-blue-500' },
          { label: 'Payments (Today)', value: `₹${(stats.paymentsRecorded / 100000).toFixed(0)}L`, icon: CreditCard, color: 'text-green-500' },
          { label: 'Quotations Sent', value: stats.quotaionsSent, icon: Receipt, color: 'text-purple-500' },
          { label: 'Expenses', value: `₹${(stats.expensesSubmitted / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="features" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="features" className="rounded-lg gap-1.5">
            <Smartphone className="h-4 w-4" />
            Mobile Features
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Recent Transactions
          </TabsTrigger>
          <TabsTrigger value="approval" className="rounded-lg gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Pending Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileFinanceFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      {feature.available && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{feature.label}</CardTitle>
                    <CardDescription className="text-xs mt-1">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', transactionColors[tx.type])}>
                        {tx.type === 'invoice' && <FileText className="h-5 w-5" />}
                        {tx.type === 'payment' && <CreditCard className="h-5 w-5" />}
                        {tx.type === 'quotation' && <Receipt className="h-5 w-5" />}
                        {tx.type === 'expense' && <DollarSign className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.user} • {tx.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{tx.amount.toLocaleString()}</p>
                      <Badge className={cn('text-[10px]', statusColors[tx.status])}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>Items awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Invoice', id: 'INV-2024-089', amount: 85000, requestedBy: 'Sales Team' },
                  { type: 'Expense', id: 'EXP-001234', amount: 12500, requestedBy: 'Field Agent' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                        item.type === 'Invoice' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
                      )}>
                        {item.type === 'Invoice' ? <FileText className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.id}</p>
                        <p className="text-xs text-muted-foreground">Requested by {item.requestedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
