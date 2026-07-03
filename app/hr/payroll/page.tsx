'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Calculator,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Send,
  Printer,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const monthlyPayroll = [
  { month: 'Jan', gross: 18.5, net: 15.2, deductions: 3.3 },
  { month: 'Feb', gross: 18.8, net: 15.4, deductions: 3.4 },
  { month: 'Mar', gross: 19.2, net: 15.7, deductions: 3.5 },
  { month: 'Apr', gross: 19.5, net: 16.0, deductions: 3.5 },
  { month: 'May', gross: 19.8, net: 16.2, deductions: 3.6 },
  { month: 'Jun', gross: 20.1, net: 16.5, deductions: 3.6 },
];

const salaryComposition = [
  { name: 'Basic', value: 40, color: 'hsl(221 83% 53%)' },
  { name: 'HRA', value: 20, color: 'hsl(199 89% 48%)' },
  { name: 'Allowances', value: 15, color: 'hsl(142 71% 45%)' },
  { name: 'Bonus', value: 10, color: 'hsl(38 92% 50%)' },
  { name: 'Deductions', value: 15, color: 'hsl(0 84% 60%)' },
];

const payrollStatusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: FileText },
  processing: { color: 'bg-blue-500/10 text-blue-700', icon: Calculator },
  processed: { color: 'bg-purple-500/10 text-purple-700', icon: CheckCircle2 },
  approved: { color: 'bg-cyan-500/10 text-cyan-700', icon: CheckCircle2 },
  paid: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
};

