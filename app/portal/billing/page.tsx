'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Download,
  ArrowUpRight,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CustomerBillingPortalPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState('Professional Plan');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { id: 'pm_1', brand: 'Visa', last4: '4242', exp_month: 12, exp_year: 2028, is_default: true },
    { id: 'pm_2', brand: 'Mastercard', last4: '8888', exp_month: 8, exp_year: 2027, is_default: false },
  ]);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const { data: invList } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invList && invList.length > 0) {
        setInvoices(invList);
      } else {
        // Fallback demo data
        setInvoices([
          { invoice_number: 'INV-202607-1042', total_amount: 4999, currency: 'INR', status: 'paid', created_at: '2026-07-01T10:00:00Z', pdf_url: '#' },
          { invoice_number: 'INV-202606-9812', total_amount: 4999, currency: 'INR', status: 'paid', created_at: '2026-06-01T10:00:00Z', pdf_url: '#' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load billing portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateCheckout = async (provider: 'stripe' | 'razorpay') => {
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          provider,
          amount: 4999,
          currency: provider === 'stripe' ? 'USD' : 'INR',
          plan_type: 'professional',
          billing_cycle: 'monthly',
        }),
      });

      const data = await res.json();
      if (data.checkout?.checkout_url) {
        toast.success(`Redirecting to ${provider.toUpperCase()} Checkout...`);
        window.location.href = data.checkout.checkout_url;
      } else {
        toast.error('Failed to launch checkout session');
      }
    } catch {
      toast.error('Network error creating checkout');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-teal-400" />
            Customer Payment & Billing Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your subscription plan, saved payment methods, and download invoice tax receipts.
          </p>
        </div>
        <Button onClick={loadBillingData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Portal
        </Button>
      </div>

      {/* Subscription Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-3">
              {activePlan}
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ACTIVE SUBSCRIPTION</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Billed ₹4,999 / month • Auto-renews on August 31, 2026
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleInitiateCheckout('razorpay')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              Pay via Razorpay
            </Button>
            <Button onClick={() => handleInitiateCheckout('stripe')} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              Pay via Stripe
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grid: Payment Methods & Invoice History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Payment Methods */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-400" /> Saved Payment Methods
            </CardTitle>
            <CardDescription>PCI-compliant tokenized payment options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {pm.brand} •••• {pm.last4}
                    </p>
                    <p className="text-xs text-slate-400">Expires {pm.exp_month}/{pm.exp_year}</p>
                  </div>
                </div>
                {pm.is_default && <Badge variant="outline" className="text-[10px] border-teal-500/40 text-teal-400">Default</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoice & Tax Receipts History */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> Invoice & Receipt History
            </CardTitle>
            <CardDescription>Download tax invoices with 18% GST / VAT breakdowns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="font-mono text-teal-300 font-semibold">{inv.invoice_number}</p>
                  <p className="text-slate-400 mt-0.5">
                    {new Date(inv.created_at).toLocaleDateString()} • {inv.currency} {inv.total_amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase">{inv.status}</Badge>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => toast.success(`Downloading PDF for ${inv.invoice_number}`)}>
                    <Download className="w-3.5 h-3.5" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
