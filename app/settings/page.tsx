'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Palette,
  Bell,
  Globe,
  Shield,
  Database,
  CreditCard,
  FileText,
  ChevronRight,
  Check,
  Save,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { companySettingsSchema } from '@/lib/validations';
import { useEffect, useCallback } from 'react';

type SettingSection = {
  id: string;
  label: string;
  icon: typeof Building2;
  description: string;
};

const sections: SettingSection[] = [
  { id: 'company', label: 'Company', icon: Building2, description: 'Business details and branding' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
  { id: 'regional', label: 'Regional', icon: Globe, description: 'Language, currency and timezone' },
  { id: 'billing', label: 'Billing & GST', icon: CreditCard, description: 'Tax and invoice settings' },
  { id: 'data', label: 'Data & Export', icon: Database, description: 'Backup and export options' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and access control' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('company');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accentColor, setAccentColor] = useState('Teal');

  const [company, setCompany] = useState({
    name: 'WebHoster Solutions',
    tagline: 'Your Growth Partner',
    email: 'hello@webhoster.in',
    phone: '+91 98765 43210',
    website: 'https://webhoster.in',
    address: '123 Business Park, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    gstin: '27AABCW1234F1ZN',
  });

  const [regional, setRegional] = useState({
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
    language: 'en-IN',
    fiscalYearStart: 'April',
  });

  const [billing, setBilling] = useState({
    defaultGST: '18',
    invoicePrefix: 'INV',
    quotationPrefix: 'QT',
    invoiceTerms: 'Payment is due within 30 days of invoice date.',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    newLead: true,
    paymentReceived: true,
    invoiceOverdue: true,
    taskDue: true,
    emailDigest: false,
    whatsappAlerts: false,
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('organization_settings').select('*');
    if (!error && data && data.length > 0) {
      data.forEach((item) => {
        if (item.setting_key === 'company' && item.setting_value) setCompany((prev) => ({ ...prev, ...item.setting_value }));
        if (item.setting_key === 'regional' && item.setting_value) setRegional((prev) => ({ ...prev, ...item.setting_value }));
        if (item.setting_key === 'billing' && item.setting_value) setBilling((prev) => ({ ...prev, ...item.setting_value }));
        if (item.setting_key === 'notifications' && item.setting_value) setNotifPrefs((prev) => ({ ...prev, ...item.setting_value }));
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const save = async () => {
    if (activeSection === 'company') {
      const validation = companySettingsSchema.safeParse(company);
      if (!validation.success) {
        const firstError = validation.error.errors[0]?.message || 'Invalid company details';
        toast.error(firstError);
        return;
      }
    }

    setSaving(true);
    try {
      await supabase.from('organization_settings').upsert({ setting_key: 'company', setting_value: company as Record<string, any> }, { onConflict: 'organization_id,setting_key' });
      await supabase.from('organization_settings').upsert({ setting_key: 'regional', setting_value: regional as Record<string, any> }, { onConflict: 'organization_id,setting_key' });
      await supabase.from('organization_settings').upsert({ setting_key: 'billing', setting_value: billing as Record<string, any> }, { onConflict: 'organization_id,setting_key' });
      await supabase.from('organization_settings').upsert({ setting_key: 'notifications', setting_value: notifPrefs as Record<string, any> }, { onConflict: 'organization_id,setting_key' });

      toast.success('Settings saved to database');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    }
    setSaving(false);
  };

  const accentColors = [
    { name: 'Blue', color: 'hsl(221 83% 53%)' },
    { name: 'Teal', color: 'hsl(174 72% 40%)' },
    { name: 'Green', color: 'hsl(142 71% 40%)' },
    { name: 'Orange', color: 'hsl(25 95% 50%)' },
    { name: 'Red', color: 'hsl(0 84% 55%)' },
  ];

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Configure your business OS preferences"
        action={
          <Button onClick={save} disabled={saving} className="gap-2 rounded-xl">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <div className="lg:col-span-1">
          <nav className="glass-card overflow-hidden premium-shadow">
            {sections.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-border/40 px-4 py-3.5 text-left transition-colors last:border-b-0',
                    isActive ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-muted/40'
                  )}
                >
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', isActive ? 'bg-primary/10' : 'bg-muted/50')}>
                    <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', isActive && 'text-primary')}>{s.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-6 premium-shadow"
          >
            <div className="mb-6 border-b border-border pb-4">
              <h2 className="font-display text-lg font-semibold">{currentSection?.label}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{currentSection?.description}</p>
            </div>

            {/* Company */}
            {activeSection === 'company' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tagline</Label>
                    <Input value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>City</Label>
                    <Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>State</Label>
                    <Input value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Pincode</Label>
                    <Input value={company.pincode} onChange={(e) => setCompany({ ...company, pincode: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>GSTIN</Label>
                  <Input value={company.gstin} onChange={(e) => setCompany({ ...company, gstin: e.target.value })} placeholder="27AABCW1234F1ZN" />
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="mb-3 text-xs text-muted-foreground">Choose how the app looks</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                            theme === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/30'
                          )}
                        >
                          <Icon className={cn('h-5 w-5', theme === t.value ? 'text-primary' : 'text-muted-foreground')} />
                          <span className={cn('text-sm font-medium', theme === t.value ? 'text-primary' : '')}>{t.label}</span>
                          {theme === t.value && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Accent Color</Label>
                  <p className="text-xs text-muted-foreground">Primary color used across the UI</p>
                  <div className="flex gap-3">
                    {accentColors.map((c) => (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => setAccentColor(c.name)}
                        className={cn(
                          'group relative h-9 w-9 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110',
                          accentColor === c.name ? 'ring-primary' : 'ring-border'
                        )}
                      >
                        <span className="block h-full w-full rounded-full" style={{ background: c.color }} />
                        {accentColor === c.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-sm" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Animations</p>
                    <p className="text-xs text-muted-foreground">Enable micro-interactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose which events trigger notifications.</p>
                {[
                  { key: 'newLead' as const, label: 'New Lead Added', desc: 'When a new lead is created' },
                  { key: 'paymentReceived' as const, label: 'Payment Received', desc: 'When a payment is recorded' },
                  { key: 'invoiceOverdue' as const, label: 'Invoice Overdue', desc: 'When an invoice passes its due date' },
                  { key: 'taskDue' as const, label: 'Task Due Today', desc: 'Daily reminder for tasks due today' },
                  { key: 'emailDigest' as const, label: 'Daily Email Digest', desc: 'Morning summary of activity' },
                  { key: 'whatsappAlerts' as const, label: 'WhatsApp Alerts', desc: 'Receive alerts via WhatsApp' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[pref.key]}
                      onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, [pref.key]: v })}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Regional */}
            {activeSection === 'regional' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Currency</Label>
                    <Select value={regional.currency} onValueChange={(v) => setRegional({ ...regional, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                        <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Date Format</Label>
                    <Select value={regional.dateFormat} onValueChange={(v) => setRegional({ ...regional, dateFormat: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Timezone</Label>
                    <Select value={regional.timezone} onValueChange={(v) => setRegional({ ...regional, timezone: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST +4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fiscal Year Start</Label>
                    <Select value={regional.fiscalYearStart} onValueChange={(v) => setRegional({ ...regional, fiscalYearStart: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="April">April (India)</SelectItem>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select value={regional.language} onValueChange={(v) => setRegional({ ...regional, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="hi-IN">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Billing & GST */}
            {activeSection === 'billing' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Default GST Rate</Label>
                    <Select value={billing.defaultGST} onValueChange={(v) => setBilling({ ...billing, defaultGST: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Invoice Prefix</Label>
                    <Input value={billing.invoicePrefix} onChange={(e) => setBilling({ ...billing, invoicePrefix: e.target.value })} placeholder="INV" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Quotation Prefix</Label>
                    <Input value={billing.quotationPrefix} onChange={(e) => setBilling({ ...billing, quotationPrefix: e.target.value })} placeholder="QT" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Default Payment Terms</Label>
                  <Textarea value={billing.invoiceTerms} onChange={(e) => setBilling({ ...billing, invoiceTerms: e.target.value })} rows={3} />
                </div>
                <Separator />
                <p className="text-sm font-semibold">Bank Details (shown on invoices)</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Bank Name</Label>
                    <Input value={billing.bankName} onChange={(e) => setBilling({ ...billing, bankName: e.target.value })} placeholder="HDFC Bank" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Account Number</Label>
                    <Input value={billing.accountNumber} onChange={(e) => setBilling({ ...billing, accountNumber: e.target.value })} placeholder="XXXX XXXX XXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>IFSC Code</Label>
                    <Input value={billing.ifscCode} onChange={(e) => setBilling({ ...billing, ifscCode: e.target.value })} placeholder="HDFC0001234" />
                  </div>
                  <div className="grid gap-2">
                    <Label>UPI ID</Label>
                    <Input value={billing.upiId} onChange={(e) => setBilling({ ...billing, upiId: e.target.value })} placeholder="business@upi" />
                  </div>
                </div>
              </div>
            )}

            {/* Data & Export */}
            {activeSection === 'data' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Export your business data for backup or migration.</p>
                {[
                  { label: 'Export Customers', desc: 'Download all customer records as CSV', icon: FileText },
                  { label: 'Export Invoices', desc: 'Download all invoices as CSV', icon: FileText },
                  { label: 'Export Leads', desc: 'Download all leads and pipeline data', icon: FileText },
                  { label: 'Export Payments', desc: 'Download payment history as CSV', icon: CreditCard },
                  { label: 'Full Database Backup', desc: 'Download complete backup (JSON)', icon: Database },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.info('Export feature coming soon')}>
                      Export
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Secure your account with 2FA</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">Coming soon</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium">Session Management</p>
                      <p className="text-xs text-muted-foreground">View and revoke active sessions</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">Coming soon</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium">Audit Log</p>
                      <p className="text-xs text-muted-foreground">Track all changes made in the app</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">Coming soon</Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Change Password</Label>
                  <Input type="password" placeholder="Current password" />
                </div>
                <div className="grid gap-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="New password" />
                </div>
                <div className="grid gap-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => toast.info('Password change coming soon')}>
                  Update Password
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
