'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  BarChart3,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Zap,
  RefreshCw,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const costBreakdown = [
  { service: 'EC2 Instances', category: 'Compute', cost: 12450, previous: 11200, change: '+11%', icon: Cpu },
  { service: 'RDS Database', category: 'Database', cost: 8920, previous: 8500, change: '+5%', icon: Database },
  { service: 'S3 Storage', category: 'Storage', cost: 3450, previous: 3200, change: '+8%', icon: HardDrive },
  { service: 'CloudFront CDN', category: 'Network', cost: 2180, previous: 2400, change: '-9%', icon: Globe },
  { service: 'Lambda Functions', category: 'Compute', cost: 1850, previous: 1200, change: '+54%', icon: Zap },
  { service: 'EBS Volumes', category: 'Storage', cost: 1620, previous: 1580, change: '+3%', icon: HardDrive },
  { service: 'Data Transfer', category: 'Network', cost: 2340, previous: 2100, change: '+11%', icon: Globe },
  { service: 'Elasticache', category: 'Database', cost: 1850, previous: 1850, change: '0%', icon: Database },
];

const providerCosts = [
  { provider: 'AWS', cost: 28620, percentage: 72, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { provider: 'Azure', cost: 7450, percentage: 19, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  { provider: 'GCP', cost: 3640, percentage: 9, color: 'text-red-500', bgColor: 'bg-red-500' },
];

const budgets = [
  { name: 'Production', allocated: 25000, spent: 22100, forecast: 24500, status: 'on_track' },
  { name: 'Development', allocated: 8000, spent: 5200, forecast: 7800, status: 'on_track' },
  { name: 'AI/ML', allocated: 5000, spent: 4800, forecast: 6200, status: 'over_budget' },
  { name: 'Staging', allocated: 3000, spent: 1850, forecast: 2800, status: 'under_budget' },
];

const recommendations = [
  { title: 'Reserved Instances', savings: 2400, effort: 'Low', category: 'Compute Savings' },
  { title: 'S3 Lifecycle Policies', savings: 850, effort: 'Low', category: 'Storage Optimization' },
  { title: 'Right-size Over-provisioned EC2', savings: 1200, effort: 'Medium', category: 'Compute Savings' },
  { title: 'Spot Instances for Non-critical', savings: 1800, effort: 'Medium', category: 'Compute Savings' },
  { title: 'Delete Unattached EBS Volumes', savings: 420, effort: 'Low', category: 'Cleanup' },
  { title: 'Unused Elastic IP Cleanup', savings: 180, effort: 'Low', category: 'Cleanup' },
];

const costHistory = [
  { month: 'Jan', cost: 32000 },
  { month: 'Feb', cost: 34500 },
  { month: 'Mar', cost: 31200 },
  { month: 'Apr', cost: 35800 },
  { month: 'May', cost: 33100 },
  { month: 'Jun', cost: 39710 },
];

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState('services');

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const previousCost = costBreakdown.reduce((sum, item) => sum + item.previous, 0);
  const costChange = ((totalCost - previousCost) / previousCost * 100).toFixed(1);
  const potentialSavings = recommendations.reduce((sum, item) => sum + item.savings, 0);

  const environmentCosts = [
    { env: 'Production', cost: 28620, percentage: 72 },
    { env: 'Development', cost: 7450, percentage: 19 },
    { env: 'Staging', cost: 3640, percentage: 9 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Cost Optimization"
        description="Infrastructure cost analysis, budgets, and optimization recommendations"
        action={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Monthly Cost', value: `$${(totalCost / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-blue-500', change: `+${costChange}%` },
          { label: 'Forecasted', value: `$42.5K`, icon: TrendingUp, color: 'text-purple-500', change: '+6%' },
          { label: 'YTD Spend', value: `$206K`, icon: CreditCard, color: 'text-orange-500', change: '+8%' },
          { label: 'Potential Savings', value: `$${potentialSavings.toLocaleString()}`, icon: Target, color: 'text-green-500', change: 'Monthly' },
          { label: 'Budget Used', value: '78%', icon: PieChart, color: 'text-cyan-500', change: '22% left' },
          { label: 'Cost per Request', value: '$0.0023', icon: BarChart3, color: 'text-pink-500', change: '-0.0001' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <span className={cn('text-xs', stat.change.startsWith('-') || stat.change.includes('left') ? 'text-green-600' : stat.change.startsWith('+') ? 'text-red-600' : 'text-muted-foreground')}>
              {stat.change}
            </span>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="breakdown" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="breakdown" className="rounded-lg gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger value="providers" className="rounded-lg gap-1.5">
            <Globe className="h-4 w-4" />
            By Provider
          </TabsTrigger>
          <TabsTrigger value="budgets" className="rounded-lg gap-1.5">
            <Target className="h-4 w-4" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="rounded-lg gap-1.5">
            <Zap className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="forecast" className="rounded-lg gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Cost Breakdown</CardTitle>
              <CardDescription>Detailed view of infrastructure costs by service</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {costBreakdown.map((item, i) => (
                  <motion.div
                    key={item.service}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.service}</p>
                        <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold">${item.cost.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>vs ${item.previous.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                        item.change.startsWith('+') ? 'bg-red-500/10 text-red-600' :
                        item.change.startsWith('-') ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                      )}>
                        {item.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> :
                         item.change.startsWith('-') ? <ArrowDownRight className="h-3 w-3" /> : null}
                        {item.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Provider Cost Distribution</CardTitle>
                <CardDescription>Monthly spend by cloud provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {providerCosts.map((provider) => (
                    <div key={provider.provider}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className={cn('h-4 w-4', provider.color)} />
                          <span className="font-medium">{provider.provider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">${provider.cost.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">({provider.percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', provider.bgColor)}
                          style={{ width: `${provider.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Environment Distribution</CardTitle>
                <CardDescription>Cost allocation by environment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {environmentCosts.map((env) => (
                    <div key={env.env} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{env.env}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${env.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">${(env.cost / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="mt-0">
          <div className="grid sm:grid-cols-2 gap-4">
            {budgets.map((budget, i) => (
              <motion.div
                key={budget.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  'overflow-hidden',
                  budget.status === 'over_budget' && 'border-red-500/50',
                  budget.status === 'under_budget' && 'border-green-500/50'
                )}>
                  <div className={cn('h-1',
                    budget.status === 'on_track' && 'bg-blue-500',
                    budget.status === 'over_budget' && 'bg-red-500',
                    budget.status === 'under_budget' && 'bg-green-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{budget.name}</CardTitle>
                      <Badge className={cn(
                        'text-[10px]',
                        budget.status === 'on_track' && 'bg-blue-500/10 text-blue-600',
                        budget.status === 'over_budget' && 'bg-red-500/10 text-red-600',
                        budget.status === 'under_budget' && 'bg-green-500/10 text-green-600'
                      )}>
                        {budget.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Budget Used</span>
                          <span className="font-medium">${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}</span>
                        </div>
                        <Progress value={(budget.spent / budget.allocated) * 100} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Forecasted</p>
                          <p className="text-sm font-medium">${budget.forecast.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className="text-sm font-medium">${(budget.allocated - budget.spent).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Cost Optimization Recommendations</CardTitle>
                  <CardDescription>Identified savings opportunities</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">${potentialSavings.toLocaleString()}/mo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        rec.savings > 1000 ? 'bg-green-500/10' : 'bg-muted'
                      )}>
                        <Zap className={cn(
                          'h-5 w-5',
                          rec.savings > 1000 ? 'text-green-600' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{rec.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px]">{rec.category}</Badge>
                          <span>Effort: {rec.effort}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${rec.savings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Cost Trend</CardTitle>
                <CardDescription>Historical spending pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-4">
                  {costHistory.map((month, i) => {
                    const maxCost = Math.max(...costHistory.map(m => m.cost));
                    const height = (month.cost / maxCost) * 100;
                    return (
                      <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-muted rounded-t relative" style={{ height: `${height}%`, minHeight: '20px' }}>
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-blue-500/80 to-blue-400/80 rounded-t"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                  <div>Max: $39.7K</div>
                  <div>Min: $31.2K</div>
                  <div>Avg: $34.4K</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Forecast</CardTitle>
                <CardDescription>Predicted spending for next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { month: 'July', forecast: 42500, confidence: '95%', trend: 'up' },
                    { month: 'August', forecast: 44200, confidence: '85%', trend: 'up' },
                    { month: 'September', forecast: 45800, confidence: '75%', trend: 'up' },
                  ].map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{item.month}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {item.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${(item.forecast / 1000).toFixed(1)}K</p>
                        <div className="flex items-center gap-1 text-xs text-red-600 justify-end">
                          <ArrowUpRight className="h-3 w-3" />
                          <span>+{(item.forecast / totalCost * 100 - 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
