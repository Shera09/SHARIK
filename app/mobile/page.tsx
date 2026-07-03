'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Bell,
  Users,
  DollarSign,
  Briefcase,
  Globe,
  Sparkles,
  Fingerprint,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Wifi,
  WifiOff,
  ArrowRight,
  TrendingUp,
  Activity,
  Shield,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface DeviceStats {
  total: number;
  android: number;
  ios: number;
  pwa: number;
  desktop: number;
  activeToday: number;
}

interface SyncStats {
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
}

const mobileModules = [
  { label: 'Device Management', href: '/mobile/devices', icon: Smartphone, description: 'Register, manage, and secure mobile devices', color: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'Sync Engine', href: '/mobile/sync', icon: RefreshCw, description: 'Offline-first sync with conflict resolution', color: 'from-green-500/20 to-emerald-500/20' },
  { label: 'Push Notifications', href: '/mobile/notifications', icon: Bell, description: 'Real-time alerts and notification management', color: 'from-purple-500/20 to-pink-500/20' },
  { label: 'Mobile CRM', href: '/mobile/crm', icon: Users, description: 'Lead and customer management on the go', color: 'from-orange-500/20 to-amber-500/20' },
  { label: 'Mobile Finance', href: '/mobile/finance', icon: DollarSign, description: 'Invoices, payments, and expense tracking', color: 'from-teal-500/20 to-cyan-500/20' },
  { label: 'Mobile HRMS', href: '/mobile/hrms', icon: Briefcase, description: 'Attendance, leaves, and employee self-service', color: 'from-indigo-500/20 to-violet-500/20' },
  { label: 'Customer Portal', href: '/mobile/portal', icon: Globe, description: 'Self-service portal for customers', color: 'from-rose-500/20 to-red-500/20' },
  { label: 'AI Mobile Assistant', href: '/mobile/ai-assistant', icon: Sparkles, description: 'Voice commands and AI-powered productivity', color: 'from-pink-500/20 to-purple-500/20', badge: 'AI' },
  { label: 'Biometric Security', href: '/mobile/biometrics', icon: Fingerprint, description: 'Fingerprint, face recognition, and secure auth', color: 'from-slate-500/20 to-zinc-500/20' },
  { label: 'Mobile Analytics', href: '/mobile/analytics', icon: BarChart3, description: 'Usage insights and performance metrics', color: 'from-cyan-500/20 to-sky-500/20' },
];

const platformIcons: Record<string, typeof Smartphone> = {
  android: Smartphone,
  ios: Smartphone,
  pwa: Globe,
  windows: Monitor,
  macos: Monitor,
  linux: Monitor,
  tablet: Tablet,
};

