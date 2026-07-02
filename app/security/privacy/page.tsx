'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Unlock,
  Database,
  Globe,
  Shield,
  Trash2,
  Download,
  Clock,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Save,
  Eye,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PrivacySettings {
  id: string;
  data_retention_days: number;
  audit_log_retention_days: number;
  ai_conversation_retention_days: number;
  document_retention_days: number;
  consent_required: boolean;
  ai_data_usage_allowed: boolean;
  ai_model_training_allowed: boolean;
  analytics_tracking_allowed: boolean;
  third_party_sharing_allowed: boolean;
  allow_data_export: boolean;
  allow_data_deletion: boolean;
  allow_data_correction: boolean;
  deletion_requires_approval: boolean;
  allow_cross_border_transfer: boolean;
}

interface DataSubjectRequest {
  id: string;
  request_number: string;
  request_type: string;
  requester_name: string;
  requester_email: string;
  status: string;
  requested_at: string;
  deadline: string;
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [settingsData, requestsData] = await Promise.all([
        supabase.from('privacy_settings').select('*').limit(1).single(),
        supabase.from('data_subject_requests').select('*').order('requested_at', { ascending: false }).limit(10),
      ]);

      if (settingsData.data) {
        setSettings(settingsData.data);
      }
      setRequests(requestsData.data || []);
    } catch (error) {
      console.error('Error loading privacy data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      await supabase.from('privacy_settings').upsert(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }

  const updateSetting = (key: keyof PrivacySettings, value: boolean | number) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const requestStats = {
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    overdue: requests.filter(r => r.status !== 'completed' && new Date(r.deadline) < new Date()).length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Privacy Controls"
        description="Manage data retention, subject rights, and privacy policies"
        action={
          <Button onClick={saveSettings} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Data Retention</p>
              <p className="mt-1 text-2xl font-bold">{settings?.data_retention_days || 365}d</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="mt-1 text-2xl font-bold">{requestStats.pending}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <FileCheck className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue Requests</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{requestStats.overdue}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Consent Required</p>
              <p className="mt-1 text-2xl font-bold">{settings?.consent_required ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Data Retention Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Data Retention</CardTitle>
                  <CardDescription>Configure how long data is kept</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data-retention">General Data Retention (days)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={settings?.data_retention_days || 365}
                    onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                  <Input
                    id="audit-retention"
                    type="number"
                    value={settings?.audit_log_retention_days || 2555}
                    onChange={(e) => updateSetting('audit_log_retention_days', parseInt(e.target.value))}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">7 years recommended for compliance</p>
                </div>

                <div>
                  <Label htmlFor="ai-retention">AI Conversation Retention (days)</Label>
                  <Input
                    id="ai-retention"
                    type="number"
                    value={settings?.ai_conversation_retention_days || 90}
                    onChange={(e) => updateSetting('ai_conversation_retention_days', parseInt(e.target.value))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="document-retention">Document Retention (days)</Label>
                  <Input
                    id="document-retention"
                    type="number"
                    value={settings?.document_retention_days || 2555}
                    onChange={(e) => updateSetting('document_retention_days', parseInt(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Data Usage */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle>AI Data Usage</CardTitle>
                  <CardDescription>Control how AI systems use data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Data Usage Allowed</p>
                    <p className="text-sm text-muted-foreground">Allow AI to process user data</p>
                  </div>
                  <Switch
                    checked={settings?.ai_data_usage_allowed || false}
                    onCheckedChange={(checked) => updateSetting('ai_data_usage_allowed', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Model Training</p>
                    <p className="text-sm text-muted-foreground">Use data for model improvements</p>
                  </div>
                  <Switch
                    checked={settings?.ai_model_training_allowed || false}
                    onCheckedChange={(checked) => updateSetting('ai_model_training_allowed', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics Tracking</p>
                    <p className="text-sm text-muted-foreground">Collect usage analytics</p>
                  </div>
                  <Switch
                    checked={settings?.analytics_tracking_allowed || false}
                    onCheckedChange={(checked) => updateSetting('analytics_tracking_allowed', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Third-Party Sharing</p>
                    <p className="text-sm text-muted-foreground">Share data with external services</p>
                  </div>
                  <Switch
                    checked={settings?.third_party_sharing_allowed || false}
                    onCheckedChange={(checked) => updateSetting('third_party_sharing_allowed', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Subject Rights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Download className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Data Subject Rights</CardTitle>
                  <CardDescription>Configure user privacy rights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Data Export</p>
                    <p className="text-sm text-muted-foreground">Users can export their data</p>
                  </div>
                  <Switch
                    checked={settings?.allow_data_export || false}
                    onCheckedChange={(checked) => updateSetting('allow_data_export', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Data Deletion</p>
                    <p className="text-sm text-muted-foreground">Users can request deletion</p>
                  </div>
                  <Switch
                    checked={settings?.allow_data_deletion || false}
                    onCheckedChange={(checked) => updateSetting('allow_data_deletion', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Data Correction</p>
                    <p className="text-sm text-muted-foreground">Users can correct their data</p>
                  </div>
                  <Switch
                    checked={settings?.allow_data_correction || false}
                    onCheckedChange={(checked) => updateSetting('allow_data_correction', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Deletion Requires Approval</p>
                    <p className="text-sm text-muted-foreground">Manual approval for deletions</p>
                  </div>
                  <Switch
                    checked={settings?.deletion_requires_approval || false}
                    onCheckedChange={(checked) => updateSetting('deletion_requires_approval', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cross-Border Transfer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                  <Globe className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Data Transfer Controls</CardTitle>
                  <CardDescription>Manage cross-border data flows</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Cross-Border Transfer</p>
                  <p className="text-sm text-muted-foreground">Transfer data internationally</p>
                </div>
                <Switch
                  checked={settings?.allow_cross_border_transfer || false}
                  onCheckedChange={(checked) => updateSetting('allow_cross_border_transfer', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Consent Required</p>
                  <p className="text-sm text-muted-foreground">Require consent for data processing</p>
                </div>
                <Switch
                  checked={settings?.consent_required || false}
                  onCheckedChange={(checked) => updateSetting('consent_required', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Data Subject Requests */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Eye className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <CardTitle>Data Subject Requests</CardTitle>
                  <CardDescription>Manage privacy requests from users</CardDescription>
                </div>
              </div>
              <Badge variant="outline">{requests.length} requests</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((request, i) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {request.request_type === 'deletion' ? (
                          <Trash2 className="h-5 w-5 text-red-500" />
                        ) : request.request_type === 'access' ? (
                          <Download className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileCheck className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{request.request_type} Request</p>
                        <p className="text-sm text-muted-foreground">{request.requester_name} ({request.requester_email})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(
                        request.status === 'pending' && 'bg-yellow-500/10 text-yellow-600',
                        request.status === 'processing' && 'bg-blue-500/10 text-blue-600',
                        request.status === 'completed' && 'bg-green-500/10 text-green-600',
                      )}>
                        {request.status}
                      </Badge>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}
