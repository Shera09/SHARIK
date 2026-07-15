'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Plus,
  Search,
  Filter,
  Send,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const emailStats = [
  { name: 'Campaign 1', sent: 5200, opened: 2800, clicked: 420, bounced: 52 },
  { name: 'Campaign 2', sent: 3800, opened: 2100, clicked: 380, bounced: 38 },
  { name: 'Campaign 3', sent: 6500, opened: 3200, clicked: 520, bounced: 65 },
  { name: 'Campaign 4', sent: 4200, opened: 2400, clicked: 280, bounced: 42 },
];

export default function EmailMarketingPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockCampaigns = [
    { id: '1', subject_line: 'Summer Sale - 50% Off!', sent_count: 5200, delivered_count: 5148, open_count: 2800, click_count: 420, status: 'sent', sent_at: '2026-07-01' },
    { id: '2', subject_line: 'New Product Launch', sent_count: 3800, delivered_count: 3762, open_count: 2100, click_count: 380, status: 'sent', sent_at: '2026-06-28' },
    { id: '3', subject_line: 'Weekly Newsletter', sent_count: 6500, delivered_count: 6435, open_count: 3200, click_count: 520, status: 'sent', sent_at: '2026-06-25' },
    { id: '4', subject_line: 'Exclusive Offer Inside', sent_count: 0, delivered_count: 0, open_count: 0, click_count: 0, status: 'scheduled', sent_at: '2026-07-05' },
  ];

  const mockTemplates = [
    { id: '1', name: 'Newsletter Template', category: 'newsletter', usage: 45 },
    { id: '2', name: 'Welcome Email', category: 'welcome', usage: 128 },
    { id: '3', name: 'Promotional Offer', category: 'promotional', usage: 72 },
    { id: '4', name: 'Abandoned Cart', category: 'transactional', usage: 89 },
  ];

  const stats = {
    totalSent: mockCampaigns.reduce((sum, c) => sum + c.sent_count, 0),
    avgOpenRate: 42.5,
    avgClickRate: 8.2,
    totalSubscribers: 12580,
  };

  return (
    <AppShell>
      <PageHeader
        title="Email Marketing"
        description="Create, send, and track email campaigns"
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
                <DialogTitle>Create Email Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Subject Line</Label>
                  <Input className="mt-1.5" placeholder="Enter compelling subject line" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Name</Label>
                    <Input className="mt-1.5" placeholder="WebHoster" />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input className="mt-1.5" placeholder="marketing@webhoster.ai" />
                  </div>
                </div>
                <div>
                  <Label>Target Segment</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscribers</SelectItem>
                      <SelectItem value="active">Active (30 days)</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="leads">Leads Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Email Content</Label>
                  <Textarea className="mt-1.5" placeholder="Compose your email..." rows={6} />
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <Button variant="link" className="p-0 h-auto text-purple-600">Generate with AI</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Save Draft</Button>
                <Button variant="outline">Schedule</Button>
                <Button>Send Now</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Subscribers', value: stats.totalSubscribers.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Total Sent', value: stats.totalSent.toLocaleString(), icon: Send, color: 'text-green-600' },
          { label: 'Avg Open Rate', value: `${stats.avgOpenRate}%`, icon: Eye, color: 'text-purple-600' },
          { label: 'Avg Click Rate', value: `${stats.avgClickRate}%`, icon: TrendingUp, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Campaign Performance Chart */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Sent vs Opened vs Clicked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="sent" fill="hsl(221 83% 53% / 0.6)" name="Sent" />
                  <Bar dataKey="opened" fill="hsl(142 71% 45% / 0.6)" name="Opened" />
                  <Bar dataKey="clicked" fill="hsl(38 92% 50% / 0.8)" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <span className="font-medium">1.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unsubscribe Rate</span>
              <span className="font-medium">0.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Spam Complaints</span>
              <span className="font-medium">0.05%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Best Send Time</span>
              <span className="font-medium">Tuesday 10AM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="mt-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          <div className="mt-4 space-y-3">
            {mockCampaigns.map((campaign, i) => (
              <motion.div key={campaign.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{campaign.subject_line}</p>
                      <p className="text-sm text-muted-foreground">{new Date(campaign.sent_at).toLocaleDateString()}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold">{campaign.sent_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{campaign.open_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-blue-600">{campaign.click_count}</p>
                        <p className="text-xs text-muted-foreground">Clicked</p>
                      </div>
                    </div>
                    <Badge className={campaign.status === 'sent' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                      {campaign.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Report</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="templates">
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTemplates.map((template, i) => (
              <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-[4/3] bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">Used {template.usage} times</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
