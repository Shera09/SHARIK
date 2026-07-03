'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Plus,
  Send,
  Eye,
  Copy,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const smsStats = [
  { name: 'Week 1', sent: 12000, delivered: 11750, failed: 250 },
  { name: 'Week 2', sent: 8500, delivered: 8350, failed: 150 },
  { name: 'Week 3', sent: 15000, delivered: 14720, failed: 280 },
  { name: 'Week 4', sent: 9200, delivered: 9050, failed: 150 },
];

export default function SMSMarketingPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockCampaigns = [
    { id: '1', campaign_name: 'Flash Sale Alert', message_type: 'promotional', sent_count: 8500, delivered_count: 8350, failed_count: 150, status: 'sent' },
    { id: '2', campaign_name: 'Order OTP', message_type: 'otp', sent_count: 2100, delivered_count: 2095, failed_count: 5, status: 'sent' },
    { id: '3', campaign_name: 'Delivery Update', message_type: 'transactional', sent_count: 1450, delivered_count: 1448, failed_count: 2, status: 'sent' },
    { id: '4', campaign_name: 'Weekend Promo', message_type: 'promotional', sent_count: 0, delivered_count: 0, failed_count: 0, status: 'scheduled' },
  ];

  const stats = {
    totalContacts: 25000,
    totalSent: mockCampaigns.reduce((sum, c) => sum + c.sent_count, 0),
    avgDeliveryRate: 97.8,
    balance: 50000,
  };

  return (
    <AppShell>
      <PageHeader
        title="SMS Marketing"
        description="Send promotional, transactional, and OTP SMS campaigns"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New SMS Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create SMS Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Flash Sale Alert" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Message Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="otp">OTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sender ID</Label>
                    <Input className="mt-1.5" placeholder="WEBHSTR" />
                  </div>
                </div>
                <div>
                  <Label>Message Content</Label>
                  <Textarea className="mt-1.5" placeholder="Type your SMS message (max 160 chars)..." rows={3} maxLength={160} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button>Send Now</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Contacts', value: stats.totalContacts.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Total Sent', value: stats.totalSent.toLocaleString(), icon: Send, color: 'text-green-600' },
          { label: 'Delivery Rate', value: `${stats.avgDeliveryRate}%`, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'SMS Balance', value: stats.balance.toLocaleString(), icon: Smartphone, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smsStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="sent" fill="hsl(221 83% 53% / 0.4)" name="Sent" />
                  <Bar dataKey="delivered" fill="hsl(221 83% 53%)" name="Delivered" />
                  <Bar dataKey="failed" fill="hsl(0 84% 60%)" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> DLT Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Registered Templates</span>
              <Badge className="bg-green-500/10 text-green-700">12/12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Entity ID</span>
              <span className="font-mono text-xs">ENT123456789</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Header ID</span>
              <span className="font-mono text-xs">WEBHSTR</span>
            </div>
            <Button variant="outline" className="w-full mt-2">Manage Templates</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockCampaigns.map((campaign, i) => (
              <motion.div key={campaign.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{campaign.campaign_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{campaign.message_type}</p>
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
