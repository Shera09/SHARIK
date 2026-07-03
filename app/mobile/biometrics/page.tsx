'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fingerprint,
  Smartphone,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Lock,
  Trash2,
  Settings,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const biometricFeatures = [
  { label: 'Fingerprint Authentication', icon: Fingerprint, description: 'Secure unlock via fingerprint', enabled: true },
  { label: 'Face Recognition', icon: Eye, description: 'Face ID / Face Unlock support', enabled: true },
  { label: 'Device PIN Fallback', icon: Key, description: 'PIN backup for biometrics', enabled: true },
  { label: 'Secure Session Lock', icon: Lock, description: 'Auto-lock after inactivity', enabled: true },
  { label: 'Automatic Timeout', icon: Clock, description: 'Configurable timeout period', enabled: true },
  { label: 'Remote Logout', icon: Trash2, description: 'Remote device session termination', enabled: true },
];

const authMethods = [
  { method: 'Biometric', icon: Fingerprint, users: 450, percent: 75 },
  { method: 'PIN', icon: Key, users: 120, percent: 20 },
  { method: 'Password', icon: Lock, users: 30, percent: 5 },
];

const recentAuthEvents = [
  { id: '1', event: 'Biometric unlock', device: 'iPhone 15 Pro', user: 'John Smith', time: '2 min ago', success: true },
  { id: '2', event: 'Failed attempt', device: 'Pixel 8', user: 'Unknown', time: '15 min ago', success: false },
  { id: '3', event: 'PIN unlock', device: 'iPad Pro', user: 'Sarah Johnson', time: '1 hour ago', success: true },
  { id: '4', event: 'Remote logout', device: 'Galaxy S24', user: 'Admin', time: '2 hours ago', success: true },
];

export default function BiometricsPage() {
  const [securitySettings, setSecuritySettings] = useState({
    biometricRequired: true,
    autoLockMinutes: 5,
    pinFallback: true,
    remoteLogout: true,
  });

  const stats = {
    biometricUsers: 450,
    authToday: 1250,
    failedAttempts: 12,
    avgAuthTime: '0.8s',
  };

  return (
    <AppShell>
      <PageHeader
        title="Biometric Security"
        description="Fingerprint, face recognition, and secure authentication management"
        action={
          <Badge className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
            <Shield className="h-3 w-3" />
            Secure
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Biometric Users', value: stats.biometricUsers, icon: Fingerprint, color: 'text-purple-500' },
          { label: 'Auths Today', value: stats.authToday.toLocaleString(), icon: UserCheck, color: 'text-green-500' },
          { label: 'Failed Attempts', value: stats.failedAttempts, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Avg Auth Time', value: stats.avgAuthTime, icon: Clock, color: 'text-blue-500' },
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
            <Fingerprint className="h-4 w-4" />
            Biometric Features
          </TabsTrigger>
          <TabsTrigger value="methods" className="rounded-lg gap-1.5">
            <Shield className="h-4 w-4" />
            Auth Methods
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Auth Events
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {biometricFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      {feature.enabled && <CheckCircle className="h-4 w-4 text-green-500" />}
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

        <TabsContent value="methods" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authentication Methods</CardTitle>
                <CardDescription>Distribution of auth methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authMethods.map((method) => (
                    <div key={method.method}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{method.method}</span>
                        </div>
                        <span className="text-muted-foreground">{method.users} users ({method.percent}%)</span>
                      </div>
                      <Progress value={method.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Metrics</CardTitle>
                <CardDescription>Authentication performance today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Success Rate', value: '99.2%', color: 'text-green-600' },
                    { label: 'Avg Response', value: '0.8s', color: 'text-blue-600' },
                    { label: 'Face ID Users', value: '280', color: 'text-purple-600' },
                    { label: 'Fingerprint Users', value: '170', color: 'text-orange-600' },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center p-4 rounded-lg bg-muted/30">
                      <p className={cn('text-2xl font-bold', metric.color)}>{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentAuthEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        event.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      )}>
                        {event.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.user} • {event.device}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <CardDescription>Configure biometric and security options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { key: 'biometricRequired', label: 'Require Biometric', description: 'Mandatory biometric authentication for app access' },
                  { key: 'pinFallback', label: 'PIN Fallback', description: 'Allow PIN as backup authentication method' },
                  { key: 'remoteLogout', label: 'Remote Logout', description: 'Enable remote session termination' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="font-normal">{setting.label}</Label>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={securitySettings[setting.key as keyof typeof securitySettings] as boolean}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, [setting.key]: checked })
                      }
                    />
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-normal">Auto-Lock Timeout</Label>
                    <span className="text-sm font-medium">{securitySettings.autoLockMinutes} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={securitySettings.autoLockMinutes}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, autoLockMinutes: Number(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    App will lock after {securitySettings.autoLockMinutes} minutes of inactivity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
