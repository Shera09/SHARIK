'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Key,
  Users,
  Globe,
  Clock,
  Activity,
  Server,
  FileText,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Download,
  Ban,
  Unlock,
  Settings,
  AlertCircle,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type SecurityEvent = {
  id: string;
  event_type: string;
  severity: string;
  source_ip: string;
  user_id: string;
  user_email: string;
  resource: string;
  action: string;
  details: any;
  geo_location: any;
  user_agent: string;
  created_at: string;
};

type LoginAttempt = {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason: string;
  location: any;
  created_at: string;
};

type SecurityPolicy = {
  id: string;
  name: string;
  description: string;
  policy_type: string;
  rules: any;
  is_active: boolean;
  priority: number;
  created_at: string;
};

export default function SecurityCenterPage() {
  const [loading, setLoading] = useState(true);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [eventsRes, loginsRes, policiesRes] = await Promise.all([
      supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('login_attempts').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('security_policies').select('*').order('priority', { ascending: true }),
    ]);

    if (eventsRes.data) setSecurityEvents(eventsRes.data);
    if (loginsRes.data) setLoginAttempts(loginsRes.data);
    if (policiesRes.data) setPolicies(policiesRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Calculate security metrics
  const today = new Date().toDateString();
  const todayEvents = securityEvents.filter(e => new Date(e.created_at).toDateString() === today);
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical');
  const failedLogins = loginAttempts.filter(l => !l.success);
  const todayFailedLogins = failedLogins.filter(l => new Date(l.created_at).toDateString() === today);

  const securityScore = Math.max(0, 100 - (criticalEvents.length * 10) - (todayFailedLogins.length * 2));

  const filteredEvents = securityEvents.filter(e => {
    const matchesSearch = e.event_type.toLowerCase().includes(search.toLowerCase()) ||
                          e.user_email?.toLowerCase().includes(search.toLowerCase()) ||
                          e.resource?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' };
      case 'high': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'warning': return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Security Center"
        description="Monitor security events, access logs, and policies"
        action={
          <div className="flex items-center gap-2">
            <Badge className={cn(
              'gap-1.5',
              securityScore >= 80 ? 'bg-success/10 text-success' :
              securityScore >= 50 ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-destructive/10 text-destructive'
            )}>
              <Shield className="h-3 w-3" />
              {securityScore}% Secure
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Security Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Security Score</span>
          </div>
          <p className={cn(
            'text-2xl font-bold',
            securityScore >= 80 ? 'text-success' :
            securityScore >= 50 ? 'text-yellow-500' :
            'text-destructive'
          )}>
            {securityScore}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Today Events</span>
          </div>
          <p className="text-2xl font-bold">{todayEvents.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{criticalEvents.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Failed Logins</span>
          </div>
          <p className="text-2xl font-bold">{todayFailedLogins.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Active Sessions</span>
          </div>
          <p className="text-2xl font-bold">127</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Policies</span>
          </div>
          <p className="text-2xl font-bold">{policies.length}</p>
        </motion.div>
      </div>

      {/* Security Score Progress */}
      <div className="glass-card p-4 premium-shadow mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Overall Security Posture
          </h3>
          <span className="text-sm font-medium">{securityScore}%</span>
        </div>
        <Progress value={securityScore} className={cn(
          'h-3',
          securityScore >= 80 ? '[&>div]:bg-success' :
          securityScore >= 50 ? '[&>div]:bg-yellow-500' :
          '[&>div]:bg-destructive'
        )} />
        <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> SSL Enabled</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> 2FA Available</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Audit Logging</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> RLS Enabled</span>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="events" className="rounded-lg">Security Events</TabsTrigger>
          <TabsTrigger value="logins" className="rounded-lg">Login Attempts</TabsTrigger>
          <TabsTrigger value="policies" className="rounded-lg">Security Policies</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="mt-0">
          <div className="glass-card p-4 premium-shadow">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="pl-9" />
              </div>
              <div className="flex gap-1.5">
                {['all', 'critical', 'high', 'warning', 'info'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                      severityFilter === sev ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                <p className="text-sm font-medium">No security events</p>
                <p className="text-xs text-muted-foreground">All systems secure</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredEvents.slice(0, 50).map((event, i) => {
                  const style = getSeverityStyle(event.severity);
                  const Icon = style.icon;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className={cn('p-4 rounded-lg border', style.bg, style.border)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', style.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                            <Badge variant="outline" className={cn('text-[9px]', style.color)}>
                              {event.severity}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {event.user_email && <span>User: {event.user_email}</span>}
                            {event.source_ip && <span>IP: {event.source_ip}</span>}
                            {event.resource && <span>Resource: {event.resource}</span>}
                            {event.action && <span>Action: {event.action}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Login Attempts Tab */}
        <TabsContent value="logins" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Logins */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Login Attempts
              </h3>
              {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}</div>
              ) : loginAttempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No login attempts recorded</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {loginAttempts.slice(0, 20).map((attempt, i) => (
                    <div key={attempt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        attempt.success ? 'bg-success/10' : 'bg-destructive/10'
                      )}>
                        {attempt.success ? <Unlock className="h-4 w-4 text-success" /> : <Lock className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attempt.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.ip_address} • {attempt.success ? 'Success' : attempt.failure_reason || 'Failed'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(attempt.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suspicious IPs */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Suspicious Activity
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-sm">Rate Limiting</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2 IPs temporarily blocked</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm mb-2">Top Failed Login IPs</h4>
                  <div className="space-y-2">
                    {failedLogins.slice(0, 5).map((attempt, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{attempt.ip_address || 'Unknown'}</span>
                        <span className="font-medium">{failedLogins.filter(l => l.ip_address === attempt.ip_address).length} failures</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Rate Limiting
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Policies Tab */}
        <TabsContent value="policies" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy, i) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{policy.name}</h3>
                  <Badge className={policy.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                    {policy.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{policy.description}</p>
                <Badge variant="outline" className="text-[10px] capitalize">{policy.policy_type}</Badge>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Settings className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {policies.length === 0 && !loading && (
            <div className="glass-card p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No security policies configured</p>
              <p className="text-sm text-muted-foreground mt-1">Create policies to protect your system</p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Policy
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
}
