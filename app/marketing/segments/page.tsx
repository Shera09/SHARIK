'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  MapPin,
  Building2,
  TrendingUp,
  Target,
  Tag,
  Calendar,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function SegmentsPage() {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockSegments = [
    { id: '1', segment_name: 'Active Customers (30 days)', segment_type: 'dynamic', customer_count: 1250, criteria: { last_activity: '30 days', status: 'customer' }, is_active: true },
    { id: '2', segment_name: 'High Value Leads', segment_type: 'dynamic', customer_count: 285, criteria: { lead_score: '51-100', budget: '>50000' }, is_active: true },
    { id: '3', segment_name: 'Newsletter Subscribers', segment_type: 'static', customer_count: 4500, criteria: { consent: 'email' }, is_active: true },
    { id: '4', segment_name: 'Churned Customers', segment_type: 'dynamic', customer_count: 125, criteria: { last_activity: '>90 days', status: 'customer' }, is_active: true },
    { id: '5', segment_name: 'Enterprise Prospects', segment_type: 'static', customer_count: 42, criteria: { company_size: '>1000', industry: 'tech' }, is_active: true },
    { id: '6', segment_name: 'SMB Segment - Mumbai', segment_type: 'dynamic', customer_count: 680, criteria: { location: 'Mumbai', company_size: '<50' }, is_active: true },
  ];

  const stats = {
    total: mockSegments.length,
    dynamic: mockSegments.filter(s => s.segment_type === 'dynamic').length,
    totalCustomers: mockSegments.reduce((sum, s) => sum + s.customer_count, 0),
  };

  return (
    <AppShell>
      <PageHeader
        title="Customer Segments"
        description="Create and manage customer segments for targeted marketing"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Customer Segment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Segment Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., High Value Customers" />
                </div>
                <div>
                  <Label>Segment Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dynamic">Dynamic (Auto-updates)</SelectItem>
                      <SelectItem value="static">Static (Manual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Criteria</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-h-[60px]">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Location</p>
                        <p className="text-xs text-muted-foreground">City, State, Country</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-h-[60px]">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Industry</p>
                        <p className="text-xs text-muted-foreground">IT, Retail, etc</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-h-[60px]">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Revenue</p>
                        <p className="text-xs text-muted-foreground">Min/Max range</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 min-h-[60px]">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Lead Score</p>
                        <p className="text-xs text-muted-foreground">Score range</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Segment</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Segments', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Dynamic Segments', value: stats.dynamic, icon: RefreshCw, color: 'text-green-600' },
          { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Segments */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSegments.map((segment, i) => (
          <motion.div key={segment.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{segment.segment_name}</p>
                    <Badge variant="outline" className="mt-1">
                      {segment.segment_type === 'dynamic' && <RefreshCw className="h-3 w-3 mr-1" />}
                      {segment.segment_type}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" /> Recalculate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{segment.customer_count.toLocaleString()}</span>
                    <span className="text-muted-foreground">customers</span>
                  </div>
                  {Object.entries(segment.criteria).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>{key}: {String(value)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Last updated: Today</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
