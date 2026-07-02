'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Eye,
  Plus,
  Settings,
  Filter,
  Ban,
  Lock,
  FileWarning,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Guardrail = {
  id: string;
  name: string;
  guardrail_type: string;
  description: string;
  rules: any;
  severity: string;
  action: string;
  is_active: boolean;
  violations_count: number;
  created_at: string;
};

type SensitivePattern = {
  id: string;
  name: string;
  pattern_type: string;
  pattern_regex: string;
  category: string;
  action: string;
  replacement: string;
  is_active: boolean;
};

type Violation = {
  id: string;
  guardrail_id: string;
  violation_type: string;
  severity: string;
  action_taken: string;
  input_text: string;
  matched_pattern: string;
  created_at: string;
};

export default function AIGuardrailsPage() {
  const [loading, setLoading] = useState(true);
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [patterns, setPatterns] = useState<SensitivePattern[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [guardrailsRes, patternsRes] = await Promise.all([
      supabase.from('ai_guardrails').select('*').order('created_at', { ascending: false }),
      supabase.from('sensitive_data_patterns').select('*').order('name'),
    ]);
    if (guardrailsRes.data) setGuardrails(guardrailsRes.data);
    if (patternsRes.data) setPatterns(patternsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'block': return <Badge className="bg-red-500/20 text-red-500"><Ban className="h-3 w-3 mr-1" />Block</Badge>;
      case 'mask': return <Badge className="bg-yellow-500/20 text-yellow-600"><Lock className="h-3 w-3 mr-1" />Mask</Badge>;
      case 'require_approval': return <Badge className="bg-blue-500/20 text-blue-500"><AlertCircle className="h-3 w-3 mr-1" />Approval</Badge>;
      case 'warn': return <Badge className="bg-orange-500/20 text-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Warn</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const totalViolations = guardrails.reduce((acc, g) => acc + (g.violations_count || 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="AI Guardrails"
        description="Security filters, prompt injection detection, PII protection"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guardrail
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Guardrails', value: guardrails.filter(g => g.is_active).length, icon: Shield },
          { label: 'Patterns', value: patterns.filter(p => p.is_active).length, icon: Search },
          { label: 'Total Violations', value: totalViolations, icon: AlertTriangle },
          { label: 'Blocked Today', value: 12, icon: Ban },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="guardrails" className="space-y-6">
        <TabsList>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="patterns">Sensitive Patterns</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="guardrails">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Security Guardrails</h2>
              <Badge variant="outline">{guardrails.length} rules</Badge>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {guardrails.map((guardrail, i) => (
                  <motion.div
                    key={guardrail.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => { setSelectedItem(guardrail); setDetailOpen(true); }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getSeverityColor(guardrail.severity))}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{guardrail.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{guardrail.guardrail_type}</Badge>
                          {getActionBadge(guardrail.action)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Violations</p>
                        <p className="text-sm font-medium">{guardrail.violations_count || 0}</p>
                      </div>
                      <Switch checked={guardrail.is_active} onClick={(e) => e.stopPropagation()} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Sensitive Data Patterns</h2>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {patterns.map((pattern, i) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{pattern.name}</h3>
                      <Switch checked={pattern.is_active} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 font-mono line-clamp-1">{pattern.pattern_regex}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{pattern.category}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{pattern.action}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="violations">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Violations</h2>
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No violations recorded</p>
              <p className="text-sm text-muted-foreground">Violations will appear here when detected</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Rules</p>
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(selectedItem.rules, null, 2)}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <Badge className={getSeverityColor(selectedItem.severity)}>{selectedItem.severity}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  {getActionBadge(selectedItem.action)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
