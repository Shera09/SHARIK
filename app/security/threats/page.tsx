'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Activity,
  Eye,
  Clock,
  User,
  Globe,
  Zap,
  Filter,
  CheckCircle2,
  XCircle,
  Search,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ThreatEvent {
  id: string;
  event_type: string;
  event_category: string;
  event_name: string;
  severity: string;
  status: string;
  source_ip: string | null;
  source_user_email: string | null;
  description: string;
  detection_method: string | null;
  blocked: boolean;
  created_at: string;
  resolved_at: string | null;
}

interface AIThreatEvent {
  id: string;
  event_type: string;
  severity: string;
  model_used: string | null;
  action_taken: string | null;
  created_at: string;
}

const eventTypeIcons: Record<string, typeof AlertTriangle> = {
  authentication: User,
  authorization: Shield,
  intrusion: AlertCircle,
  malware: AlertTriangle,
  data_exfiltration: Activity,
  dos: Zap,
  api_abuse: Globe,
  suspicious_activity: Eye,
  policy_violation: Shield,
  ai_security: Activity,
};

const severityColors = {
  critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const statusColors = {
  detected: 'bg-blue-500/10 text-blue-600',
  investigating: 'bg-purple-500/10 text-purple-600',
  confirmed: 'bg-red-500/10 text-red-600',
  false_positive: 'bg-gray-500/10 text-gray-600',
  mitigated: 'bg-yellow-500/10 text-yellow-600',
  resolved: 'bg-green-500/10 text-green-600',
};

export default function ThreatDetectionPage() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);
  const [aiEvents, setAIEvents] = useState<AIThreatEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    loadThreats();
  }, []);

  async function loadThreats() {
    try {
      const [eventsData, aiEventsData] = await Promise.all([
        supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('ai_security_events').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      setEvents(eventsData.data || []);
      setAIEvents(aiEventsData.data || []);
    } catch (error) {
      console.error('Error loading threats:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source_user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.event_category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    blocked: events.filter(e => e.blocked).length,
    resolved: events.filter(e => e.status === 'resolved').length,
    aiThreats: aiEvents.length,
    aiBlocked: aiEvents.filter(e => e.action_taken === 'blocked').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Threat Detection"
        description="Monitor and respond to security threats in real-time"
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Real-time Monitoring
            </Badge>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Configure Rules
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground">Total Events</p>
          <p className="mt-1 text-2xl font-bold">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground">Critical</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.critical}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground">Blocked</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{stats.blocked}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.resolved}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground">AI Threats</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">{stats.aiThreats}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Block Rate</p>
              <p className="mt-1 text-2xl font-bold">
                {events.length > 0 ? Math.round((stats.blocked / events.length) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search threats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="authentication">Authentication</SelectItem>
            <SelectItem value="authorization">Authorization</SelectItem>
            <SelectItem value="intrusion">Intrusion</SelectItem>
            <SelectItem value="malware">Malware</SelectItem>
            <SelectItem value="api_abuse">API Abuse</SelectItem>
            <SelectItem value="suspicious_activity">Suspicious</SelectItem>
            <SelectItem value="ai_security">AI Security</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Security Events */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Events</CardTitle>
                    <CardDescription>{filteredEvents.length} events detected</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 rounded-lg shimmer" />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No threats detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.slice(0, 10).map((event, i) => {
                      const Icon = eventTypeIcons[event.event_category] || AlertTriangle;
                      const sevColor = severityColors[event.severity as keyof typeof severityColors] || severityColors.medium;
                      const stColor = statusColors[event.status as keyof typeof statusColors] || statusColors.detected;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.03 }}
                          className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            sevColor
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{event.event_name}</p>
                              <Badge variant="outline" className={cn("text-xs", sevColor)}>
                                {event.severity}
                              </Badge>
                              <Badge variant="outline" className={cn("text-xs", stColor)}>
                                {event.status.replace('_', ' ')}
                              </Badge>
                              {event.blocked && (
                                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                                  Blocked
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {event.source_ip && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {event.source_ip}
                                </span>
                              )}
                              {event.source_user_email && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.source_user_email}
                                </span>
                              )}
                              {event.detection_method && (
                                <Badge variant="outline" className="text-xs">
                                  {event.detection_method}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Investigate</Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Security Events */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                    <Activity className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>AI Security Events</CardTitle>
                    <CardDescription>Prompt injection & data leaks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {aiEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No AI threats detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiEvents.slice(0, 5).map((event, i) => (
                      <div
                        key={event.id}
                        className="rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn(
                            "text-xs capitalize",
                            severityColors[event.severity as keyof typeof severityColors]
                          )}>
                            {event.event_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            event.action_taken === 'blocked' && "bg-red-500/10 text-red-600 border-red-500/20",
                            event.action_taken === 'sanitized' && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                            event.action_taken === 'logged' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          )}>
                            {event.action_taken}
                          </Badge>
                        </div>
                        {event.model_used && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Model: {event.model_used}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
