'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  BookOpen,
  Key,
  Play,
  Terminal,
  Copy,
  CheckCircle,
  ExternalLink,
  FileJson,
  Globe,
  Zap,
  Shield,
  Layers,
  Package,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DeveloperApp {
  app_id: string;
  name: string;
  description: string;
  client_id: string;
  client_secret_hash: string;
  redirect_uris: string[];
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  created_at: string;
}

const apiEndpoints = [
  { method: 'GET', path: '/api/v1/customers', description: 'List all customers', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/customers', description: 'Create a customer', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/customers/:id', description: 'Get customer by ID', auth: 'API Key' },
  { method: 'PUT', path: '/api/v1/customers/:id', description: 'Update customer', auth: 'API Key' },
  { method: 'DELETE', path: '/api/v1/customers/:id', description: 'Delete customer', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/invoices', description: 'List all invoices', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/invoices', description: 'Create an invoice', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/invoices/:id/send', description: 'Send invoice via email', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/leads', description: 'List leads', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/leads', description: 'Create a lead', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/webhooks', description: 'Trigger webhook', auth: 'API Key' },
  { method: 'POST', path: '/api/v2/ai/infer', description: 'AI inference', auth: 'API Key' },
];

const methodColors: Record<string, string> = {
  GET: 'text-green-600 bg-green-500/10',
  POST: 'text-blue-600 bg-blue-500/10',
  PUT: 'text-amber-600 bg-amber-500/10',
  DELETE: 'text-red-600 bg-red-500/10',
};

const sdkExamples = {
  javascript: `import { WebhosterClient } from '@webhoster/sdk';

const client = new WebhosterClient({
  apiKey: 'whos_your_api_key_here',
});

// List customers
const customers = await client.customers.list();
console.log(customers);

// Create a customer
const newCustomer = await client.customers.create({
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '+91-9876543210',
});`,
  python: `from webhoster import Client

client = Client(api_key='whos_your_api_key_here')

# List customers
customers = client.customers.list()
print(customers)

# Create a customer
new_customer = client.customers.create(
    name='Acme Corp',
    email='contact@acme.com',
    phone='+91-9876543210'
)`,
  curl: `# List customers
curl -X GET "https://api.webhoster.ai/v1/customers" \\
  -H "Authorization: Bearer whos_your_api_key_here" \\
  -H "Content-Type: application/json"

# Create a customer
curl -X POST "https://api.webhoster.ai/v1/customers" \\
  -H "Authorization: Bearer whos_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Acme Corp","email":"contact@acme.com"}'`,
};

