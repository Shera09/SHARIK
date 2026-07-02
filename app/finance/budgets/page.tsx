'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Plus,
  Search,
  Filter,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Building2,
  FolderKanban,
  BarChart3,
  DollarSign,
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
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Budget {
  id: string;
  name: string;
  budget_type: string;
  fiscal_year: number;
  total_amount: number;
  used_amount: number;
  period_start: string;
  period_end: string;
  status: string;
}

const budgetTypeConfig: Record<string, { color: string; icon: typeof PiggyBank; label: string }> = {
  department: { color: 'text-blue-600 bg-blue-500/10', icon: Building2, label: 'Department' },
  project: { color: 'text-green-600 bg-green-500/10', icon: FolderKanban, label: 'Project' },
  branch: { color: 'text-purple-600 bg-purple-500/10', icon: Building2, label: 'Branch' },
  annual: { color: 'text-orange-600 bg-orange-500/10', icon: Calendar, label: 'Annual' },
  monthly: { color: 'text-cyan-600 bg-cyan-500/10', icon: Calendar, label: 'Monthly' },
  marketing: { color: 'text-pink-600 bg-pink-500/10', icon: Target, label: 'Marketing' },
};

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || budget.budget_type === filterType;
    return matchesSearch && matchesType;
  });

  const mockBudgets: Budget[] = budgets.length > 0 ? budgets : [
    { id: '1', name: 'Marketing Budget 2024', budget_type: 'marketing', fiscal_year: 2024, total_amount: 2000000, used_amount: 1650000, period_start: '2024-01-01', period_end: '2024-12-31', status: 'active' },
    { id: '2', name: 'IT Department', budget_type: 'department', fiscal_year: 2024, total_amount: 1500000, used_amount: 1350000, period_start: '2024-01-01', period_end: '2024-12-31', status: 'active' },
    { id: '3', name: 'Sales Team', budget_type: 'department', fiscal_year: 2024, total_amount: 1000000, used_amount: 650000, period_start: '2024-01-01', period_end: '2024-12-31', status: 'active' },
    { id: '4', name: 'New Product Launch', budget_type: 'project', fiscal_year: 2024, total_amount: 500000, used_amount: 480000, period_start: '2024-03-01', period_end: '2024-08-31', status: 'active' },
    { id: '5', name: 'Branch Expansion', budget_type: 'branch', fiscal_year: 2024, total_amount: 3000000, used_amount: 1200000, period_start: '2024-01-01', period_end: '2024-12-31', status: 'active' },
    { id: '6', name: 'Quarter 3 Operations', budget_type: 'monthly', fiscal_year: 2024, total_amount: 800000, used_amount: 500000, period_start: '2024-07-01', period_end: '2024-09-30', status: 'active' },
  ];

  const stats = {
    totalAllocated: mockBudgets.reduce((sum, b) => sum + Number(b.total_amount), 0),
    totalUsed: mockBudgets.reduce((sum, b) => sum + Number(b.used_amount), 0),
    onTrack: mockBudgets.filter(b => (Number(b.used_amount) / Number(b.total_amount)) <= 0.8).length,
    atRisk: mockBudgets.filter(b => {
      const pct = Number(b.used_amount) / Number(b.total_amount);
      return pct > 0.8 && pct <= 0.95;
    }).length,
    overBudget: mockBudgets.filter(b => (Number(b.used_amount) / Number(b.total_amount)) > 0.95).length,
  };

  const chartData = mockBudgets.map(b => ({
    name: b.name.substring(0, 12),
    allocated: Number(b.total_amount) / 1000,
    used: Number(b.used_amount) / 1000,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Budget Management"
        description="Create, track, and analyze budgets across departments and projects"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>
                  Define a new budget for your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Budget Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Marketing Budget 2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fiscal Year</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024-25</SelectItem>
                        <SelectItem value="2025">2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                </div>
                <div>
                  <Label>Total Budget Amount</Label>
                  <Input className="mt-1.5" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Budget</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Allocated', value: `₹${(stats.totalAllocated / 100000).toFixed(1)}L`, icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Total Utilized', value: `₹${(stats.totalUsed / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-500/10' },
          { label: 'On Track', value: stats.onTrack, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
          { label: 'At Risk', value: stats.atRisk, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-500/10' },
          { label: 'Over Budget', value: stats.overBudget, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={cn('rounded-lg p-2 w-fit', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>Comparison of allocated vs used budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v}k`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="used" name="Used" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Overview</CardTitle>
            <CardDescription>Budget usage by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(budgetTypeConfig).map(([key, config]) => {
              const typeBudgets = mockBudgets.filter(b => b.budget_type === key);
              if (typeBudgets.length === 0) return null;

              const total = typeBudgets.reduce((sum, b) => sum + Number(b.total_amount), 0);
              const used = typeBudgets.reduce((sum, b) => sum + Number(b.used_amount), 0);
              const percent = Math.round((used / total) * 100);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <config.icon className={cn('h-4 w-4', config.color.split(' ')[0])} />
                      <span>{config.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ₹{(used / 100000).toFixed(1)}L / ₹{(total / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percent} className="h-2" />
                    <span className={cn(
                      'text-sm font-medium w-12 text-right',
                      percent > 95 ? 'text-red-600' : percent > 80 ? 'text-orange-600' : 'text-green-600'
                    )}>
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(budgetTypeConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Budget Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-xl shimmer" />
          ))
        ) : mockBudgets.map((budget, idx) => {
          const config = budgetTypeConfig[budget.budget_type] || budgetTypeConfig.department;
          const Icon = config.icon;
          const percent = Math.round((Number(budget.used_amount) / Number(budget.total_amount)) * 100);

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn('rounded-lg p-2', config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">FY{budget.fiscal_year}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-lg">{budget.name}</CardTitle>
                  <CardDescription>{config.label} Budget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Utilized</span>
                        <span className={cn(
                          'font-medium',
                          percent > 95 ? 'text-red-600' : percent > 80 ? 'text-orange-600' : 'text-green-600'
                        )}>
                          {percent}%
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Used</p>
                        <p className="font-semibold">₹{(Number(budget.used_amount) / 100000).toFixed(1)}L</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold">₹{(Number(budget.total_amount) / 100000).toFixed(1)}L</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(budget.period_end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      {percent > 95 ? (
                        <Badge className="bg-red-500/10 text-red-700">Over Budget</Badge>
                      ) : percent > 80 ? (
                        <Badge className="bg-orange-500/10 text-orange-700">Near Limit</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-700">On Track</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
