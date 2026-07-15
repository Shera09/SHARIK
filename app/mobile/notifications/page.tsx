'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  DollarSign,
  FileText,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Shield,
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PushNotification {
  notification_id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: number;
  status: string;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationPreferences {
  lead_alerts: boolean;
  payment_alerts: boolean;
  invoice_alerts: boolean;
  task_reminders: boolean;
  meeting_reminders: boolean;
  support_tickets: boolean;
  security_alerts: boolean;
  marketing_updates: boolean;
  employee_notifications: boolean;
  system_alerts: boolean;
}

const notificationTypes = [
  { key: 'lead_alerts', label: 'Lead Alerts', icon: Users, color: 'text-blue-500' },
  { key: 'payment_alerts', label: 'Payment Alerts', icon: DollarSign, color: 'text-green-500' },
  { key: 'invoice_alerts', label: 'Invoice Alerts', icon: FileText, color: 'text-purple-500' },
  { key: 'task_reminders', label: 'Task Reminders', icon: CheckSquare, color: 'text-orange-500' },
  { key: 'meeting_reminders', label: 'Meeting Reminders', icon: Calendar, color: 'text-cyan-500' },
  { key: 'support_tickets', label: 'Support Tickets', icon: AlertTriangle, color: 'text-pink-500' },
  { key: 'security_alerts', label: 'Security Alerts', icon: Shield, color: 'text-red-500' },
  { key: 'marketing_updates', label: 'Marketing Updates', icon: Megaphone, color: 'text-amber-500' },
  { key: 'employee_notifications', label: 'Employee Notifications', icon: Users, color: 'text-indigo-500' },
  { key: 'system_alerts', label: 'System Alerts', icon: Bell, color: 'text-slate-500' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  sent: 'bg-blue-500/10 text-blue-600',
  delivered: 'bg-green-500/10 text-green-600',
  read: 'bg-purple-500/10 text-purple-600',
  failed: 'bg-red-500/10 text-red-600',
};

const mockNotifications: PushNotification[] = [
  { notification_id: '1', notification_type: 'lead_alerts', title: 'New Lead Assigned', message: 'Acme Corp has been assigned to you', priority: 5, status: 'delivered', sent_at: new Date().toISOString(), read_at: null, created_at: new Date().toISOString() },
  { notification_id: '2', notification_type: 'payment_alerts', title: 'Payment Received', message: 'Payment of ₹25,000 received for INV-001', priority: 5, status: 'read', sent_at: new Date(Date.now() - 3600000).toISOString(), read_at: new Date().toISOString(), created_at: new Date(Date.now() - 3600000).toISOString() },
  { notification_id: '3', notification_type: 'task_reminders', title: 'Task Due Today', message: 'Follow up with Tech Solutions due in 2 hours', priority: 7, status: 'sent', sent_at: new Date(Date.now() - 1800000).toISOString(), read_at: null, created_at: new Date(Date.now() - 1800000).toISOString() },
  { notification_id: '4', notification_type: 'meeting_reminders', title: 'Meeting in 30 mins', message: 'Q4 Review with Sales Team', priority: 9, status: 'delivered', sent_at: new Date(Date.now() - 7200000).toISOString(), read_at: null, created_at: new Date(Date.now() - 7200000).toISOString() },
];

export default function PushNotificationsPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    lead_alerts: true,
    payment_alerts: true,
    invoice_alerts: true,
    task_reminders: true,
    meeting_reminders: true,
    support_tickets: true,
    security_alerts: true,
    marketing_updates: false,
    employee_notifications: true,
    system_alerts: true,
  });
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'system_alerts' });

  function togglePreference(key: keyof NotificationPreferences) {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference updated');
  }

  function sendTestNotification() {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all fields');
      return;
    }
    const notification: PushNotification = {
      notification_id: Math.random().toString(36).substring(2, 10),
      notification_type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      priority: 5,
      status: 'pending',
      sent_at: null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setNotifications([notification, ...notifications]);
    setSendDialogOpen(false);
    setNewNotification({ title: '', message: '', type: 'system_alerts' });
    toast.success('Notification queued for sending');
  }

  const stats = {
    pending: notifications.filter(n => n.status === 'pending').length,
    sent: notifications.filter(n => n.status === 'sent').length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    read: notifications.filter(n => n.status === 'read').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Push Notifications"
        description="Manage push notifications and user preferences"
        action={
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Push Notification</DialogTitle>
                <DialogDescription>Send a test notification to connected devices</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    className="mt-1.5"
                    placeholder="Notification message"
                    rows={3}
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
                  <Button onClick={sendTestNotification}>Send</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'text-blue-500' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Read', value: stats.read, icon: Eye, color: 'text-purple-500' },
          { label: 'Enabled Types', value: Object.values(preferences).filter(Boolean).length, icon: Bell, color: 'text-cyan-500' },
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

      <Tabs defaultValue="history" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="history" className="rounded-lg gap-1.5">
            <Bell className="h-4 w-4" />
            Notification History
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.map((notification, i) => (
                  <motion.div
                    key={notification.notification_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        statusColors[notification.status] || 'bg-muted'
                      )}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {notification.notification_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px]', statusColors[notification.status])}>
                      {notification.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Configure which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {notificationTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <type.icon className={cn('h-5 w-5', type.color)} />
                      <Label className="font-normal">{type.label}</Label>
                    </div>
                    <Switch
                      checked={preferences[type.key as keyof NotificationPreferences]}
                      onCheckedChange={() => togglePreference(type.key as keyof NotificationPreferences)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Label>Quiet Hours</Label>
                  <Switch defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Notifications will be silenced from 22:00 to 07:00
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
