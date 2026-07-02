'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Target,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Clock,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface KPI {
  kpi_id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  calculation_formula: string;
  unit_of_measure: string;
  target_value: number | null;
  threshold_warning: number | null;
  threshold_critical: number | null;
  direction: string;
  frequency: string;
  owner_role: string | null;
  is_active: boolean;
}

const categoryColors: Record<string, string> = {
  Financial: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  Customer: 'bg-green-500/10 text-green-700 border-green-500/20',
  Sales: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  Marketing: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  Operations: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  Support: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
};

const categoryIcons: Record<string, typeof DollarSign> = {
  Financial: DollarSign,
  Customer: Users,
  Sales: ShoppingCart,
  Marketing: Zap,
  Operations: Gauge,
  Support: Clock,
};

export default function KPILibraryPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadKPIs();
  }, []);

  async function loadKPIs() {
    try {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setKpis(data || []);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredKPIs = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || kpi.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(kpis.map(k => k.category))];

  // Mock current values for demo
  const getCurrentValue = (kpi: KPI) => {
    if (!kpi.target_value) return null;
    return kpi.target_value * (0.7 + Math.random() * 0.5);
  };

  const getProgress = (kpi: KPI) => {
    if (!kpi.target_value) return 75;
    const current = getCurrentValue(kpi) || 0;
    const progress = (current / kpi.target_value) * 100;
    if (kpi.direction === 'lower_better') {
      return Math.max(0, 100 - progress);
    }
    return Math.min(100, progress);
  };

  const getStatus = (kpi: KPI) => {
    const progress = getProgress(kpi);
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'warning';
    return 'critical';
  };

  return (
    <AppShell>
      <PageHeader
        title="KPI Library"
        description="Define and track key performance indicators across your business"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Define KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Define New KPI</DialogTitle>
                <DialogDescription>
                  Create a new key performance indicator to track
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>KPI Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., Monthly Recurring Revenue" />
                  </div>
                  <div>
                    <Label>Code</Label>
                    <Input className="mt-1.5" placeholder="e.g., MRR" />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" placeholder="Describe what this KPI measures..." rows={2} />
                </div>
                <div>
                  <Label>Calculation Formula</Label>
                  <Textarea className="mt-1.5 font-mono text-sm" placeholder="SUM(subscriptions.monthly_amount)" rows={2} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Target Value</Label>
                    <Input className="mt-1.5" type="number" placeholder="100000" />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="Percent">Percent (%)</SelectItem>
                        <SelectItem value="Count">Count</SelectItem>
                        <SelectItem value="Hours">Hours</SelectItem>
                        <SelectItem value="Score">Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Warning Threshold</Label>
                    <Input className="mt-1.5" type="number" placeholder="80" />
                  </div>
                  <div>
                    <Label>Critical Threshold</Label>
                    <Input className="mt-1.5" type="number" placeholder="60" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create KPI</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total KPIs', value: kpis.length, icon: Gauge, color: 'text-blue-500' },
          { label: 'Active', value: kpis.filter(k => k.is_active).length, icon: Target, color: 'text-green-500' },
          { label: 'Categories', value: categories.length, icon: BarChart3, color: 'text-purple-500' },
          { label: 'On Target', value: kpis.filter(k => getStatus(k) === 'success').length, icon: TrendingUp, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-muted", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl shimmer" />
          ))
        ) : filteredKPIs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Gauge className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No KPIs found</p>
          </div>
        ) : (
          filteredKPIs.map((kpi, i) => {
            const Icon = categoryIcons[kpi.category] || Gauge;
            const progress = getProgress(kpi);
            const status = getStatus(kpi);
            const currentValue = getCurrentValue(kpi);

            return (
              <motion.div
                key={kpi.kpi_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          categoryColors[kpi.category] || 'bg-muted'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{kpi.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs text-muted-foreground">{kpi.code}</code>
                            <Badge variant="outline" className={cn("text-xs", categoryColors[kpi.category])}>
                              {kpi.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <div className="flex items-center gap-1.5">
                            {status === 'success' && <ArrowUpRight className="h-4 w-4 text-green-600" />}
                            {status === 'warning' && <TrendingUp className="h-4 w-4 text-yellow-600" />}
                            {status === 'critical' && <ArrowDownRight className="h-4 w-4 text-red-600" />}
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            "h-2",
                            status === 'success' && "[&>div]:bg-green-500",
                            status === 'warning' && "[&>div]:bg-yellow-500",
                            status === 'critical' && "[&>div]:bg-red-500"
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold">
                            {kpi.unit_of_measure === 'INR' && '₹'}
                            {currentValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            {kpi.unit_of_measure === 'Percent' && '%'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-semibold">
                            {kpi.unit_of_measure === 'INR' && '₹'}
                            {kpi.target_value?.toLocaleString()}
                            {kpi.unit_of_measure === 'Percent' && '%'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{kpi.frequency}</span>
                        <span className={cn(
                          "capitalize",
                          kpi.direction === 'higher_better' && "text-green-600",
                          kpi.direction === 'lower_better' && "text-red-600"
                        )}>
                          {kpi.direction === 'higher_better' ? '↑ Higher is better' : '↓ Lower is better'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </AppShell>
  );
}
