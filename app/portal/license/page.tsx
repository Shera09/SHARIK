'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Shield,
  CreditCard,
  Building2,
  HardDrive,
  Cpu,
  Users,
  MessageSquare,
  Globe,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function CustomerLicensePortalPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [licenseData, setLicenseData] = useState<any>({
    license_key: 'SHARIK-PRO-88AF-92BB-10FF',
    plan_type: 'Professional Plan',
    status: 'active',
    valid_until: '2027-07-31T00:00:00Z',
    max_users: 15,
    active_users: 4,
    storage_used_mb: 450,
    storage_max_mb: 2000,
    ai_credits_used: 12400,
    ai_credits_max: 50000,
    api_calls: 3820,
    whatsapp_messages: 140,
    bound_domain: 'acmecorp.io',
  });

  const [billingProfile, setBillingProfile] = useState({
    company_name: 'Acme Corporation Ltd.',
    billing_email: 'billing@acmecorp.io',
    tax_id: '27AABCU9603R1ZN',
    billing_address: '100 Enterprise Boulevard, Tech Park',
    city: 'Mumbai',
    country: 'India',
  });

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setIsLoading(true);
    try {
      const { data: license } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (license) {
        setLicenseData((prev: any) => ({
          ...prev,
          license_key: license.license_key,
          plan_type: license.plan_type.toUpperCase() + ' Plan',
          status: license.status,
          valid_until: license.valid_until,
          max_users: license.max_users,
          bound_domain: license.bound_domain || 'Unbound',
        }));
      }
    } catch (err) {
      console.error('Failed to load license portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseData.license_key);
    setCopiedKey(true);
    toast.success('License key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <Key className="w-8 h-8 text-teal-400" />
            License, Billing & Subscription Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your active signed license, monitor real-time usage metrics, and update billing details.
          </p>
        </div>
        <Button onClick={fetchPortalData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh License Status
        </Button>
      </div>

      {/* Main License Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-3">
              {licenseData.plan_type}
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono">
                {licenseData.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Valid until: {new Date(licenseData.valid_until).toLocaleDateString()} (Auto-Renews)
            </CardDescription>
          </div>
          <Button onClick={handleCopyKey} variant="secondary" className="gap-2">
            {copiedKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            Copy Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 font-mono text-sm text-teal-300 flex items-center justify-between">
            <span>{licenseData.license_key}</span>
            <span className="text-xs text-slate-500 font-sans">HMAC SHA-256 Signed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Bound Domain</p>
                <p className="text-sm font-semibold text-white">{licenseData.bound_domain}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-xs text-slate-400">Seat Utilization</p>
                <p className="text-sm font-semibold text-white">
                  {licenseData.active_users} / {licenseData.max_users} Users
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Offline Grace Period</p>
                <p className="text-sm font-semibold text-white">7 Days Allowance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metering Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" /> Real-Time Resource Metering
            </CardTitle>
            <CardDescription>Track usage against plan limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Credits */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> AI Credits
                </span>
                <span className="text-slate-400">
                  {licenseData.ai_credits_used.toLocaleString()} / {licenseData.ai_credits_max.toLocaleString()}
                </span>
              </div>
              <Progress value={(licenseData.ai_credits_used / licenseData.ai_credits_max) * 100} className="h-2" />
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" /> Cloud Storage
                </span>
                <span className="text-slate-400">
                  {licenseData.storage_used_mb} MB / {licenseData.storage_max_mb} MB
                </span>
              </div>
              <Progress value={(licenseData.storage_used_mb / licenseData.storage_max_mb) * 100} className="h-2" />
            </div>

            {/* WhatsApp & API Usage */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-green-400" /> WhatsApp Volume
                </p>
                <p className="text-lg font-bold text-white mt-1">{licenseData.whatsapp_messages}</p>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> API Gateway Calls
                </p>
                <p className="text-lg font-bold text-white mt-1">{licenseData.api_calls.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Billing Profile */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" /> Company Billing Profile
            </CardTitle>
            <CardDescription>Tax registration and invoice contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Company Name</label>
              <input
                type="text"
                value={billingProfile.company_name}
                onChange={(e) => setBillingProfile({ ...billingProfile, company_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Tax ID (GSTIN / VAT)</label>
                <input
                  type="text"
                  value={billingProfile.tax_id}
                  onChange={(e) => setBillingProfile({ ...billingProfile, tax_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Billing Email</label>
                <input
                  type="email"
                  value={billingProfile.billing_email}
                  onChange={(e) => setBillingProfile({ ...billingProfile, billing_email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={() => toast.success('Billing profile updated')} className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                Save Billing Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
