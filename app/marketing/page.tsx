'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Mail,
  MessageSquare,
  Smartphone,
  Share2,
  Search,
  Megaphone,
  Zap,
  Gift,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Globe,
  Eye,
  MousePointer,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const channelData = [
  { month: 'Jan', email: 4500, whatsapp: 3200, sms: 1800, social: 1200 },
  { month: 'Feb', email: 5200, whatsapp: 3800, sms: 2100, social: 1500 },
  { month: 'Mar', email: 4800, whatsapp: 4200, sms: 2400, social: 1800 },
  { month: 'Apr', email: 5800, whatsapp: 4800, sms: 2200, social: 2100 },
  { month: 'May', email: 6200, whatsapp: 5200, sms: 2600, social: 2400 },
  { month: 'Jun', email: 6800, whatsapp: 5800, sms: 2800, social: 2900 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: 'hsl(221 83% 53%)' },
  { name: 'Email', value: 25, color: 'hsl(199 89% 48%)' },
  { name: 'WhatsApp', value: 20, color: 'hsl(142 71% 45%)' },
  { name: 'Social', value: 12, color: 'hsl(38 92% 50%)' },
  { name: 'Referral', value: 8, color: 'hsl(280 65% 60%)' },
];

const campaignPerformance = [
  { name: 'Email Camp 1', sent: 5200, opened: 2800, clicked: 420, converted: 85 },
  { name: 'WA Campaign', sent: 3800, opened: 3200, clicked: 580, converted: 142 },
  { name: 'Social Promo', sent: 24000, opened: 8200, clicked: 1240, converted: 68 },
  { name: 'SMS Blast', sent: 2800, opened: 2600, clicked: 320, converted: 45 },
];

export default function MarketingCommandCenter() {
  const [loading, setLoading] = useState(true);

  const stats = {
    websiteVisitors: 45820,
    newLeads: 1842,
    qualifiedLeads: 486,
    conversionRate: 12.4,
    marketingROI: 3.2,
    costPerLead: 285,
    costPerAcquisition: 1240,
    emailOpenRate: 42.5,
    whatsappReadRate: 78.2,
    activeCampaigns: 12,
    scheduledCampaigns: 5,
  };

  const kpis = [
    { label: 'Website Visitors', value: stats.websiteVisitors.toLocaleString(), icon: Eye, color: 'text-blue-600', trend: '+12%' },
    { label: 'New Leads', value: stats.newLeads.toLocaleString(), icon: UserPlus, color: 'text-green-600', trend: '+8%' },
    { label: 'Qualified Leads', value: stats.qualifiedLeads.toLocaleString(), icon: Target, color: 'text-purple-600', trend: '+15%' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-emerald-600', trend: '+2.1%' },
    { label: 'Cost Per Lead', value: `₹${stats.costPerLead}`, icon: DollarSign, color: 'text-orange-600', trend: '-5%' },
    { label: 'Cost Per Acquisition', value: `₹${stats.costPerAcquisition}`, icon: DollarSign, color: 'text-red-600', trend: '-8%' },
    { label: 'Marketing ROI', value: `${stats.marketingROI}x`, icon: BarChart3, color: 'text-cyan-600', trend: '+0.4x' },
    { label: 'Email Open Rate', value: `${stats.emailOpenRate}%`, icon: Mail, color: 'text-indigo-600', trend: '+3.2%' },
  ];

  const aiRecommendations = [
    { id: 1, title: 'Increase WhatsApp Campaign Frequency', impact: 'High', description: 'WA campaigns show 78% read rate vs 42% email. Consider shifting 20% budget to WhatsApp.', icon: MessageSquare },
    { id: 2, title: 'A/B Test Landing Page Hero', impact: 'Medium', description: 'Current conversion 12.4%. Industry avg 15%. Test new headlines and CTAs.', icon: Globe },
    { id: 3, title: 'Retarget Abandoned Forms', impact: 'High', description: '2,840 users abandoned forms. Setup automated WhatsApp follow-up sequence.', icon: Zap },
    { id: 4, title: 'Optimize Ad Spend Allocation', impact: 'High', description: 'Google Ads CPA ₹980, Meta CPA ₹1,420. Shift budget to Google.', icon: DollarSign },
  ];

  const activeCampaigns = [
    { name: 'Summer Sale 2026', type: 'email', status: 'active', progress: 65, sent: 5200, leads: 428 },
    { name: 'Product Launch WA', type: 'whatsapp', status: 'active', progress: 42, sent: 3800, leads: 312 },
    { name: 'Brand Awareness', type: 'social', status: 'active', progress: 88, sent: 24000, leads: 186 },
    { name: 'Reactivation SMS', type: 'sms', status: 'scheduled', progress: 0, sent: 0, leads: 0 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Marketing Command Center"
        description="AI-powered marketing analytics and campaign management"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Full Analytics
            </Button>
            <Button className="gap-2 rounded-xl">
              <Megaphone className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <kpi.icon className={cn('h-5 w-5', kpi.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-xl font-bold">{kpi.value}</p>
              <span className={cn('text-xs', kpi.trend.startsWith('+') ? 'text-green-600' : kpi.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600')}>
                {kpi.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Channel Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Messages sent across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="email" stackId="1" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53% / 0.2)" name="Email" />
                  <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.2)" name="WhatsApp" />
                  <Area type="monotone" dataKey="sms" stackId="1" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50% / 0.2)" name="SMS" />
                  <Area type="monotone" dataKey="social" stackId="1" stroke="hsl(280 65% 60%)" fill="hsl(280 65% 60% / 0.2)" name="Social" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Attribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {leadSourceData.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance & AI Recommendations */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Recent campaign metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="hsl(221 83% 53% / 0.5)" name="Sent" />
                  <Bar dataKey="opened" fill="hsl(199 89% 48%)" name="Opened" />
                  <Bar dataKey="clicked" fill="hsl(142 71% 45%)" name="Clicked" />
                  <Bar dataKey="converted" fill="hsl(38 92% 50%)" name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Data-driven optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiRecommendations.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <rec.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <Badge className={rec.impact === 'High' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}>
                        {rec.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rec.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    Apply
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>Currently running and scheduled campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeCampaigns.map((campaign, i) => (
                <motion.div
                  key={campaign.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={campaign.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.type}
                        </Badge>
                      </div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Sent</p>
                          <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Leads</p>
                          <p className="font-medium text-green-600">+{campaign.leads}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