export default function PayrollPage() {
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);

  const stats = {
    totalPayroll: 20100000,
    avgSalary: 111666,
    employeesProcessed: 180,
    pendingApprovals: 5,
    nextPayDate: 'Jul 25, 2024',
    pendingLoans: 12,
  };

  const payrollRuns = [
    { id: 'PR-2024-06', month: 'June 2024', employees: 180, gross: 20100000, net: 16500000, status: 'paid', processedDate: '2024-06-25' },
    { id: 'PR-2024-05', month: 'May 2024', employees: 178, gross: 19800000, net: 16200000, status: 'paid', processedDate: '2024-05-25' },
    { id: 'PR-2024-04', month: 'April 2024', employees: 176, gross: 19500000, net: 16000000, status: 'paid', processedDate: '2024-04-25' },
    { id: 'PR-2024-07', month: 'July 2024', employees: 180, gross: 20100000, net: 16500000, status: 'draft', processedDate: null },
  ];

  const employees = [
    { id: 'EMP001', name: 'Arjun Sharma', department: 'Engineering', gross: 150000, net: 122000, status: 'processed' },
    { id: 'EMP002', name: 'Priya Patel', department: 'Sales', gross: 135000, net: 110000, status: 'processed' },
    { id: 'EMP003', name: 'Rahul Kumar', department: 'Engineering', gross: 180000, net: 145000, status: 'processed' },
    { id: 'EMP004', name: 'Anjali Singh', department: 'HR', gross: 125000, net: 102000, status: 'processed' },
    { id: 'EMP005', name: 'Vikram Reddy', department: 'Finance', gross: 110000, net: 90000, status: 'on_hold' },
  ];

  const salaryComponents = [
    { code: 'BASIC', name: 'Basic Salary', type: 'earning', taxable: true, epf: true },
    { code: 'HRA', name: 'House Rent Allowance', type: 'earning', taxable: true, epf: false },
    { code: 'DA', name: 'Dearness Allowance', type: 'earning', taxable: true, epf: true },
    { code: 'SA', name: 'Special Allowance', type: 'earning', taxable: true, epf: false },
    { code: 'PF', name: 'Provident Fund', type: 'deduction', taxable: false, epf: true },
    { code: 'ESI', name: 'ESI Contribution', type: 'deduction', taxable: false, epf: false },
    { code: 'PT', name: 'Professional Tax', type: 'deduction', taxable: false, epf: false },
    { code: 'TDS', name: 'Income Tax (TDS)', type: 'deduction', taxable: false, epf: false },
  ];

  const loans = [
    { id: 'LN001', employee: 'Arjun Sharma', type: 'Personal Loan', principal: 100000, disbursed: 50000, balance: 50000, emi: 5000, status: 'active' },
    { id: 'LN002', employee: 'Priya Patel', type: 'Salary Advance', principal: 30000, disbursed: 30000, balance: 18000, emi: 3000, status: 'active' },
    { id: 'LN003', employee: 'Vikram Reddy', type: 'Housing Loan', principal: 500000, disbursed: 500000, balance: 450000, emi: 25000, status: 'active' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Payroll Management"
        description="Process salaries, manage components, and track payments"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={runPayrollOpen} onOpenChange={setRunPayrollOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Calculator className="h-4 w-4" />
                  Run Payroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Run Payroll - July 2024</DialogTitle>
                  <DialogDescription>
                    Review and process payroll for all active employees
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between p-3 rounded-lg bg-muted">
                    <span>Total Employees</span>
                    <span className="font-medium">180</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted">
                    <span>Total Gross Salary</span>
                    <span className="font-medium">(INR 2,01,00,000)</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted">
                    <span>Payment Date</span>
                    <span className="font-medium">Jul 25, 2024</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setRunPayrollOpen(false)}>Cancel</Button>
                  <Button onClick={() => setRunPayrollOpen(false)}>Process Payroll</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Payroll', value: '(INR 2.01 Cr)', icon: DollarSign, color: 'text-blue-600' },
          { label: 'Avg. Salary', value: '(INR 1.1 L)', icon: Calculator, color: 'text-purple-600' },
          { label: 'Employees', value: stats.employeesProcessed, icon: Users, color: 'text-green-600' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600' },
          { label: 'Next Pay Date', value: 'Jul 25', icon: Calendar, color: 'text-cyan-600' },
          { label: 'Active Loans', value: stats.pendingLoans, icon: DollarSign, color: 'text-pink-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payroll Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
            <CardDescription>Monthly payroll breakdown (in Lakhs)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPayroll}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="gross" fill="hsl(221 83% 53%)" name="Gross" />
                  <Bar dataKey="net" fill="hsl(142 71% 45%)" name="Net" />
                  <Bar dataKey="deductions" fill="hsl(0 84% 60%)" name="Deductions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Salary Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Composition</CardTitle>
            <CardDescription>Average salary breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salaryComposition} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                    {salaryComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs className="mt-6" defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="employees">Employee Payslips</TabsTrigger>
          <TabsTrigger value="components">Salary Components</TabsTrigger>
          <TabsTrigger value="loans">Loans & Advances</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {payrollRuns.map((run, i) => {
                  const status = payrollStatusConfig[run.status] || payrollStatusConfig.draft;
                  return (
                    <div key={run.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                      <div>
                        <p className="font-medium">{run.month}</p>
                        <p className="text-sm text-muted-foreground">{run.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Gross: (INR {(run.gross / 100000).toFixed(2)}L)</p>
                        <p className="text-xs text-muted-foreground">{run.employees} employees</p>
                      </div>
                      <Badge className={status.color}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {run.status}
                      </Badge>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {employees.map((emp, i) => (
                  <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.id} | {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Gross</p>
                        <p className="font-medium">(INR {(emp.gross / 1000).toFixed(0)}K)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Net</p>
                        <p className="font-medium text-green-600">(INR {(emp.net / 1000).toFixed(0)}K)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" /> View</Button>
                      <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> PDF</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-4">
          <div className="flex justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search components..." className="pl-10" />
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Component</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {salaryComponents.map((comp, i) => (
                  <div key={comp.code} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', comp.type === 'earning' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{comp.name}</p>
                        <p className="text-sm text-muted-foreground">{comp.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={comp.type === 'earning' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}>
                        {comp.type}
                      </Badge>
                      <Badge variant="secondary">{comp.taxable ? 'Taxable' : 'Non-Taxable'}</Badge>
                      {comp.epf && <Badge variant="outline">EPF Applicable</Badge>}
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Loans</h3>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Loan</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {loans.map((loan, i) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div>
                      <p className="font-medium">{loan.employee}</p>
                      <p className="text-sm text-muted-foreground">{loan.type} | {loan.id}</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Principal</p>
                        <p className="font-medium">(INR {(loan.principal / 1000).toFixed(0)}K)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-medium text-orange-600">(INR {(loan.balance / 1000).toFixed(0)}K)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">EMI</p>
                        <p className="font-medium">(INR {loan.emi.toLocaleString()})</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-700">{loan.status}</Badge>
                    <Button variant="ghost" size="sm">View</Button>
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
