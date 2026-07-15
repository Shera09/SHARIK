'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Key,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
  Globe,
  Database,
  Zap,
  DollarSign,
  MessageSquare,
  FileText,
  Users,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Secret {
  secret_id: string;
  name: string;
  connector_type: string | null;
  key_name: string;
  description: string | null;
  rotated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface SecretActivity {
  id: string;
  action: string;
  secret_name: string;
  actor: string;
  timestamp: string;
}

const secretCategories = [
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth', label: 'OAuth Token' },
  { value: 'database', label: 'Database' },
  { value: 'encryption', label: 'Encryption Key' },
  { value: 'webhook', label: 'Webhook Secret' },
  { value: 'other', label: 'Other' },
];

// Mock secrets for demo
const mockSecrets: Secret[] = [
  { secret_id: '1', name: 'OpenAI API Key', connector_type: 'ai', key_name: 'OPENAI_API_KEY', description: 'GPT-4 API access', rotated_at: new Date(Date.now() - 86400000 * 30).toISOString(), expires_at: null, created_at: new Date(Date.now() - 86400000 * 60).toISOString() },
  { secret_id: '2', name: 'Razorpay Key ID', connector_type: 'payment', key_name: 'RAZORPAY_KEY_ID', description: 'Razorpay payment gateway', rotated_at: new Date(Date.now() - 86400000 * 7).toISOString(), expires_at: null, created_at: new Date(Date.now() - 86400000 * 90).toISOString() },
  { secret_id: '3', name: 'Razorpay Secret', connector_type: 'payment', key_name: 'RAZORPAY_SECRET', description: 'Razorpay secret key', rotated_at: new Date(Date.now() - 86400000 * 7).toISOString(), expires_at: null, created_at: new Date(Date.now() - 86400000 * 90).toISOString() },
  { secret_id: '4', name: 'WhatsApp Token', connector_type: 'communication', key_name: 'WHATSAPP_TOKEN', description: 'WhatsApp Business API token', rotated_at: new Date(Date.now() - 86400000 * 14).toISOString(), expires_at: new Date(Date.now() + 86400000 * 60).toISOString(), created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
  { secret_id: '5', name: 'Database URL', connector_type: 'database', key_name: 'DATABASE_URL', description: 'PostgreSQL connection string', rotated_at: null, expires_at: null, created_at: new Date(Date.now() - 86400000 * 120).toISOString() },
];

const mockActivity: SecretActivity[] = [
  { id: '1', action: 'rotated', secret_name: 'Razorpay Secret', actor: 'System', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '2', action: 'accessed', secret_name: 'OpenAI API Key', actor: 'AI Service', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', action: 'created', secret_name: 'WhatsApp Token', actor: 'admin@webhoster.ai', timestamp: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: '4', action: 'rotated', secret_name: 'OpenAI API Key', actor: 'admin@webhoster.ai', timestamp: new Date(Date.now() - 86400000 * 30).toISOString() },
];

const connectorTypeIcons: Record<string, typeof Key> = {
  ai: Zap,
  payment: DollarSign,
  communication: MessageSquare,
  database: Database,
  document: FileText,
  identity: Users,
};

const actionColors: Record<string, string> = {
  created: 'bg-green-500/10 text-green-600',
  rotated: 'bg-blue-500/10 text-blue-600',
  accessed: 'bg-purple-500/10 text-purple-600',
  deleted: 'bg-red-500/10 text-red-600',
};

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>(mockSecrets);
  const [activity, setActivity] = useState<SecretActivity[]>(mockActivity);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSecret, setNewSecret] = useState({ name: '', key_name: '', value: '', category: '', description: '' });
  const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>({});

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  function createSecret() {
    if (!newSecret.name || !newSecret.key_name || !newSecret.value) {
      toast.error('Please fill in all required fields');
      return;
    }
    const secret: Secret = {
      secret_id: Math.random().toString(36).substring(2, 10),
      name: newSecret.name,
      connector_type: newSecret.category || null,
      key_name: newSecret.key_name,
      description: newSecret.description || null,
      rotated_at: null,
      expires_at: null,
      created_at: new Date().toISOString(),
    };
    setSecrets([...secrets, secret]);
    setCreateDialogOpen(false);
    setNewSecret({ name: '', key_name: '', value: '', category: '', description: '' });
    toast.success('Secret created successfully');
  }

  function rotateSecret(secretId: string) {
    setSecrets(secrets.map(s =>
      s.secret_id === secretId ? { ...s, rotated_at: new Date().toISOString() } : s
    ));
    toast.success('Secret rotated successfully');
  }

  function deleteSecret(secretId: string) {
    setSecrets(secrets.filter(s => s.secret_id !== secretId));
    toast.success('Secret deleted');
  }

  const expiringSecrets = secrets.filter(s => s.expires_at && new Date(s.expires_at) < new Date(Date.now() + 7 * 86400000));

  return (
    <AppShell>
      <PageHeader
        title="Secrets Management"
        description="Secure vault for API keys, tokens, and sensitive credentials"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Secret
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Secret</DialogTitle>
                <DialogDescription>Store a new credential securely in the vault</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Secret Name</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Stripe API Key"
                      value={newSecret.name}
                      onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Environment Variable</Label>
                    <Input
                      className="mt-1.5 font-mono"
                      placeholder="e.g., STRIPE_API_KEY"
                      value={newSecret.key_name}
                      onChange={(e) => setNewSecret({ ...newSecret, key_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Secret Value</Label>
                  <Textarea
                    className="mt-1.5 font-mono text-sm"
                    placeholder="Enter the secret value..."
                    rows={3}
                    value={newSecret.value}
                    onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newSecret.category} onValueChange={(v) => setNewSecret({ ...newSecret, category: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {secretCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="What is this secret used for?"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={createSecret} className="gap-2">
                    <Lock className="h-4 w-4" />
                    Store Secret
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Secrets', value: secrets.length, icon: Key, color: 'text-blue-500' },
          { label: 'Encrypted', value: secrets.length, icon: Shield, color: 'text-green-500' },
          { label: 'Expiring Soon', value: expiringSecrets.length, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Last Rotation', value: '7 days ago', icon: Clock, color: 'text-purple-500' },
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

      {/* Expiring Alert */}
      {expiringSecrets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium">Secrets Expiring Soon</p>
              <p className="text-sm text-muted-foreground">
                {expiringSecrets.map(s => s.name).join(', ')} will expire within 7 days
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="secrets" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="secrets" className="rounded-lg gap-1.5">
            <Key className="h-4 w-4" />
            Secrets Vault
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Secrets Vault */}
        <TabsContent value="secrets" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Stored Secrets</CardTitle>
                  <CardDescription>All values are encrypted at rest and in transit</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search secrets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Rotated</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secrets
                    .filter(s =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.key_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((secret, i) => {
                      const Icon = connectorTypeIcons[secret.connector_type || ''] || Key;
                      return (
                        <motion.tr
                          key={secret.secret_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="group"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              {secret.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{secret.key_name}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {secret.connector_type || 'general'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {secret.rotated_at ? new Date(secret.rotated_at).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {secret.expires_at ? (
                              <span className={cn(
                                new Date(secret.expires_at) < new Date(Date.now() + 7 * 86400000) && 'text-orange-500'
                              )}>
                                {new Date(secret.expires_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => rotateSecret(secret.secret_id)}
                              >
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(`sk_${secret.key_name.toLowerCase()}_***`)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => deleteSecret(secret.secret_id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* Activity Log */}
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Secret Activity Log</CardTitle>
              <CardDescription>Audit trail of all secret operations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {activity.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={cn('text-[10px]', actionColors[entry.action])}>
                        {entry.action}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{entry.secret_name}</p>
                        <p className="text-xs text-muted-foreground">by {entry.actor}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
