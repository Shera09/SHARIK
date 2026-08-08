'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Shield,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Loader2,
  Ban,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminLicensesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [licensesList, setLicensesList] = useState<any[]>([]);

  const [stats, setStats] = useState({
    activeLicenses: 48,
    trialLicenses: 12,
    expiringSoon: 4,
    suspendedCount: 1,
    estimatedMRR: '₹4,85,000',
  });

  const [newLicenseForm, setNewLicenseForm] = useState({
    tenant_id: '00000000-0000-0000-0000-000000000000',
    plan_type: 'professional',
    billing_cycle: 'monthly',
    max_users: 10,
    max_devices: 15,
    bound_domain: 'client.corp',
    valid_days: 365,
  });

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setIsLoading(true);
    try {
      const { data: licenses } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (licenses && licenses.length > 0) {
        setLicensesList(licenses);
        const active = licenses.filter((l) => l.status === 'active').length;
        const trialing = licenses.filter((l) => l.status === 'trialing').length;
        const suspended = licenses.filter((l) => l.status === 'suspended' || l.status === 'revoked').length;

        setStats((prev) => ({
          ...prev,
          activeLicenses: active,
          trialLicenses: trialing,
          suspendedCount: suspended,
        }));
      }
    } catch (err) {
      console.error('Failed to load licenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLicense = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/licenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLicenseForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Issued License Key: ${data.license.license_key}`);
        loadLicenses();
      } else {
        toast.error(data.error || 'Failed to issue license');
      }
    } catch {
      toast.error('Network error during license issuance');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeLicense = async (licenseId: string, key: string) => {
    try {
      await supabase
        .from('licenses')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revocation_reason: 'Admin emergency revocation',
        })
        .eq('id', licenseId);

      await supabase.from('security_events').insert({
        event_type: 'license_revoked',
        severity: 'high',
        resource: 'admin/licenses',
        action: 'revoke_license',
        details: { license_key: key, timestamp: new Date().toISOString() },
      });

      toast.success(`License ${key} revoked`);
      loadLicenses();
    } catch {
      toast.error('Failed to revoke license');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <Key className="w-8 h-8 text-teal-400" />
            Licensing & Subscription Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue cryptographically signed license keys, monitor activations, manage MRR, and revoke compromised tokens.
          </p>
        </div>
        <Button onClick={loadLicenses} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Dashboard
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400" /> Active Licenses
            </CardDescription>
            <CardTitle className="text-2xl text-white">{stats.activeLicenses}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4 text-blue-400" /> Active Trials
            </CardDescription>
            <CardTitle className="text-2xl text-white">{stats.trialLicenses}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-slate-400">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Expiring Soon
            </CardDescription>
            <CardTitle className="text-2xl text-white">{stats.expiringSoon}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-slate-400">
              <Ban className="w-4 h-4 text-red-400" /> Revoked / Suspended
            </CardDescription>
            <CardTitle className="text-2xl text-white">{stats.suspendedCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-slate-400">
              <DollarSign className="w-4 h-4 text-teal-400" /> Monthly Recurring Revenue
            </CardDescription>
            <CardTitle className="text-2xl text-teal-400">{stats.estimatedMRR}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Grid: License Issuer & Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Issuance Modal/Form */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" /> Issue New Signed License
            </CardTitle>
            <CardDescription>Generate HMAC SHA-256 signed license key.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Plan Type</label>
              <select
                value={newLicenseForm.plan_type}
                onChange={(e) => setNewLicenseForm({ ...newLicenseForm, plan_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
              >
                <option value="starter">Starter Plan</option>
                <option value="professional">Professional Plan</option>
                <option value="business">Business Plan</option>
                <option value="enterprise">Enterprise Plan</option>
                <option value="trial">14-Day Trial</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Max Users</label>
                <input
                  type="number"
                  value={newLicenseForm.max_users}
                  onChange={(e) => setNewLicenseForm({ ...newLicenseForm, max_users: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Validity (Days)</label>
                <input
                  type="number"
                  value={newLicenseForm.valid_days}
                  onChange={(e) => setNewLicenseForm({ ...newLicenseForm, valid_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Bound Domain (Optional)</label>
              <input
                type="text"
                value={newLicenseForm.bound_domain}
                onChange={(e) => setNewLicenseForm({ ...newLicenseForm, bound_domain: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="client.com"
              />
            </div>

            <Button onClick={handleCreateLicense} disabled={isGenerating} className="bg-teal-600 hover:bg-teal-700 text-white w-full gap-2 pt-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Issue License Key
            </Button>
          </CardContent>
        </Card>

        {/* License Registry List */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" /> Issued License Registry
              </CardTitle>
              <CardDescription>Search and manage enterprise licenses.</CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {licensesList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active licenses recorded. Issue a new key above.</p>
            ) : (
              licensesList
                .filter((l) => !searchQuery || l.license_key.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((lic) => (
                  <div key={lic.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-teal-300 font-semibold">
                        {lic.license_key}
                        <Badge variant="outline" className="text-[10px] uppercase border-slate-700 text-slate-400">
                          {lic.plan_type}
                        </Badge>
                      </div>
                      <p className="text-slate-400 mt-1">
                        Domain: {lic.bound_domain || 'Unbound'} • Seats: {lic.max_users} • Expires: {new Date(lic.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                    {lic.status === 'revoked' ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">REVOKED</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeLicense(lic.id, lic.license_key)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
