'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Users,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  FileText,
  Camera,
  Mic,
  CheckCircle,
  TrendingUp,
  Calendar,
  Star,
  Building2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const mobileFeatures = [
  { label: 'Lead Capture', icon: UserPlus, description: 'Quick lead entry with OCR scan', available: true },
  { label: 'Customer Lookup', icon: Users, description: 'Instant access to customer history', available: true },
  { label: 'Call Logging', icon: Phone, description: 'Automatic call tracking', available: true },
  { label: 'WhatsApp', icon: MessageSquare, description: 'Direct WhatsApp integration', available: true },
  { label: 'Location Tagging', icon: MapPin, description: 'GPS-based visit tracking', available: true },
  { label: 'Document Scan', icon: Camera, description: 'OCR document scanning', available: true },
  { label: 'Voice Notes', icon: Mic, description: 'Voice memo attachments', available: true },
  { label: 'Offline Access', icon: Smartphone, description: 'Works without network', available: true },
];

const recentActivities = [
  { id: '1', type: 'lead_created', title: 'New lead: Tech Solutions', user: 'John Smith', time: '2 min ago', device: 'iPhone 15' },
  { id: '2', type: 'call_logged', title: 'Call with Acme Corp', user: 'Sarah Johnson', time: '15 min ago', device: 'Pixel 8' },
  { id: '3', type: 'visit', title: 'Site visit: Downtown Office', user: 'Mike Chen', time: '1 hour ago', device: 'iPad Pro' },
  { id: '4', type: 'note_added', title: 'Follow-up notes added', user: 'Emily Davis', time: '2 hours ago', device: 'Galaxy S24' },
];

const activityColors: Record<string, string> = {
  lead_created: 'bg-blue-500/10 text-blue-600',
  call_logged: 'bg-green-500/10 text-green-600',
  visit: 'bg-purple-500/10 text-purple-600',
  note_added: 'bg-orange-500/10 text-orange-600',
};

const topPerformers = [
  { name: 'Sarah Johnson', leads: 45, calls: 128, rating: 4.9 },
  { name: 'John Smith', leads: 38, calls: 95, rating: 4.8 },
  { name: 'Mike Chen', leads: 32, calls: 87, rating: 4.7 },
];

export default function MobileCRMPage() {
  const stats = {
    mobileLeads: 234,
    callsLogged: 892,
    visitsToday: 45,
    offlineActions: 23,
  };

  return (
    <AppShell>
      <PageHeader
        title="Mobile CRM"
        description="Lead and customer management for field teams"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Mobile Leads', value: stats.mobileLeads, icon: UserPlus, color: 'text-blue-500' },
          { label: 'Calls Logged', value: stats.callsLogged, icon: Phone, color: 'text-green-500' },
          { label: 'Visits Today', value: stats.visitsToday, icon: MapPin, color: 'text-purple-500' },
          { label: 'Offline Actions', value: stats.offlineActions, icon: Smartphone, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="features" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="features" className="rounded-lg gap-1.5">
            <Smartphone className="h-4 w-4" />
            Mobile Features
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      {feature.available && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{feature.label}</CardTitle>
                    <CardDescription className="text-xs mt-1">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Mobile Activities</CardTitle>
              <CardDescription>Actions taken from mobile devices</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge className={cn('text-[10px]', activityColors[activity.type])}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.device}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performers</CardTitle>
                <CardDescription>Leading field team members this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, i) => (
                    <div key={performer.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{performer.leads} leads</span>
                            <span>{performer.calls} calls</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{performer.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Distribution</CardTitle>
                <CardDescription>Mobile actions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Lead Capture', count: 234, percent: 35, color: 'bg-blue-500' },
                    { label: 'Call Logging', count: 189, percent: 28, color: 'bg-green-500' },
                    { label: 'Site Visits', count: 145, percent: 22, color: 'bg-purple-500' },
                    { label: 'Follow-ups', count: 100, percent: 15, color: 'bg-orange-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
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
