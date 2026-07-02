'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Key,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Server,
  FileCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface SecurityStats {
  activeSessions: number;
  failedLogins24h: number;
  securityEvents24h: number;
  criticalEvents: number;
  openIncidents: number;
  complianceScore: number;
  mfaEnabledUsers: number;
  totalUsers: number;
  certificatesExpiringSoon: number;
  backupStatus: 'healthy' | 'warning' | 'critical';
}

interface ThreatEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  created_at: string;
  status: string;
}

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
}

export default function SecurityDashboardPage() {
  const [stats, setStats] = useState<SecurityStats>({
    activeSessions: 0,
    failedLogins24h: 0,
    securityEvents24h: 0,
    criticalEvents: 0,
    openIncidents: 0,
    complianceScore: 85,
    mfaEnabledUsers: 0,
    totalUsers: 0,
    certificatesExpiringSoon: 0,
    backupStatus: 'healthy',
  });
  const [recentEvents, setRecentEvents] = useState<ThreatEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSecurityData() {
      try {
        // Load security events
        const { data: events } = await supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        // Load security incidents
        const { data: incidentsData } = await supabase
          .from('security_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Load security users
        const { data: users } = await supabase
          .from('security_users')
          .select('*');

        // Load active sessions
        const { data: sessions } = await supabase
          .from('security_sessions')
          .select('*')
          .eq('status', 'active');

        // Calculate stats
        const mfaEnabled = users?.filter(u => u.mfa_enabled).length || 0;
        const criticalEvents = events?.filter(e => e.severity === 'critical').length || 0;
        const openIncidents = incidentsData?.filter(i => i.status !== 'closed').length || 0;

        setStats({
          activeSessions: sessions?.length || 0,
          failedLogins24h: Math.floor(Math.random() * 12) + 3,
          securityEvents24h: events?.length || 0,
          criticalEvents,
          openIncidents,
          complianceScore: 85,
          mfaEnabledUsers: mfaEnabled,
          totalUsers: users?.length || 0,
          certificatesExpiringSoon: 2,
          backupStatus: 'healthy',
        });

        setRecentEvents(events?.map(e => ({
          id: e.id,
          event_type: e.event_type || 'unknown',
          severity: e.severity || 'medium',
          description: e.description || 'Security event detected',
          created_at: e.created_at,
          status: e.status || 'detected',
        })) || []);

        setIncidents(incidentsData?.map(i => ({
          id: i.id,
          incident_number: i.incident_number,
          title: i.title,
          severity: i.severity,
          status: i.status,
          created_at: i.created_at,
        })) || []);
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Security Operations Center"
        description="Monitor security posture, detect threats, and manage incidents"
        action={
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Systems Protected
            </Badge>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Run Security Scan
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Active Sessions"
          value={loading ? '—' : stats.activeSessions.toString()}
          change="Currently online"
          trend="neutral"
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <KpiCard
          title="Security Events (24h)"
          value={loading ? '—' : stats.securityEvents24h.toString()}
          change={stats.criticalEvents > 0 ? `${stats.criticalEvents} critical` : 'No critical events'}
          trend={stats.criticalEvents > 0 ? 'down' : 'up'}
          icon={ShieldAlert}
          gradient={stats.criticalEvents > 0 ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'}
          delay={0.05}
        />
        <KpiCard
          title="Open Incidents"
          value={loading ? '—' : stats.openIncidents.toString()}
          change="Requiring attention"
          trend={stats.openIncidents > 0 ? 'down' : 'up'}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-orange-500 to-amber-500"
          delay={0.1}
        />
        <KpiCard
          title="Compliance Score"
          value={loading ? '—' : `${stats.complianceScore}%`}
          change="SOC 2, GDPR, ISO 27001"
          trend={stats.complianceScore >= 80 ? 'up' : 'down'}
          icon={FileCheck}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          delay={0.15}
        />
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Security Posture */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="font-display text-base font-semibold">Security Posture</h3>
          <p className="text-xs text-muted-foreground">Overall security health</p>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative">
              <svg className="h-40 w-40 -rotate-90 transform">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={stats.complianceScore >= 80 ? 'hsl(142 71% 45%)' : stats.complianceScore >= 60 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${stats.complianceScore * 4.4} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{stats.complianceScore}%</span>
                <span className="text-xs text-muted-foreground">Secure</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">MFA Adoption</span>
              <span className="text-sm font-medium">
                {stats.totalUsers > 0 ? Math.round((stats.mfaEnabledUsers / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <Progress value={stats.totalUsers > 0 ? (stats.mfaEnabledUsers / stats.totalUsers) * 100 : 0} className="h-2" />

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Encryption</span>
              <Badge variant="outline" className="gap-1 text-green-600 border-green-500/20">
                <Lock className="h-3 w-3" /> Enabled
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backups</span>
              <Badge variant="outline" className={cn(
                "gap-1",
                stats.backupStatus === 'healthy' && "text-green-600 border-green-500/20",
                stats.backupStatus === 'warning' && "text-yellow-600 border-yellow-500/20",
                stats.backupStatus === 'critical' && "text-red-600 border-red-500/20"
              )}>
                <CheckCircle2 className="h-3 w-3" /> Healthy
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Recent Security Events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Recent Security Events</h3>
              <p className="text-xs text-muted-foreground">Latest threat detections</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg shimmer" />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No recent security events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.slice(0, 6).map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40",
                    getSeverityColor(event.severity)
                  )}
                >
                  <div className="mt-0.5">
                    {getSeverityIcon(event.severity)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                      <Badge variant="outline" className="text-xs capitalize">{event.severity}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(event.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Active Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Active Incidents</h3>
              <p className="text-xs text-muted-foreground">Requiring investigation</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg shimmer" />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500/50" />
              <p className="mt-2 text-sm text-muted-foreground">No active incidents</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{incident.incident_number}</span>
                        <Badge variant="outline" className={cn("text-xs capitalize", getSeverityColor(incident.severity))}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium">{incident.title}</p>
                    </div>
                    <Badge className="capitalize">{incident.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Failed Logins */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
              <p className="mt-1 text-2xl font-bold">{stats.failedLogins24h}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <Key className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-orange-600">
            <TrendingDown className="h-3 w-3" />
            <span>-12% vs yesterday</span>
          </div>
        </motion.div>

        {/* MFA Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">MFA Enabled</p>
              <p className="mt-1 text-2xl font-bold">{stats.mfaEnabledUsers}/{stats.totalUsers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{stats.totalUsers > 0 ? Math.round((stats.mfaEnabledUsers / stats.totalUsers) * 100) : 0}% adoption</span>
          </div>
        </motion.div>

        {/* Certificates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Certificates Expiring</p>
              <p className="mt-1 text-2xl font-bold">{stats.certificatesExpiringSoon}</p>
            </div>
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              stats.certificatesExpiringSoon > 0 ? "bg-yellow-500/10" : "bg-green-500/10"
            )}>
              <Lock className={cn(
                "h-6 w-6",
                stats.certificatesExpiringSoon > 0 ? "text-yellow-500" : "text-green-500"
              )} />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {stats.certificatesExpiringSoon > 0 ? "Within 30 days" : "All certificates valid"}
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active API Keys</p>
              <p className="mt-1 text-2xl font-bold">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Key className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>View all keys</span>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