// Mock apps
const mockApps: DeveloperApp[] = [
  {
    app_id: '1',
    name: 'Production App',
    description: 'Main production application',
    client_id: 'whos_app_prod_abc123',
    client_secret_hash: '••••••••••••••••',
    redirect_uris: ['https://app.example.com/callback'],
    scopes: ['read', 'write'],
    rate_limit_per_minute: 1000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export default function DeveloperPage() {
  const [apps, setApps] = useState<DeveloperApp[]>(mockApps);
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [sandboxCode, setSandboxCode] = useState('{\n  "name": "Test Customer",\n  "email": "test@example.com"\n}');
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/v1/customers');
  const [sandboxMethod, setSandboxMethod] = useState('POST');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  function runSandbox() {
    setSandboxResult(null);
    setTimeout(() => {
      setSandboxResult(JSON.stringify({
        success: true,
        data: {
          id: 'cus_' + Math.random().toString(36).substring(2, 10),
          name: 'Test Customer',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        }
      }, null, 2));
    }, 500);
  }

  function createApp() {
    if (!newAppName.trim()) {
      toast.error('Please enter an app name');
      return;
    }
    const client_id = 'whos_app_' + Math.random().toString(36).substring(2, 12);
    const client_secret = 'whos_secret_' + Math.random().toString(36).substring(2, 20);
    const newApp: DeveloperApp = {
      app_id: Math.random().toString(36).substring(2, 10),
      name: newAppName,
      description: '',
      client_id,
      client_secret_hash: '••••••••••••••••',
      redirect_uris: [],
      scopes: ['read'],
      rate_limit_per_minute: 100,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setApps([...apps, newApp]);
    setCreatedSecret(client_secret);
    toast.success('App created successfully');
  }

  return (
    <AppShell>
      <PageHeader
        title="Developer Platform"
        description="API documentation, SDKs, sandbox, and app management"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create App
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New App</DialogTitle>
                <DialogDescription>Register a new application to access the API</DialogDescription>
              </DialogHeader>
              {createdSecret ? (
                <div className="py-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                    <p className="text-sm font-medium text-green-600 mb-2">App Created Successfully</p>
                    <p className="text-xs text-muted-foreground mb-3">Save this client secret. It won't be shown again.</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">{createdSecret}</code>
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdSecret)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => { setCreateDialogOpen(false); setCreatedSecret(null); setNewAppName(''); }}>
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div>
                    <Label>App Name</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., My Production App"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={createApp}>Create App</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Registered Apps', value: apps.length, icon: Package },
          { label: 'API Endpoints', value: apiEndpoints.length, icon: Globe },
          { label: 'SDKs', value: '3', icon: Code },
          { label: 'API Version', value: 'v1.0', icon: Layers },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="docs" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="docs" className="rounded-lg gap-1.5">
            <BookOpen className="h-4 w-4" />
            API Docs
          </TabsTrigger>
          <TabsTrigger value="sdks" className="rounded-lg gap-1.5">
            <Code className="h-4 w-4" />
            SDKs
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="rounded-lg gap-1.5">
            <Play className="h-4 w-4" />
            Sandbox
          </TabsTrigger>
          <TabsTrigger value="apps" className="rounded-lg gap-1.5">
            <Key className="h-4 w-4" />
            My Apps
          </TabsTrigger>
        </TabsList>

        {/* API Docs */}
        <TabsContent value="docs" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">REST API Reference</CardTitle>
              <CardDescription>Complete list of available API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Auth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiEndpoints.map((endpoint, i) => (
                    <motion.tr
                      key={`${endpoint.method}-${endpoint.path}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-muted/30 transition-colors"
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
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{endpoint.auth}</Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SDKs */}
        <TabsContent value="sdks" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">JavaScript / TypeScript</CardTitle>
                    <CardDescription>Node.js and browser SDK</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => copyToClipboard(sdkExamples.javascript)}>
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-sm overflow-x-auto">
                  <code>{sdkExamples.javascript}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Python</CardTitle>
                    <CardDescription>Python SDK for server-side apps</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => copyToClipboard(sdkExamples.python)}>
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-sm overflow-x-auto">
                  <code>{sdkExamples.python}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">cURL</CardTitle>
                    <CardDescription>Raw HTTP requests for any environment</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => copyToClipboard(sdkExamples.curl)}>
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-sm overflow-x-auto">
                  <code>{sdkExamples.curl}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sandbox */}
        <TabsContent value="sandbox" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                API Sandbox
              </CardTitle>
              <CardDescription>Test API requests in a safe environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Method</Label>
                      <Select value={sandboxMethod} onValueChange={setSandboxMethod}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Endpoint</Label>
                      <Input
                        className="mt-1.5 font-mono"
                        value={sandboxEndpoint}
                        onChange={(e) => setSandboxEndpoint(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Request Body (JSON)</Label>
                    <Textarea
                      className="mt-1.5 font-mono text-sm"
                      rows={6}
                      value={sandboxCode}
                      onChange={(e) => setSandboxCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={runSandbox} className="gap-2">
                    <Play className="h-4 w-4" />
                    Run Request
                  </Button>
                </div>
                <div>
                  <Label>Response</Label>
                  <div className="mt-1.5 p-4 rounded-xl bg-muted min-h-[200px]">
                    {sandboxResult ? (
                      <pre className="text-sm overflow-x-auto">{sandboxResult}</pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">Run a request to see the response</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Apps */}
        <TabsContent value="apps" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {apps.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No apps registered</p>
                  <Button variant="outline" className="mt-4 gap-2" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create your first app
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.app_id} className="group">
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{app.client_id}</code>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(app.client_id)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {app.scopes.map((scope) => (
                              <Badge key={scope} variant="outline" className="text-[10px]">{scope}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{app.rate_limit_per_minute}/min</TableCell>
                        <TableCell>
                          <Badge className={cn(app.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600')}>
                            {app.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
