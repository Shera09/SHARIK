'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Mail,
  MessageSquare,
  ShoppingCart,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider as UISlider } from '@/components/ui/slider';
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

const criteriaIcons: Record<string, typeof Target> = {
  website_visit: Eye,
  form_submission: FileText,
  email_open: Mail,
  email_click: MousePointer,
  whatsapp_reply: MessageSquare,
  purchase: ShoppingCart,
  demo_request: Users,
};

const scoreTiers = [
  { name: 'Cold', range: '0 - 25', color: 'bg-blue-500', description: 'Low engagement, needs nurturing' },
  { name: 'Warm', range: '26 - 50', color: 'bg-yellow-500', description: 'Some interest, ready for outreach' },
  { name: 'Hot', range: '51 - 75', color: 'bg-orange-500', description: 'Highly engaged, close to conversion' },
  { name: 'Qualified', range: '76 - 100', color: 'bg-green-500', description: 'Sales ready, high priority' },
];

export default function LeadScoringPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockRules = [
    { id: '1', rule_name: 'Website Visit', criteria_type: 'website_visit', points: 5, max_points: 25, is_active: true, description: 'Points for each website visit' },
    { id: '2', rule_name: 'Form Submission', criteria_type: 'form_submission', points: 25, max_points: 100, is_active: true, description: 'Points for submitting a form' },
    { id: '3', rule_name: 'Email Open', criteria_type: 'email_open', points: 3, max_points: 15, is_active: true, description: 'Points for opening marketing email' },
    { id: '4', rule_name: 'Email Click', criteria_type: 'email_click', points: 10, max_points: 50, is_active: true, description: 'Points for clicking email link' },
    { id: '5', rule_name: 'Demo Request', criteria_type: 'demo_request', points: 50, max_points: 50, is_active: true, description: 'Points for requesting a demo' },
    { id: '6', rule_name: 'Purchase Made', criteria_type: 'purchase', points: 100, max_points: 500, is_active: true, description: 'Points for making a purchase' },
  ];

  const stats = {
    totalRules: mockRules.length,
    totalLeads: 2842,
    avgScore: 42,
    qualifiedLeads: 485,
  };

  return (
    <AppShell>
      <PageHeader
        title="Lead Scoring"
        description="Configure AI-powered lead scoring rules and tiers"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scoring Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Website Visit" />
                </div>
                <div>
                  <Label>Criteria Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website_visit">Website Visit</SelectItem>
                      <SelectItem value="form_submission">Form Submission</SelectItem>
                      <SelectItem value="email_open">Email Open</SelectItem>
                      <SelectItem value="email_click">Email Click</SelectItem>
                      <SelectItem value="demo_request">Demo Request</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points per Action</Label>
                  <Input className="mt-1.5" type="number" placeholder="5" />
                </div>
                <div>
                  <Label>Maximum Points</Label>
                  <Input className="mt-1.5" type="number" placeholder="25" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Rules', value: stats.totalRules, icon: Target, color: 'text-blue-600' },
          { label: 'Total Leads', value: stats.totalLeads.toLocaleString(), icon: Users, color: 'text-green-600' },
          { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Qualified Leads', value: stats.qualifiedLeads, icon: CheckCircle2, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Score Tiers */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Tiers</CardTitle>
            <CardDescription>Lead classification based on score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {scoreTiers.map((tier, i) => (
                <motion.div key={tier.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('h-4 w-4 rounded-full', tier.color)} />
                    <span className="font-medium">{tier.name}</span>
                  </div>
                  <p className="text-2xl font-bold">{tier.range}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Rules */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Scoring Rules</CardTitle>
            <CardDescription>Configure how leads earn points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRules.map((rule, i) => {
              const CriteriaIcon = criteriaIcons[rule.criteria_type] || Target;
              return (
                <motion.div key={rule.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CriteriaIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{rule.rule_name}</p>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-bold text-green-600">+{rule.points}</p>
                      <p className="text-xs text-muted-foreground">Per Action</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{rule.max_points}</p>
                      <p className="text-xs text-muted-foreground">Max</p>
                    </div>
                  </div>
                  <Badge className={rule.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
