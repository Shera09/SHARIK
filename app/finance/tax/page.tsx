'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Download,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface TaxRate {
  id: string;
  name: string;
  rate_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  is_active: boolean;
}

export default function GSTTaxPage() {
  const [loading, setLoading] = useState(true);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*, tax_categories(name, code)')
        .order('rate_percent');

      if (error) throw error;
      setTaxRates(data || []);
    } catch (error) {
      console.error('Error loading tax rates:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockTaxRates: TaxRate[] = taxRates.length > 0 ? taxRates : [
    { id: '1', name: 'GST 0%', rate_percent: 0, cgst_percent: 0, sgst_percent: 0, igst_percent: 0, is_active: true },
    { id: '2', name: 'GST 5%', rate_percent: 5, cgst_percent: 2.5, sgst_percent: 2.5, igst_percent: 5, is_active: true },
    { id: '3', name: 'GST 12%', rate_percent: 12, cgst_percent: 6, sgst_percent: 6, igst_percent: 12, is_active: true },
    { id: '4', name: 'GST 18%', rate_percent: 18, cgst_percent: 9, sgst_percent: 9, igst_percent: 18, is_active: true },
    { id: '5', name: 'GST 28%', rate_percent: 28, cgst_percent: 14, sgst_percent: 14, igst_percent: 28, is_active: true },
  ];

  // Summary stats
  const gstSummary = {
    inputTax: 245000,
    outputTax: 380000,
    netPayable: 135000,
    cgst: 67500,
    sgst: 67500,
    igst: 0,
  };

  // Tax distribution for pie chart
  const taxDistribution = [
    { name: 'CGST', value: gstSummary.cgst, color: '#3b82f6' },
    { name: 'SGST', value: gstSummary.sgst, color: '#10b981' },
    { name: 'IGST', value: gstSummary.igst, color: '#f59e0b' },
  ];

  // Monthly GST data
  const monthlyGstData = [
    { month: 'Jan', input: 180000, output: 280000, net: 100000 },
    { month: 'Feb', input: 195000, output: 310000, net: 115000 },
    { month: 'Mar', input: 220000, output: 350000, net: 130000 },
    { month: 'Apr', input: 210000, output: 340000, net: 130000 },
    { month: 'May', input: 235000, output: 360000, net: 125000 },
    { month: 'Jun', input: 245000, output: 380000, net: 135000 },
  ];

  // Recent tax transactions
  const recentTransactions = [
    { id: '1', type: 'Sales Invoice', number: 'INV-2024-089', date: '2024-07-01', taxable: 500000, cgst: 45000, sgst: 45000, igst: 0, total: 90000 },
    { id: '2', type: 'Sales Invoice', number: 'INV-2024-090', date: '2024-07-02', taxable: 300000, cgst: 27000, sgst: 27000, igst: 0, total: 54000 },
    { id: '3', type: 'Purchase', number: 'PO-2024-045', date: '2024-07-02', taxable: 250000, cgst: 22500, sgst: 22500, igst: 0, total: 45000 },
    { id: '4', type: 'Sales Invoice', number: 'INV-2024-091', date: '2024-07-03', taxable: 450000, cgst: 0, sgst: 0, igst: 81000, total: 81000 },
    { id: '5', type: 'Purchase', number: 'PO-2024-046', date: '2024-07-04', taxable: 180000, cgst: 16200, sgst: 16200, igst: 0, total: 32400 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="GST & Tax Management"
        description="Manage GST rates, track tax liabilities, and generate tax reports"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Tax Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Tax Rate</DialogTitle>
                <DialogDescription>
                  Add a new GST/tax rate configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., GST 18%" />
                  </div>
                  <div>
                    <Label>Rate (%)</Label>
                    <Input className="mt-1.5" type="number" placeholder="18" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>CGST %</Label>
                    <Input className="mt-1.5" type="number" placeholder="9" />
                  </div>
                  <div>
                    <Label>SGST %</Label>
                    <Input className="mt-1.5" type="number" placeholder="9" />
                  </div>
                  <div>
                    <Label>IGST %</Label>
                    <Input className="mt-1.5" type="number" placeholder="18" />
                  </div>
                </div>
                <div>
                  <Label>HSN Code</Label>
                  <Input className="mt-1.5" placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Tax Rate</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* GST Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Input Tax Credit', value: `₹${(gstSummary.inputTax / 1000).toFixed(0)}k`, icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-500/10', trend: 'down' },
          { label: 'Output Tax', value: `₹${(gstSummary.outputTax / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10', trend: 'up' },
          { label: 'Net GST Payable', value: `₹${(gstSummary.netPayable / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-500/10', trend: 'up' },
          { label: 'CGST', value: `₹${(gstSummary.cgst / 1000).toFixed(0)}k`, icon: Calculator, color: 'text-purple-600', bg: 'bg-purple-500/10' },
          { label: 'SGST', value: `₹${(gstSummary.sgst / 1000).toFixed(0)}k`, icon: Calculator, color: 'text-orange-600', bg: 'bg-orange-500/10' },
          { label: 'IGST', value: `₹${(gstSummary.igst / 1000).toFixed(0)}k`, icon: Calculator, color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-lg p-2', stat.bg)}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className={cn('h-5 w-5', stat.color)} />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className={cn('h-5 w-5', stat.color)} />
                    ) : (
                      <stat.icon className={cn('h-5 w-5', stat.color)} />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly GST Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Monthly GST Summary
            </CardTitle>
            <CardDescription>Input vs Output tax comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyGstData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="input" name="Input Tax" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="output" name="Output Tax" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tax Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tax Distribution
            </CardTitle>
            <CardDescription>Current period GST break-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={taxDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taxDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {taxDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates & Transactions */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tax Rates */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>GST Rates</CardTitle>
            <CardDescription>Configured tax rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTaxRates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{rate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      CGST: {rate.cgst_percent}% | SGST: {rate.sgst_percent}% | IGST: {rate.igst_percent}%
                    </p>
                  </div>
                  <Badge className={rate.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Transactions</CardTitle>
                <CardDescription>Recent tax entries</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export GSTR
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((txn) => (
                    <TableRow key={txn.id} className="group hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className={txn.type.includes('Sales') ? 'border-green-500 text-green-600' : 'border-blue-500 text-blue-600'}>
                          {txn.type.includes('Sales') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{txn.number}</TableCell>
                      <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right tabular-nums">₹{txn.taxable.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">₹{txn.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'GSTR-1 Report', icon: FileText, color: 'bg-blue-500' },
              { label: 'GSTR-3B Report', icon: Receipt, color: 'bg-green-500' },
              { label: 'HSN Summary', icon: Calculator, color: 'bg-purple-500' },
              { label: 'Tax Register', icon: Download, color: 'bg-orange-500' },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="h-auto py-3 flex-col gap-1">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', action.color)}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
