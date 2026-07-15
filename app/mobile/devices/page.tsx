'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Fingerprint,
  Clock,
  Activity,
  MapPin,
  Settings,
  Search,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  device_os: string;
  device_model: string;
  app_version: string;
  biometric_enabled: boolean;
  trusted_device: boolean;
  last_active_at: string;
  is_active: boolean;
}

const deviceTypeIcons: Record<string, typeof Smartphone> = {
  android: Smartphone,
  ios: Smartphone,
  pwa: Globe,
  windows: Monitor,
  macos: Monitor,
  linux: Monitor,
  tablet: Tablet,
};

const deviceTypeColors: Record<string, string> = {
  android: 'text-green-600 bg-green-500/10',
  ios: 'text-gray-600 bg-gray-500/10',
  pwa: 'text-purple-600 bg-purple-500/10',
  windows: 'text-blue-600 bg-blue-500/10',
  macos: 'text-gray-700 bg-gray-600/10',
  linux: 'text-orange-600 bg-orange-500/10',
  tablet: 'text-cyan-600 bg-cyan-500/10',
};

// Mock data
const mockDevices: Device[] = [
  { device_id: '1', device_name: 'John\'s iPhone 15 Pro', device_type: 'ios', device_os: 'iOS 17.2', device_model: 'iPhone 15 Pro', app_version: '2.1.0', biometric_enabled: true, trusted_device: true, last_active_at: new Date().toISOString(), is_active: true },
  { device_id: '2', device_name: 'Sales Tablet', device_type: 'tablet', device_os: 'iPadOS 17', device_model: 'iPad Pro 12.9"', app_version: '2.1.0', biometric_enabled: true, trusted_device: true, last_active_at: new Date().toISOString(), is_active: true },
  { device_id: '3', device_name: 'Admin MacBook', device_type: 'macos', device_os: 'macOS Sonoma', device_model: 'MacBook Pro 16"', app_version: '2.1.0', biometric_enabled: true, trusted_device: true, last_active_at: new Date(Date.now() - 3600000).toISOString(), is_active: true },
  { device_id: '4', device_name: 'PWA Browser', device_type: 'pwa', device_os: 'Windows 11', device_model: 'Desktop Chrome', app_version: '2.1.0', biometric_enabled: false, trusted_device: false, last_active_at: new Date(Date.now() - 86400000).toISOString(), is_active: true },
  { device_id: '5', device_name: 'Field Sales Pixel', device_type: 'android', device_os: 'Android 14', device_model: 'Pixel 8 Pro', app_version: '2.0.5', biometric_enabled: true, trusted_device: true, last_active_at: new Date(Date.now() - 172800000).toISOString(), is_active: false },
];

export default function DeviceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      const { data, error } = await supabase
        .from('device_registrations')
        .select('*')
        .order('last_active_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setDevices(data.map(d => ({
          device_id: d.device_id,
          device_name: d.device_name,
          device_type: d.device_type,
          device_os: d.device_os || 'Unknown',
          device_model: d.device_model || 'Unknown',
          app_version: d.app_version || '1.0.0',
          biometric_enabled: d.biometric_enabled || false,
          trusted_device: d.trusted_device || false,
          last_active_at: d.last_active_at,
          is_active: d.is_active,
        })));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
    toast.success('Devices refreshed');
  }

  async function revokeDevice(deviceId: string) {
    try {
      const { error } = await supabase
        .from('device_registrations')
        .update({ is_active: false })
        .eq('device_id', deviceId);

      if (error) throw error;
      setDevices(devices.map(d => d.device_id === deviceId ? { ...d, is_active: false } : d));
      toast.success('Device access revoked');
    } catch (error) {
      toast.error('Failed to revoke device');
    }
  }

  const filteredDevices = devices.filter(d =>
    d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.device_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDevices = devices.filter(d => d.is_active);
  const trustedDevices = devices.filter(d => d.trusted_device);

  return (
    <AppShell>
      <PageHeader
        title="Device Management"
        description="Register, manage, and secure mobile and desktop devices"
        action={
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: Smartphone, color: 'text-blue-500' },
          { label: 'Active', value: activeDevices.length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Trusted', value: trustedDevices.length, icon: Shield, color: 'text-purple-500' },
          { label: 'Android', value: devices.filter(d => d.device_type === 'android').length, icon: Smartphone, color: 'text-green-600' },
          { label: 'iOS', value: devices.filter(d => d.device_type === 'ios').length, icon: Smartphone, color: 'text-gray-600' },
          { label: 'Biometric', value: devices.filter(d => d.biometric_enabled).length, icon: Fingerprint, color: 'text-orange-500' },
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

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="all" className="rounded-lg">All Devices</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="trusted" className="rounded-lg">Trusted</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device, i) => {
                    const Icon = deviceTypeIcons[device.device_type] || Smartphone;
                    return (
                      <motion.tr
                        key={device.device_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', deviceTypeColors[device.device_type] || 'bg-muted')}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{device.device_name}</p>
                              <p className="text-xs text-muted-foreground">{device.device_model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{device.device_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{device.device_os}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{device.app_version}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(device.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>
                              {device.is_active ? 'Active' : 'Revoked'}
                            </Badge>
                            {device.trusted_device && (
                              <Badge className="bg-purple-500/10 text-purple-600">
                                <Shield className="h-3 w-3 mr-1" /> Trusted
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(device.last_active_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {device.is_active && (
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => revokeDevice(device.device_id)}>
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Biometric</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.filter(d => d.is_active).map((device) => {
                    const Icon = deviceTypeIcons[device.device_type] || Smartphone;
                    return (
                      <TableRow key={device.device_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', deviceTypeColors[device.device_type])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{device.device_name}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{device.device_type}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(device.last_active_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {device.biometric_enabled ? <Fingerprint className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trusted" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Biometric</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.filter(d => d.trusted_device).map((device) => {
                    const Icon = deviceTypeIcons[device.device_type] || Smartphone;
                    return (
                      <TableRow key={device.device_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', deviceTypeColors[device.device_type])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{device.device_name}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{device.device_type}</Badge></TableCell>
                        <TableCell>
                          {device.biometric_enabled ? <Fingerprint className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(device.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>
                            {device.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
