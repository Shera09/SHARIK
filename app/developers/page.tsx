'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Key,
  Webhook,
  BarChart3,
  DollarSign,
  FileText,
  Users,
  Download,
  Star,
  ExternalLink,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Settings,
  Zap,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Package,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DeveloperProfile = {
  id: string;
  display_name: string;
  company_name: string;
  bio: string;
  website_url: string;
  logo_url: string;
  verification_status: string;
  total_apps: number;
  total_downloads: number;
  total_revenue: number;
  rating_average: number;
  created_at: string;
};

type APIKey = {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
};

type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
};

type AppAnalytics = {
  app_id: string;
  app_name: string;
  installs: number;
  revenue: number;
  rating: number;
};

export default function DeveloperPortalPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [analytics, setAnalytics] = useState<AppAnalytics[]>([]);
  const [createKeyDialog, setCreateKeyDialog] = useState(false);
  const [createWebhookDialog, setCreateWebhookDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    // Mock data for demo
    setProfile({
      id: '1',
      display_name: 'John Developer',
      company_name: 'DevTools Inc',
      bio: 'Building awesome business tools',
      website_url: 'https://devtools.example.com',
      logo_url: '',
      verification_status: 'verified',
      total_apps: 5,
      total_downloads: 12500,
      total_revenue: 45000,
      rating_average: 4.7,
      created_at: new Date().toISOString(),
    });

    setApiKeys([
      { id: '1', name: 'Production Key', key_prefix: 'whpk_live_', permissions: ['api_read', 'api_write'], scopes: ['apps', 'analytics'], rate_limit: 1000, last_used_at: new Date().toISOString(), is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'Test Key', key_prefix: 'whpk_test_', permissions: ['api_read'], scopes: ['apps'], rate_limit: 100, last_used_at: null, is_active: true, created_at: new Date().toISOString() },
    ]);

    setWebhooks([
      { id: '1', name: 'App Install Events', url: 'https://example.com/webhooks/install', events: ['app.installed', 'app.updated'], is_active: true, last_triggered_at: new Date().toISOString(), failure_count: 0, created_at: new Date().toISOString() },
    ]);

    setAnalytics([
      { app_id: '1', app_name: 'GST Filing Assistant', installs: 4500, revenue: 12500, rating: 4.8 },
      { app_id: '2', app_name: 'CRM Suite Pro', installs: 3200, revenue: 15000, rating: 4.6 },
      { app_id: '3', app_name: 'Invoice Templates', installs: 2800, revenue: 8000, rating: 4.7 },
      { app_id: '4', app_name: 'Analytics Widget', installs: 1200, revenue: 5500, rating: 4.5 },
      { app_id: '5', app_name: 'Dark Theme Pro', installs: 800, revenue: 4000, rating: 4.9 },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }

    // Generate a fake key for demo
    const key = `whpk_live_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(key);
    toast.success('API key created!');

    // Add to list
    setApiKeys([{
      id: Date.now().toString(),
      name: newKeyName,
      key_prefix: 'whpk_live_',
      permissions: ['api_read', 'api_write'],
      scopes: ['apps', 'analytics'],
      rate_limit: 1000,
      last_used_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }, ...apiKeys]);

    setNewKeyName('');
  };

  const createWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast.error('Name and URL are required');
      return;
    }

    setWebhooks([{
      id: Date.now().toString(),
      name: newWebhookName,
      url: newWebhookUrl,
      events: ['app.installed'],
      is_active: true,
      last_triggered_at: null,
      failure_count: 0,
      created_at: new Date().toISOString(),
    }, ...webhooks]);

    setCreateWebhookDialog(false);
    setNewWebhookName('');
    setNewWebhookUrl('');
    toast.success('Webhook created!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <AppShell>
      <PageHeader
        title="Developer Portal"
        description="Build, publish, and manage your apps"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create App
          </Button>
        }
      />

      {/* Developer Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Apps</span>
          </div>
          <p className="text-2xl font-bold">{profile?.total_apps || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Downloads</span>
          </div>
          <p className="text-2xl font-bold">{(profile?.total_downloads || 0).toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold">${(profile?.total_revenue || 0).toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold">{profile?.rating_average?.toFixed(1) || '0.0'}</p>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="apps" className="rounded-lg">My Apps</TabsTrigger>
          <TabsTrigger value="api-keys" className="rounded-lg">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="rounded-lg">Webhooks</TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-lg">Earnings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">New App</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCreateKeyDialog(true)}>
                  <Key className="h-5 w-5" />
                  <span className="text-sm">API Key</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCreateWebhookDialog(true)}>
                  <Webhook className="h-5 w-5" />
                  <span className="text-sm">Webhook</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Docs</span>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { type: 'install', message: 'GST Filing Assistant was installed', time: '2 hours ago' },
                  { type: 'review', message: 'New 5-star review for CRM Suite Pro', time: '5 hours ago' },
                  { type: 'sale', message: 'Invoice Templates Pro purchased ($29)', time: '1 day ago' },
                  { type: 'install', message: 'Analytics Widget was installed', time: '2 days ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      activity.type === 'install' ? 'bg-blue-500/10' :
                      activity.type === 'review' ? 'bg-yellow-500/10' :
                      'bg-success/10'
                    )}>
                      {activity.type === 'install' ? <Download className="h-4 w-4 text-blue-500" /> :
                       activity.type === 'review' ? <Star className="h-4 w-4 text-yellow-500" /> :
                       <DollarSign className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Apps */}
          <div className="glass-card p-6 premium-shadow">
            <h3 className="font-semibold mb-4">Your Apps Performance</h3>
            <div className="space-y-3">
              {analytics.map((app, i) => (
                <div key={app.app_id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{app.app_name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {app.installs.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {app.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${app.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Apps Tab */}
        <TabsContent value="apps" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.map((app, i) => (
              <motion.div
                key={app.app_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{app.app_name}</h3>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <p className="text-lg font-bold">{app.installs.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Installs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{app.rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">${app.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="mt-0">
          <div className="glass-card p-6 premium-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">API Keys</h3>
              <Button onClick={() => setCreateKeyDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Key
              </Button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{key.name}</h4>
                      {key.is_active ? (
                        <Badge className="bg-success/10 text-success">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">{key.key_prefix}**************************</code>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Rate limit: {key.rate_limit}/hr</span>
                      <span>Last used: {key.last_used_at ? 'Recently' : 'Never'}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(key.key_prefix)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-0">
          <div className="glass-card p-6 premium-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Webhook Endpoints</h3>
              <Button onClick={() => setCreateWebhookDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Endpoint
              </Button>
            </div>

            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    webhook.is_active ? 'bg-success/10' : 'bg-muted'
                  )}>
                    <Webhook className={cn('h-5 w-5', webhook.is_active ? 'text-success' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{webhook.name}</h4>
                      {webhook.failure_count > 0 && (
                        <Badge className="bg-destructive/10 text-destructive">{webhook.failure_count} failures</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">{webhook.url}</code>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-[9px]">{event}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {webhook.last_triggered_at ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4">Earnings Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                  <span className="font-medium">Available Balance</span>
                  <span className="text-2xl font-bold text-success">$12,450</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">This Month</p>
                    <p className="text-xl font-bold">$3,200</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Payout Schedule</p>
                    <p className="text-xl font-bold">Monthly</p>
                  </div>
                </div>
                <Button className="w-full">Request Payout</Button>
              </div>
            </div>

            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4">Revenue by App</h3>
              <div className="space-y-3">
                {analytics.map((app) => (
                  <div key={app.app_id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{app.app_name}</span>
                        <span className="text-sm">${app.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(app.revenue / 15000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={createKeyDialog} onOpenChange={(open) => { setCreateKeyDialog(open); if (!open) setGeneratedKey(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {!generatedKey ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateKeyDialog(false)}>Cancel</Button>
                <Button onClick={createAPIKey}>Create Key</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4">
                <div className="p-4 rounded-lg bg-success/10 mb-4">
                  <p className="text-sm text-success font-medium mb-2">API key created successfully!</p>
                  <p className="text-xs text-muted-foreground">Save this key securely. You &apos;won&apos;t be able to see it again.</p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <code className="text-sm flex-1 break-all">{generatedKey}</code>
                  <Button size="icon" variant="ghost" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(generatedKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setCreateKeyDialog(false); setGeneratedKey(null); }}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={createWebhookDialog} onOpenChange={setCreateWebhookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="e.g., Production Webhook"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateWebhookDialog(false)}>Cancel</Button>
            <Button onClick={createWebhook}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
