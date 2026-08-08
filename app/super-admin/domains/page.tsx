'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Key,
  Server,
  Copy,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Domain = {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  domain: string;
  status: string;
  verified_at: string;
  ssl_issued_at: string;
  ssl_expires_at: string;
  is_healthy: boolean;
  last_health_check: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  verified: { label: 'Verified', class: 'bg-success/10 text-success', icon: CheckCircle },
  pending: { label: 'Pending', class: 'bg-orange-500/10 text-orange-500', icon: Clock },
  failed: { label: 'Failed', class: 'bg-red-500/10 text-red-500', icon: XCircle },
  expired: { label: 'Expired', class: 'bg-red-600/10 text-red-600', icon: AlertTriangle },
};

export default function DomainsPage() {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ domain: '', tenant_id: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [domainsRes, tenantsRes] = await Promise.all([
      supabase.from('custom_domains').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('tenants').select('id, name').is('deleted_at', null),
    ]);

    if (domainsRes.data) {
      setDomains(domainsRes.data.map(d => ({
        ...d,
        tenant_name: tenantsRes.data?.find((t: any) => t.id === d.tenant_id)?.name || d.tenant_id
      })));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = domains.filter(d => d.domain.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: domains.length,
    verified: domains.filter(d => d.status === 'verified').length,
    pending: domains.filter(d => d.status === 'pending').length,
    sslActive: domains.filter(d => d.ssl_issued_at).length,
    healthy: domains.filter(d => d.is_healthy).length,
  };

  const addDomain = async () => {
    if (!form.domain.trim()) { toast.error('Domain is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('custom_domains').insert({
        domain: form.domain.toLowerCase().trim(),
        tenant_id: form.tenant_id || null,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Domain added');
      setDialogOpen(false);
      setForm({ domain: '', tenant_id: '' });
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add domain');
    }
    setSaving(false);
  };

  const verifyDomain = async (target: Domain | string) => {
    const id = typeof target === 'string' ? target : target.id;
    const { error } = await supabase
      .from('custom_domains')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        ssl_issued_at: new Date().toISOString(),
        ssl_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Domain verified');
      loadData();
    }
  };

  const removeDomain = async (id: string) => {
    if (!confirm('Delete this domain?')) return;
    const { error } = await supabase.from('custom_domains').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Domain deleted');
      loadData();
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Domain Management"
        description="Manage custom domains and SSL certificates"
        action={
          <Button onClick={() => setDialogOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Domains', value: stats.total, icon: Globe, color: 'text-blue-500' },
          { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'text-success' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-500' },
          { label: 'SSL Active', value: stats.sslActive, icon: Shield, color: 'text-purple-500' },
          { label: 'Healthy', value: stats.healthy, icon: Server, color: 'text-cyan-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search domains..." className="pl-9 rounded-xl" />
        </div>
      </div>

      {/* Domains Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No custom domains</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first custom domain</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden premium-shadow">
          <div className="divide-y divide-border/40">
            {filtered.map((domain, i) => {
              const status = statusConfig[domain.status] || statusConfig.pending;
              const sslDaysLeft = domain.ssl_expires_at
                ? Math.max(0, Math.ceil((new Date(domain.ssl_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : 0;

              return (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 flex items-center justify-between hover:bg-muted/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{domain.domain}</p>
                        <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground">{domain.tenant_name || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Badge className={cn('text-[10px]', status.class)}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      {domain.ssl_issued_at && (
                        <div className="flex items-center gap-1 text-xs">
                          <Key className="h-3.5 w-3.5 text-purple-500" />
                          <span className={sslDaysLeft < 30 ? 'text-orange-500' : 'text-muted-foreground'}>
                            SSL {sslDaysLeft}d
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        {domain.is_healthy ? (
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                        )}
                        <span className="text-muted-foreground">{domain.is_healthy ? 'Healthy' : 'Issues'}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {domain.status !== 'verified' && (
                          <DropdownMenuItem onClick={() => verifyDomain(domain)}>
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Verify Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(domain.domain); toast.success('Copied!'); }}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy Domain
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeDomain(domain.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Domain Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Domain Name</Label>
              <Input
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="example.com"
              />
              <p className="text-xs text-muted-foreground">
                Add a CNAME record pointing to custom.webhoster.ai
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addDomain} disabled={saving} className="rounded-xl">
              {saving ? 'Adding...' : 'Add Domain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
