'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  FileText,
  DollarSign,
  MessageSquare,
  Calendar,
  Download,
  Bell,
  Users,
  Ticket,
  Sparkles,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const portalFeatures = [
  { label: 'Service Tracking', icon: BarChart3, description: 'Track service status in real-time', available: true },
  { label: 'Invoice Download', icon: Download, description: 'Access and download invoices', available: true },
  { label: 'Payment History', icon: DollarSign, description: 'View all payment records', available: true },
  { label: 'Support Tickets', icon: Ticket, description: 'Create and track tickets', available: true },
  { label: 'AI Chat', icon: Sparkles, description: 'AI-powered assistance', available: true },
  { label: 'Book Meetings', icon: Calendar, description: 'Schedule appointments', available: true },
  { label: 'Knowledge Base', icon: FileText, description: 'Access help articles', available: true },
  { label: 'Renewals', icon: Clock, description: 'Track service renewals', available: true },
];

const recentPortalActivity = [
  { id: '1', customer: 'Acme Corp', action: 'Invoice downloaded', time: '5 min ago', invoice: 'INV-2024-089' },
  { id: '2', customer: 'Tech Solutions', action: 'Ticket created', time: '15 min ago', ticket: 'Support request for cloud services' },
  { id: '3', customer: 'Global Traders', action: 'Payment made', time: '1 hour ago', amount: '₹75,000' },
  { id: '4', customer: 'StartupXYZ', action: 'Meeting booked', time: '2 hours ago', meeting: 'Q3 Review call' },
];

export default function CustomerPortalPage() {
  const stats = {
    activeCustomers: 450,
    ticketsOpen: 23,
    invoicesViewed: 892,
    meetingsBooked: 56,
  };

  return (
    <AppShell>
      <PageHeader
        title="Customer Mobile Portal"
        description="Self-service portal for customers to track services and manage interactions"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Customers', value: stats.activeCustomers, icon: Users, color: 'text-blue-500' },
          { label: 'Open Tickets', value: stats.ticketsOpen, icon: Ticket, color: 'text-orange-500' },
          { label: 'Invoices Viewed', value: stats.invoicesViewed, icon: Download, color: 'text-purple-500' },
          { label: 'Meetings Booked', value: stats.meetingsBooked, icon: Calendar, color: 'text-green-500' },
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
            <Globe className="h-4 w-4" />
            Portal Features
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-lg gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {portalFeatures.map((feature, i) => (
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
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPortalActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium">{activity.customer}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {activity.invoice && <code className="text-xs">{activity.invoice}</code>}
                      {activity.ticket && <p className="text-xs">{activity.ticket}</p>}
                      {activity.amount && <p className="text-sm font-semibold">{activity.amount}</p>}
                      {activity.meeting && <p className="text-xs">{activity.meeting}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feature Adoption</CardTitle>
                <CardDescription>Most used portal features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Invoice Download', percent: 85, count: 234 },
                    { label: 'Support Tickets', percent: 72, count: 198 },
                    { label: 'Meeting Booking', percent: 58, count: 159 },
                    { label: 'Payment History', percent: 54, count: 148 },
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Satisfaction</CardTitle>
                <CardDescription>Portal user feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: '5 Stars', value: 78, color: 'text-green-500' },
                    { label: '4 Stars', value: 15, color: 'text-blue-500' },
                    { label: '3 Stars', value: 7, color: 'text-yellow-500' },
                  ].map((rating) => (
                    <div key={rating.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={cn('text-2xl font-bold', rating.color)}>{rating.value}%</p>
                      <p className="text-xs text-muted-foreground">{rating.label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Overall Score</p>
                      <p className="text-xs text-muted-foreground">Based on 450 reviews</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-3xl font-bold text-green-600">4.6</span>
                      <span className="text-green-500">/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
