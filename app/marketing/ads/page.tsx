'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  TrendingUp,
  DollarSign,
  MousePointer,
  Eye,
  Target,
  ShoppingCart,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const platformColors: Record<string, string> = {
  google_ads: 'hsl(60, 100%, 50%)',
  facebook_ads: 'hsl(217, 89%, 55%)',
  instagram_ads: 'hsl(325, 89%, 47%)',
  linkedin_ads: 'hsl(201, 100%, 35%)',
};

const adPerformance = [
  { day: 'Mon', impressions: 45000, clicks: 1800, conversions: 45 },
  { day: 'Tue', impressions: 52000, clicks: 2100, conversions: 52 },
  { day: 'Wed', impressions: 48000, clicks: 1950, conversions: 48 },
  { day: 'Thu', impressions: 55000, clicks: 2200, conversions: 55 },
  { day: 'Fri', impressions: 61000, clicks: 2450, conversions: 61 },
  { day: 'Sat', impressions: 42000, clicks: 1680, conversions: 42 },
  { day: 'Sun', impressions: 38000, clicks: 1520, conversions: 38 },
];

export default function DigitalAdsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const mockCampaigns = [
    { id: '1', platform: 'google_ads', campaign_name: 'Search - Brand Terms', budget_amount: 50000, spent_amount: 35000, impressions: 125000, clicks: 5200, conversions: 125, revenue_attributed: 185000, status: 'active', ctr: 4.2, cpa: 280, roas: 5.3 },
    { id: '2', platform: 'facebook_ads', campaign_name: 'Lead Gen - SMB', budget_amount: 30000, spent_amount: 22000, impressions: 850000, clicks: 12400, conversions: 85, revenue_attributed: 95000, status: 'active', ctr: 1.5, cpa: 259, roas: 4.3 },
    { id: '3', platform: 'instagram_ads', campaign_name: 'Brand Awareness', budget_amount: 25000, spent_amount: 18500, impressions: 450000, clicks: 8500, conversions: 45, revenue_attributed: 52000, status: 'active', ctr: 1.9, cpa: 411, roas: 2.8 },
    { id: '4', platform: 'google_ads', campaign_name: 'Display Remarketing', budget_amount: 20000, spent_amount: 12000, impressions: 280000, clicks: 3200, conversions: 62, revenue_attributed: 78000, status: 'paused', ctr: 1.1, cpa: 194, roas: 6.5 },
    { id: '5', platform: 'linkedin_ads', campaign_name: 'Enterprise Targeting', budget_amount: 40000, spent_amount: 28000, impressions: 180000, clicks: 2400, conversions: 32, revenue_attributed: 320000, status: 'active', ctr: 1.3, cpa: 875, roas: 11.4 },
  ];

  const stats = {
    totalCampaigns: mockCampaigns.length,
    activeCampaigns: mockCampaigns.filter(c => c.status === 'active').length,
    totalSpend: mockCampaigns.reduce((sum, c) => sum + c.spent_amount, 0),
    totalRevenue: mockCampaigns.reduce((sum, c) => sum + c.revenue_attributed, 0),
    totalConversions: mockCampaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgROAS: (mockCampaigns.reduce((sum, c) => sum + c.roas, 0) / mockCampaigns.length).toFixed(1),
  };

  return (
    <AppShell>
      <PageHeader
        title="Digital Ad Management"
        description="Track and optimize ad campaigns across platforms"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setSyncDialogOpen(true)}>
              <RefreshCw className="h-4 w-4" />
              Sync Data
            </Button>
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Play, color: 'text-green-600' },
          { label: 'Total Spend', value: `₹${(stats.totalSpend / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-blue-600' },
          { label: 'Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Conversions', value: stats.totalConversions, icon: Target, color: 'text-purple-600' },
          { label: 'Avg ROAS', value: `${stats.avgROAS}x`, icon: BarChart3, color: 'text-orange-600' },
          { label: 'ROI', value: `${((stats.totalRevenue / stats.totalSpend - 1) * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Impressions, clicks, and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="impressions" fill="hsl(221 83% 53% / 0.3)" name="Impressions" />
                  <Bar dataKey="clicks" fill="hsl(221 83% 53%)" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Campaigns</CardTitle>
            <CardDescription>Performance by campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockCampaigns.map((campaign, i) => (
              <motion.div key={campaign.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${platformColors[campaign.platform]}20` }}>
                  <Radio className="h-5 w-5" style={{ color: platformColors[campaign.platform] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{campaign.campaign_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{campaign.platform.replace('_', ' ')}</p>
                </div>
                <div className="hidden lg:flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold">{(campaign.impressions / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{campaign.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">{campaign.conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">₹{campaign.cpa}</p>
                    <p className="text-xs text-muted-foreground">CPA</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-purple-600">{campaign.roas}x</p>
                    <p className="text-xs text-muted-foreground">ROAS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">₹{campaign.spent_amount.toLocaleString()} / ₹{campaign.budget_amount.toLocaleString()}</p>
                  <Progress value={(campaign.spent_amount / campaign.budget_amount) * 100} className="h-2 w-24 mt-1" />
                </div>
                <Badge className={campaign.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}>
                  {campaign.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    {campaign.status === 'active' && (
                      <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
                    )}
                    {campaign.status === 'paused' && (
                      <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Activate</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
