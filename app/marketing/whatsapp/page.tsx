'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

const waStats = [
  { name: 'Week 1', sent: 8500, delivered: 8200, read: 6400 },
  { name: 'Week 2', sent: 7200, delivered: 7050, read: 5800 },
  { name: 'Week 3', sent: 9100, delivered: 8850, read: 7100 },
  { name: 'Week 4', sent: 6800, delivered: 6650, read: 5200 },
];

export default function WhatsAppMarketingPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockCampaigns = [
    { id: '1', campaign_name: 'Summer Sale Broadcast', sent_count: 5800, delivered_count: 5650, read_count: 4420, clicked_count: 320, status: 'sent', sent_at: '2026-07-01' },
    { id: '2', campaign_name: 'Product Launch', sent_count: 4200, delivered_count: 4100, read_count: 3280, clicked_count: 280, status: 'sent', sent_at: '2026-06-28' },
    { id: '3', campaign_name: 'Order Confirmation', sent_count: 1250, delivered_count: 1240, read_count: 1180, clicked_count: 95, status: 'sent', sent_at: '2026-07-02' },
    { id: '4', campaign_name: 'Flash Sale Alert', sent_count: 0, delivered_count: 0, read_count: 0, clicked_count: 0, status: 'scheduled', sent_at: '2026-07-05' },
  ];

  const stats = {
    totalContacts: 8500,
    totalSent: mockCampaigns.reduce((sum, c) => sum + c.sent_count, 0),
    avgDeliveryRate: 98.2,
    avgReadRate: 76.5,
  };

  return (
    <AppShell>
      <PageHeader
        title="WhatsApp Marketing"
        description="Broadcast campaigns and template management"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                New Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create WhatsApp Campaign</DialogTitle>
                <DialogDescription>Send broadcast messages to your audience</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Summer Sale Broadcast" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promo">Promotional Offer</SelectItem>
                        <SelectItem value="launch">Product Launch</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Segment</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="active">Active (30 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Message Content</Label>
                  <Textarea className="mt-1.5" placeholder="Type your WhatsApp message..." rows={4} />
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="gap-1"><ImageIcon className="h-4 w-4" /> Add Image</Button>
                  <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" /> Add Document</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Schedule</Button>
                <Button>Send Now</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Contacts', value: stats.totalContacts.toLocaleString(), icon: Users, color: 'text-green-600' },
          { label: 'Total Sent', value: stats.totalSent.toLocaleString(), icon: Send, color: 'text-blue-600' },
          { label: 'Delivery Rate', value: `${stats.avgDeliveryRate}%`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Read Rate', value: `${stats.avgReadRate}%`, icon: Eye, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Sent, Delivered, and Read metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="sent" fill="hsl(142 71% 45% / 0.4)" name="Sent" />
                  <Bar dataKey="delivered" fill="hsl(142 71% 45% / 0.7)" name="Delivered" />
                  <Bar dataKey="read" fill="hsl(142 71% 45%)" name="Read" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Promotional Offer', 'Order Update', 'Appointment Reminder', 'Welcome Message'].map((template, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{template}</span>
                </div>
                <Badge variant="outline" className="text-xs">Approved</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">Manage Templates</Button>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockCampaigns.map((campaign, i) => (
              <motion.div key={campaign.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{campaign.campaign_name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(campaign.sent_at).toLocaleDateString()}</p>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold">{campaign.sent_count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">{campaign.delivered_count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-blue-600">{campaign.read_count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Read</p>
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
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
