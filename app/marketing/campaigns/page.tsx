'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Smartphone,
  Share2,
  Globe,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Target,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  campaign_status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent_amount: number;
  channels: string[];
}

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageSquare,
  sms: Smartphone,
  social: Share2,
  landing_page: Globe,
  multi_channel: BarChart3,
};

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock },
  scheduled: { color: 'bg-blue-500/10 text-blue-700', icon: Calendar },
  active: { color: 'bg-green-500/10 text-green-700', icon: Play },
  paused: { color: 'bg-yellow-500/10 text-yellow-700', icon: Pause },
  completed: { color: 'bg-purple-500/10 text-purple-700', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-500/10 text-red-700', icon: AlertTriangle },
};

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    campaign_type: '',
    start_date: '',
    end_date: '',
    budget: '',
    target_audience: '',
    channels: [] as string[],
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const { data } = await supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false });
      if (data) setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockCampaigns: Campaign[] = campaigns.length > 0 ? campaigns : [
    { id: '1', campaign_name: 'Summer Sale 2026', campaign_type: 'email', campaign_status: 'active', start_date: '2026-06-01', end_date: '2026-07-31', budget: 50000, spent_amount: 32000, channels: ['email', 'whatsapp'] },
    { id: '2', campaign_name: 'Product Launch - Enterprise', campaign_type: 'multi_channel', campaign_status: 'active', start_date: '2026-06-15', end_date: '2026-08-15', budget: 120000, spent_amount: 78000, channels: ['email', 'social', 'landing_page'] },
    { id: '3', campaign_name: 'Customer Reactivation', campaign_type: 'whatsapp', campaign_status: 'scheduled', start_date: '2026-07-05', end_date: '2026-07-20', budget: 25000, spent_amount: 0, channels: ['whatsapp', 'sms'] },
    { id: '4', campaign_name: 'Brand Awareness Q3', campaign_type: 'social', campaign_status: 'draft', start_date: '2026-07-01', end_date: '2026-09-30', budget: 80000, spent_amount: 0, channels: ['social'] },
    { id: '5', campaign_name: 'Lead Nurturing Sequence', campaign_type: 'email', campaign_status: 'completed', start_date: '2026-05-01', end_date: '2026-06-30', budget: 15000, spent_amount: 14200, channels: ['email'] },
    { id: '6', campaign_name: 'Festive Offer Diwali', campaign_type: 'multi_channel', campaign_status: 'paused', start_date: '2026-10-15', end_date: '2026-11-15', budget: 150000, spent_amount: 45000, channels: ['email', 'whatsapp', 'sms', 'social'] },
  ];

  const filteredCampaigns = mockCampaigns.filter(c => {
    const matchesSearch = c.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.campaign_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockCampaigns.length,
    active: mockCampaigns.filter(c => c.campaign_status === 'active').length,
    scheduled: mockCampaigns.filter(c => c.campaign_status === 'scheduled').length,
    draft: mockCampaigns.filter(c => c.campaign_status === 'draft').length,
    totalBudget: mockCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: mockCampaigns.reduce((sum, c) => sum + (c.spent_amount || 0), 0),
  };

  function toggleChannel(channel: string) {
    setNewCampaign(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  }

  async function handleCreateCampaign() {
    if (!newCampaign.campaign_name || !newCampaign.campaign_type || !newCampaign.start_date) {
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          campaign_name: newCampaign.campaign_name,
          campaign_type: newCampaign.campaign_type,
          campaign_status: 'draft',
          start_date: newCampaign.start_date,
          end_date: newCampaign.end_date || newCampaign.start_date,
          budget: parseFloat(newCampaign.budget) || 0,
          spent_amount: 0,
          channels: newCampaign.channels.length > 0 ? newCampaign.channels : [newCampaign.campaign_type],
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCampaigns(prev => [data, ...prev]);
        setNewCampaign({
          campaign_name: '',
          campaign_type: '',
          start_date: '',
          end_date: '',
          budget: '',
          target_audience: '',
          channels: [],
        });
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Campaign Management"
        description="Create, manage, and track marketing campaigns across channels"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>Set up a new marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Campaign Name *</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Summer Sale 2026"
                      value={newCampaign.campaign_name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, campaign_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Campaign Type *</Label>
                    <Select value={newCampaign.campaign_type} onValueChange={(v) => setNewCampaign(prev => ({ ...prev, campaign_type: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp Campaign</SelectItem>
                        <SelectItem value="sms">SMS Campaign</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="multi_channel">Multi-Channel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input className="mt-1.5" type="date" value={newCampaign.start_date} onChange={(e) => setNewCampaign(prev => ({ ...prev, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input className="mt-1.5" type="date" value={newCampaign.end_date} onChange={(e) => setNewCampaign(prev => ({ ...prev, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget (₹)</Label>
                    <Input className="mt-1.5" type="number" placeholder="50000" value={newCampaign.budget} onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Select value={newCampaign.target_audience} onValueChange={(v) => setNewCampaign(prev => ({ ...prev, target_audience: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts</SelectItem>
                        <SelectItem value="leads">Leads Only</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Channels</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant={newCampaign.channels.includes('email') ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => toggleChannel('email')}><Mail className="h-3 w-3" /> Email</Button>
                    <Button variant={newCampaign.channels.includes('whatsapp') ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => toggleChannel('whatsapp')}><MessageSquare className="h-3 w-3" /> WhatsApp</Button>
                    <Button variant={newCampaign.channels.includes('sms') ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => toggleChannel('sms')}><Smartphone className="h-3 w-3" /> SMS</Button>
                    <Button variant={newCampaign.channels.includes('social') ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => toggleChannel('social')}><Share2 className="h-3 w-3" /> Social</Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCampaign} disabled={saving || !newCampaign.campaign_name || !newCampaign.campaign_type || !newCampaign.start_date}>
                  {saving ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Campaigns', value: stats.total, icon: Megaphone, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: Play, color: 'text-green-600' },
          { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'text-blue-600' },
          { label: 'Drafts', value: stats.draft, icon: Clock, color: 'text-gray-600' },
          { label: 'Total Budget', value: `₹${(stats.totalBudget / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-purple-600' },
          { label: 'Spent', value: `₹${(stats.totalSpent / 1000).toFixed(0)}k`, icon: Target, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      {/* Campaigns Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign, i) => {
          const status = statusConfig[campaign.campaign_status] || statusConfig.draft;
          const StatusIcon = status.icon;
          const ChannelIcon = channelIcons[campaign.campaign_type] || Megaphone;
          const budgetUsed = Math.round(((campaign.spent_amount || 0) / (campaign.budget || 1)) * 100);

          return (
            <motion.div key={campaign.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ChannelIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.campaign_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {campaign.campaign_status}
                    </Badge>
                    <div className="flex gap-1">
                      {campaign.channels.map(ch => {
                        const ChIcon = channelIcons[ch] || Share2;
                        return <ChIcon key={ch} className="h-4 w-4 text-muted-foreground" />;
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">₹{(campaign.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-medium">₹{(campaign.spent_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Budget Used</span>
                      <span>{budgetUsed}%</span>
                    </div>
                    <Progress value={budgetUsed} className="h-2" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(campaign.start_date).toLocaleDateString()}</span>
                    <span>→</span>
                    <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
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
