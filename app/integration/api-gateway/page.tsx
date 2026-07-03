'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Zap,
  RefreshCw,
  Settings,
  Server,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApiKey {
  key_id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rate_limit_per_minute: number;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  handler: string;
  rate_limit: number;
  auth_required: boolean;
  version: string;
  description: string;
}

interface UsageStats {
  total_requests: number;
  success_rate: number;
  avg_latency: number;
  rate_limited: number;
}

const methodColors: Record<string, string> = {
  GET: 'text-green-600 bg-green-500/10',
  POST: 'text-blue-600 bg-blue-500/10',
  PUT: 'text-amber-600 bg-amber-500/10',
  PATCH: 'text-orange-600 bg-orange-500/10',
  DELETE: 'text-red-600 bg-red-500/10',
};

// Mock endpoints for demo
const mockEndpoints: ApiEndpoint[] = [
  { path: '/api/v1/customers', method: 'GET', handler: 'customers:list', rate_limit: 100, auth_required: true, version: 'v1', description: 'List all customers' },
  { path: '/api/v1/customers', method: 'POST', handler: 'customers:create', rate_limit: 50, auth_required: true, version: 'v1', description: 'Create a customer' },
  { path: '/api/v1/customers/:id', method: 'GET', handler: 'customers:get', rate_limit: 200, auth_required: true, version: 'v1', description: 'Get customer by ID' },
  { path: '/api/v1/invoices', method: 'GET', handler: 'invoices:list', rate_limit: 100, auth_required: true, version: 'v1', description: 'List all invoices' },
  { path: '/api/v1/invoices', method: 'POST', handler: 'invoices:create', rate_limit: 30, auth_required: true, version: 'v1', description: 'Create an invoice' },
  { path: '/api/v1/leads', method: 'GET', handler: 'leads:list', rate_limit: 100, auth_required: true, version: 'v1', description: 'List leads' },
  { path: '/api/v1/tasks', method: 'GET', handler: 'tasks:list', rate_limit: 200, auth_required: true, version: 'v1', description: 'List tasks' },
  { path: '/api/v1/webhooks', method: 'POST', handler: 'webhooks:trigger', rate_limit: 500, auth_required: true, version: 'v1', description: 'Trigger webhook' },
  { path: '/api/v2/analytics', method: 'GET', handler: 'analytics:query', rate_limit: 30, auth_required: true, version: 'v2', description: 'Query analytics data' },
  { path: '/api/v2/ai/infer', method: 'POST', handler: 'ai:infer', rate_limit: 60, auth_required: true, version: 'v2', description: 'AI inference endpoint' },
];

export default function ApiGatewayPage() {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    total_requests: 156789,
    success_rate: 99.7,
    avg_latency: 145,
    rate_limited: 23,
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      // Generate a mock key
      const keyPrefix = 'whos_' + Math.random().toString(36).substring(2, 8);
      const fullKey = keyPrefix + '_' + Math.random().toString(36).substring(2, 32);

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName,
          prefix: keyPrefix,
          scopes: newKeyScopes,
          rate_limit_per_minute: 100,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedKey(fullKey);
      setApiKeys([...apiKeys, data]);
      toast.success('API key created');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  }

  async function revokeKey(keyId: string) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('key_id', keyId);

      if (error) throw error;
      setApiKeys(apiKeys.map(k => k.key_id === keyId ? { ...k, is_active: false } : k));
      toast.success('API key revoked');
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  }

  const filteredKeys = apiKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.prefix.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endpointPaths = Array.from(new Set(mockEndpoints.map(e => e.path.split('/:')[0].split('/').slice(0, 3).join('/'))));

  return (
    <AppShell>
      <PageHeader
        title="API Gateway"
        description="Manage API keys, endpoints, rate limiting, and usage analytics"
        action={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for accessing the platform
                </DialogDescription>
              </DialogHeader>

              {createdKey ? (
                <div className="py-6">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                    <p className="text-sm font-medium text-green-600 mb-2">API Key Created</p>
                    <p className="text-xs text-muted-foreground mb-3">Copy this key now. It won't be shown again.</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">{createdKey}</code>
                      <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(createdKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => { setShowCreateDialog(false); setCreatedKey(null); setNewKeyName(''); }}>
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Key Name</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Production Server"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Scopes</Label>
                    <Select value={newKeyScopes[0] || ''} onValueChange={(v) => setNewKeyScopes([v])}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                    <Button onClick={createApiKey}>Create Key</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: usageStats.total_requests.toLocaleString(), icon: Globe, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${usageStats.success_rate}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Latency', value: `${usageStats.avg_latency}ms`, icon: Clock, color: 'text-purple-500' },
          { label: 'Rate Limited', value: usageStats.rate_limited.toString(), icon: Zap, color: 'text-orange-500' },
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

      <Tabs defaultValue="keys" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="keys" className="rounded-lg gap-1.5">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="rounded-lg gap-1.5">
            <Server className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="usage" className="rounded-lg gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Usage
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">API Keys</CardTitle>
                  <CardDescription>Manage keys for API authentication</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg shimmer" />)}
                </div>
              ) : filteredKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No API keys found</p>
                  <Button variant="outline" className="mt-4 gap-2" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Create your first key
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key, i) => (
                      <motion.tr
                        key={key.key_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="group"
                      >
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{key.prefix}...</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {key.scopes.map((scope) => (
                              <Badge key={scope} variant="outline" className="text-[10px]">{scope}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{key.rate_limit_per_minute}/min</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            key.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                          )}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {key.is_active && (
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => revokeKey(key.key_id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Endpoints</CardTitle>
              <CardDescription>Available REST API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEndpoints.map((endpoint, i) => (
                    <motion.tr
                      key={`${endpoint.method}-${endpoint.path}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <TableCell>
                        <Badge className={cn('font-mono text-[10px]', methodColors[endpoint.method])}>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{endpoint.description}</TableCell>
                      <TableCell>{endpoint.rate_limit}/min</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{endpoint.version}</Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Distribution</CardTitle>
                <CardDescription>Requests by endpoint category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: '/api/v1/customers', requests: 45230, percent: 29 },
                    { name: '/api/v1/invoices', requests: 32100, percent: 20 },
                    { name: '/api/v1/leads', requests: 28900, percent: 18 },
                    { name: '/api/v2/ai', requests: 24500, percent: 16 },
                    { name: '/api/v1/webhooks', requests: 26059, percent: 17 },
                  ].map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <code className="font-mono text-xs">{item.name}</code>
                        <span className="text-muted-foreground">{item.requests.toLocaleString()}</span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Time Distribution</CardTitle>
                <CardDescription>Latency percentiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'P50', value: '89ms' },
                    { label: 'P90', value: '234ms' },
                    { label: 'P95', value: '456ms' },
                    { label: 'P99', value: '892ms' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">0.3%</p>
                      <p className="text-xs text-muted-foreground">471 errors</p>
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
