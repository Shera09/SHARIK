'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Smartphone,
  Users,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  Zap,
  Globe,
  Wifi,
  WifiOff,
  Download,
  Battery,
  Cpu,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const usageMetrics = [
  { label: 'Daily Active Users', value: 234, change: '+12%', icon: Users, color: 'text-blue-500' },
  { label: 'Avg Session Duration', value: '18m 45s', change: '+5%', icon: Clock, color: 'text-green-500' },
  { label: 'Crash-Free Sessions', value: '99.2%', change: '+0.3%', icon: Zap, color: 'text-purple-500' },
  { label: 'Sync Success Rate', value: '98.5%', change: '+2.1%', icon: RefreshCw, color: 'text-orange-500' },
];

const topFeatures = [
  { feature: 'Lead Capture', users: 189, sessions: 1250 },
  { feature: 'Invoice Generation', users: 145, sessions: 890 },
  { feature: 'Call Logging', users: 134, sessions: 2100 },
  { feature: 'Attendance', users: 120, sessions: 560 },
  { feature: 'Customer Lookup', users: 98, sessions: 3400 },
];

const performanceMetrics = [
  { metric: 'App Startup', value: '1.2s', status: 'good', target: '<2s' },
  { metric: 'Screen Load', value: '0.3s', status: 'good', target: '<0.5s' },
  { metric: 'API Response', value: '145ms', status: 'good', target: '<200ms' },
  { metric: 'Offline Sync', value: '2.1s', status: 'warning', target: '<2s' },
  { metric: 'Push Delivery', value: '0.8s', status: 'good', target: '<1s' },
];

const devicePerformance = [
  { device: 'iPhone 15 Pro', score: 98, users: 45 },
  { device: 'Pixel 8', score: 96, users: 38 },
  { device: 'Galaxy S24', score: 94, users: 32 },
  { device: 'iPad Pro', score: 97, users: 28 },
];

export default function MobileAnalyticsPage() {
  const stats = {
    totalSessions: 12500,
    offlineSessions: 2300,
    medianSession: 18,
    crashReports: 12,
  };

  return (
    <AppShell>
      <PageHeader
        title="Mobile Analytics"
        description="App usage insights, performance metrics, and user engagement"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: stats.totalSessions.toLocaleString(), icon: Activity, color: 'text-blue-500' },
          { label: 'Offline Sessions', value: stats.offlineSessions.toLocaleString(), icon: WifiOff, color: 'text-orange-500' },
          { label: 'Median Duration', value: `${stats.medianSession}m`, icon: Clock, color: 'text-green-500' },
          { label: 'Crash Reports', value: stats.crashReports, icon: Zap, color: 'text-red-500' },
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

      {/* Usage Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {usageMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={cn('h-5 w-5', metric.color)} />
              <Badge className={cn(
                'text-[10px]',
                metric.change.startsWith('+') ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
              )}>
                {metric.change}
              </Badge>
            </div>
            <p className="text-xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="engagement" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="engagement" className="rounded-lg gap-1.5">
            <Users className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg gap-1.5">
            <Cpu className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="devices" className="rounded-lg gap-1.5">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Features</CardTitle>
                <CardDescription>Most used features in the mobile app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFeatures.map((feature, i) => (
                    <div key={feature.feature}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          <span>{feature.feature}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{feature.sessions.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">{feature.users} users</span>
                        </div>
                      </div>
                      <Progress value={(feature.sessions / 3400) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Trends</CardTitle>
                <CardDescription>App usage over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: 'Mon', sessions: 1200, users: 180 },
                    { day: 'Tue', sessions: 1450, users: 210 },
                    { day: 'Wed', sessions: 1380, users: 195 },
                    { day: 'Thu', sessions: 1620, users: 235 },
                    { day: 'Fri', sessions: 1890, users: 250 },
                    { day: 'Sat', sessions: 850, users: 120 },
                    { day: 'Sun', sessions: 620, users: 98 },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${(day.sessions / 2000) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{day.sessions.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Metrics</CardTitle>
              <CardDescription>App performance benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.metric} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{metric.metric}</span>
                      <Badge className={cn(
                        'text-[10px]',
                        metric.status === 'good' ? 'bg-green-500/10 text-green-600' :
                        metric.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      )}>
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Performance</CardTitle>
                <CardDescription>Performance score by device model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devicePerformance.map((device) => (
                    <div key={device.device} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{device.device}</p>
                          <p className="text-xs text-muted-foreground">{device.users} users</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={device.score} className="w-20 h-2" />
                        <span className="text-sm font-medium">{device.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Distribution</CardTitle>
                <CardDescription>Users by platform type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { platform: 'iOS', percent: 42, color: 'bg-gray-600' },
                    { platform: 'Android', percent: 35, color: 'bg-green-500' },
                    { platform: 'PWA', percent: 15, color: 'bg-purple-500' },
                    { platform: 'Desktop', percent: 8, color: 'bg-blue-500' },
                  ].map((platform) => (
                    <div key={platform.platform} className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{platform.platform}</span>
                        <span className="text-lg font-bold">{platform.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className={cn('h-2 rounded-full', platform.color)} style={{ width: `${platform.percent}%` }} />
                      </div>
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