export default function MobileEcosystemPage() {
  const [loading, setLoading] = useState(true);
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    total: 0,
    android: 0,
    ios: 0,
    pwa: 0,
    desktop: 0,
    activeToday: 0,
  });
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pending: 0,
    syncing: 0,
    completed: 0,
    failed: 0,
  });
  const [notificationStats, setNotificationStats] = useState({ pending: 0, sent: 0, delivered: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [devicesRes, syncRes, notificationsRes] = await Promise.all([
        supabase.from('device_registrations').select('device_type, is_active, last_active_at'),
        supabase.from('sync_queue').select('status'),
        supabase.from('push_notifications').select('status'),
      ]);

      if (devicesRes.data) {
        const devices = devicesRes.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setDeviceStats({
          total: devices.length,
          android: devices.filter(d => d.device_type === 'android').length,
          ios: devices.filter(d => d.device_type === 'ios').length,
          pwa: devices.filter(d => d.device_type === 'pwa').length,
          desktop: devices.filter(d => ['windows', 'macos', 'linux'].includes(d.device_type)).length,
          activeToday: devices.filter(d => new Date(d.last_active_at) >= today).length,
        });
      }

      if (syncRes.data) {
        const sync = syncRes.data;
        setSyncStats({
          pending: sync.filter(s => s.status === 'pending').length,
          syncing: sync.filter(s => s.status === 'syncing').length,
          completed: sync.filter(s => s.status === 'completed').length,
          failed: sync.filter(s => s.status === 'failed').length,
        });
      }

      if (notificationsRes.data) {
        const notif = notificationsRes.data;
        setNotificationStats({
          pending: notif.filter(n => n.status === 'pending').length,
          sent: notif.filter(n => n.status === 'sent').length,
          delivered: notif.filter(n => n.status === 'delivered').length,
        });
      }
    } catch (error) {
      console.error('Error loading mobile data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalSync = syncStats.pending + syncStats.syncing + syncStats.completed + syncStats.failed;
  const syncHealth = totalSync > 0 ? (syncStats.completed / totalSync) * 100 : 100;

  return (
    <AppShell>
      <PageHeader
        title="Mobile Ecosystem"
        description="Cross-platform mobile, desktop, and PWA management for the enterprise"
        action={
          <Badge className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
            <Wifi className="h-3 w-3" />
            Online
          </Badge>
        }
      />

      {/* Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Devices', value: deviceStats.total, icon: Smartphone, color: 'text-blue-500' },
          { label: 'Android', value: deviceStats.android, icon: Smartphone, color: 'text-green-500' },
          { label: 'iOS', value: deviceStats.ios, icon: Smartphone, color: 'text-gray-600' },
          { label: 'PWA', value: deviceStats.pwa, icon: Globe, color: 'text-purple-500' },
          { label: 'Desktop', value: deviceStats.desktop, icon: Monitor, color: 'text-orange-500' },
          { label: 'Active Today', value: deviceStats.activeToday, icon: Activity, color: 'text-cyan-500' },
          { label: 'Sync Health', value: `${syncHealth.toFixed(0)}%`, icon: CheckCircle, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
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

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Module Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Mobile Platform Modules</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mobileModules.map((module, i) => (
              <motion.div
                key={module.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <Link href={module.href}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                    <div className={cn('h-1 bg-gradient-to-r', module.color)} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', module.color)}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        {module.badge && (
                          <Badge className="text-[10px] bg-primary/10 text-primary">{module.badge}</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-sm">{module.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Panels */}
        <div className="space-y-6">
          {/* Sync Status */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              Sync Status
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sync Health</span>
                    <Badge className={cn(
                      syncHealth >= 95 ? 'bg-green-500/10 text-green-600' :
                      syncHealth >= 80 ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-red-500/10 text-red-600'
                    )}>
                      {syncHealth.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={syncHealth} className="h-2" />

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-yellow-600">{syncStats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-blue-600">{syncStats.syncing}</p>
                      <p className="text-xs text-muted-foreground">Syncing</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-green-600">{syncStats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-red-600">{syncStats.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { label: 'Pending', value: notificationStats.pending, color: 'bg-yellow-500' },
                    { label: 'Sent', value: notificationStats.sent, color: 'bg-blue-500' },
                    { label: 'Delivered', value: notificationStats.delivered, color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', item.color)} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Distribution */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tablet className="h-5 w-5 text-cyan-500" />
              Platform Distribution
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { label: 'Android', value: deviceStats.android, total: deviceStats.total || 1, color: 'bg-green-500' },
                    { label: 'iOS', value: deviceStats.ios, total: deviceStats.total || 1, color: 'bg-gray-600' },
                    { label: 'PWA', value: deviceStats.pwa, total: deviceStats.total || 1, color: 'bg-purple-500' },
                    { label: 'Desktop', value: deviceStats.desktop, total: deviceStats.total || 1, color: 'bg-orange-500' },
                  ].map((platform) => (
                    <div key={platform.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{platform.label}</span>
                        <span className="text-muted-foreground">{platform.value}</span>
                      </div>
                      <Progress value={(platform.value / platform.total) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
