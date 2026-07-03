'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  Users,
  UserPlus,
  Target,
  ShoppingCart,
  Repeat2,
  Heart,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle2,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Sankey, Layer, Rectangle,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const journeyStages = [
  { id: '1', name: 'Visitor', count: 125000, color: '#94a3b8', rate: 100 },
  { id: '2', name: 'Lead', count: 18500, color: '#3b82f6', rate: 14.8 },
  { id: '3', name: 'Qualified Lead', count: 4850, color: '#06b6d4', rate: 26.2 },
  { id: '4', name: 'Opportunity', count: 1820, color: '#eab308', rate: 37.5 },
  { id: '5', name: 'Customer', count: 980, color: '#22c55e', rate: 53.8 },
  { id: '6', name: 'Repeat Customer', count: 420, color: '#10b981', rate: 42.9 },
  { id: '7', name: 'Loyal Customer', count: 185, color: '#14b8a6', rate: 44.0 },
  { id: '8', name: 'Advocate', count: 52, color: '#8b5cf6', rate: 28.1 },
];

const dropOffs = [
  { stage: 'Visitor → Lead', rate: 85.2, lost: 106500 },
  { stage: 'Lead → Qualified', rate: 73.8, lost: 13650 },
  { stage: 'Qualified → Opportunity', rate: 62.5, lost: 3030 },
  { stage: 'Opportunity → Customer', rate: 46.2, lost: 840 },
  { stage: 'Customer → Repeat', rate: 57.1, lost: 560 },
  { stage: 'Repeat → Loyal', rate: 56.0, lost: 235 },
  { stage: 'Loyal → Advocate', rate: 71.9, lost: 133 },
];

const touchpointData = [
  { name: 'Website', visitors: 85000, leads: 12000 },
  { name: 'Email', visitors: 25000, leads: 3200 },
  { name: 'WhatsApp', visitors: 12000, leads: 2100 },
  { name: 'Social', visitors: 45000, leads: 4800 },
  { name: 'Ads', visitors: 35000, leads: 5200 },
];

export default function CustomerJourneyAnalytics() {
  const [loading, setLoading] = useState(true);

  const conversionTime = [
    { stage: 'Visitor → Lead', avgDays: 2.5 },
    { stage: 'Lead → Qualified', avgDays: 5.2 },
    { stage: 'Qualified → Opportunity', avgDays: 8.3 },
    { stage: 'Opportunity → Customer', avgDays: 12.5 },
  ];

  const insights = [
    { stage: 'Visitor → Lead', insight: 'Consider adding exit-intent popups to capture 15% more leads', impact: 'High', icon: Lightbulb },
    { stage: 'Lead → Qualified', insight: 'Implement lead scoring to prioritize high-value prospects faster', impact: 'Medium', icon: Target },
    { stage: 'Opportunity → Customer', insight: 'Reduce demo-to-close time with automated follow-ups', impact: 'High', icon: Clock },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Customer Journey Analytics"
        description="Visualize and optimize the customer lifecycle funnel"
      />

      {/* Journey Visualization */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey Stages</CardTitle>
            <CardDescription>Users progression through lifecycle stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
              {journeyStages.map((stage, i) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-center"
                >
                  <div
                    className="p-4 rounded-lg mb-2"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      borderBottom: `3px solid ${stage.color}`,
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <p className="text-2xl font-bold" style={{ color: stage.color }}>
                      {stage.count.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">{stage.rate}% conv.</p>
                  {i < journeyStages.length - 1 && (
                    <div className="hidden md:block mt-2">
                      <ArrowRightLeft className="h-4 w-4 mx-auto text-muted-foreground rotate-90 md:rotate-0" />
                      <p className="text-xs text-red-500 mt-1">-{dropOffs[i]?.rate}% lost</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis & Conversion Time */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Drop-off Analysis</CardTitle>
            <CardDescription>Stage transition drop-off rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dropOffs.map((drop, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{drop.stage}</span>
                  <span className="text-red-500">{drop.rate}% drop</span>
                </div>
                <Progress value={100 - drop.rate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Conversion Time</CardTitle>
            <CardDescription>Days to progress between stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionTime} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="stage" type="category" className="text-xs" width={120} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgDays" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53% / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Touchpoint Analysis */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Touchpoint Performance</CardTitle>
            <CardDescription>Channels driving visitors and leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={touchpointData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="visitors" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53% / 0.2)" name="Visitors" />
                  <Area type="monotone" dataKey="leads" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.2)" name="Leads" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Optimization Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((ins, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{ins.stage}</span>
                  <Badge className={ins.impact === 'High' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}>
                    {ins.impact}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{ins.insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
