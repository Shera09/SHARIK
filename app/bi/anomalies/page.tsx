'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Eye,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  User,
  MoreHorizontal,
  XCircle,
  RefreshCcw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Anomaly {
  anomaly_id: string;
  rule_id: string | null;
  metric_name: string;
  anomaly_severity: string;
  detected_value: number;
  expected_value: number;
  deviation_percent: number | null;
  deviation_stddev: number | null;
  dimension_type: string | null;
  dimension_key: string | null;
  dimension_value: string | null;
  detection_timestamp: string;
  status: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  false_positive: boolean;
  context_data: any;
}

const severityConfig = {
  critical: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: AlertCircle, label: 'Critical' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20', icon: AlertTriangle, label: 'High' },
  medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: AlertTriangle, label: 'Medium' },
  low: { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: AlertOctagon, label: 'Low' },
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700',
  acknowledged: 'bg-purple-500/10 text-purple-700',
  investigating: 'bg-orange-500/10 text-orange-700',
  resolved: 'bg-green-500/10 text-green-700',
  dismissed: 'bg-gray-500/10 text-gray-700',
};

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadAnomalies();
  }, []);

  async function loadAnomalies() {
    try {
      const { data, error } = await supabase
        .from('detected_anomalies')
        .select('*')
        .order('detection_timestamp', { ascending: false });

      if (error) throw error;
      setAnomalies(data || []);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnomalies = anomalies.filter(anomaly => {
    const matchesSearch = anomaly.metric_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || anomaly.anomaly_severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || anomaly.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: anomalies.length,
    new: anomalies.filter(a => a.status === 'new').length,
    critical: anomalies.filter(a => a.anomaly_severity === 'critical').length,
    high: anomalies.filter(a => a.anomaly_severity === 'high').length,
    resolved: anomalies.filter(a => a.status === 'resolved').length,
    falsePositives: anomalies.filter(a => a.false_positive).length,
  };

  const viewAnomaly = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setDetailDialogOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="Anomaly Detection"
        description="Monitor and investigate detected anomalies in business metrics"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadAnomalies()}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Badge variant="outline" className="gap-1.5 bg-orange-500/10 text-orange-700 border-orange-500/20">
              <Activity className="h-3 w-3" />
              Live Monitoring
            </Badge>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Anomalies', value: stats.total, color: 'text-foreground', icon: AlertOctagon },
          { label: 'New', value: stats.new, color: 'text-blue-600', icon: AlertCircle },
          { label: 'Critical', value: stats.critical, color: 'text-red-600', icon: AlertTriangle },
          { label: 'High', value: stats.high, color: 'text-orange-600', icon: AlertTriangle },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600', icon: CheckCircle2 },
          { label: 'False Positives', value: stats.falsePositives, color: 'text-gray-600', icon: XCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color, "opacity-50")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Anomalies List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 space-y-3"
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))
        ) : filteredAnomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No anomalies detected</p>
            <p className="text-sm text-muted-foreground">All metrics are within normal ranges</p>
          </div>
        ) : (
          filteredAnomalies.map((anomaly, i) => {
            const severity = severityConfig[anomaly.anomaly_severity as keyof typeof severityConfig] || severityConfig.medium;
            const SeverityIcon = severity.icon;

            return (
              <motion.div
                key={anomaly.anomaly_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    anomaly.anomaly_severity === 'critical' && "bg-red-500",
                    anomaly.anomaly_severity === 'high' && "bg-orange-500",
                    anomaly.anomaly_severity === 'medium' && "bg-yellow-500",
                    anomaly.anomaly_severity === 'low' && "bg-green-500"
                  )} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          severity.color
                        )}>
                          <SeverityIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{anomaly.metric_name}</h3>
                            <Badge variant="outline" className={cn("text-xs", severity.color)}>
                              {severity.label}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <span className="text-muted-foreground">Detected:</span>
                              <span className="font-medium text-red-600">
                                {anomaly.detected_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BarChart3 className="h-4 w-4 text-green-500" />
                              <span className="text-muted-foreground">Expected:</span>
                              <span className="font-medium">
                                {anomaly.expected_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            {anomaly.deviation_percent && (
                              <div className={cn(
                                "flex items-center gap-1.5",
                                anomaly.deviation_percent > 0 ? "text-red-600" : "text-blue-600"
                              )}>
                                {anomaly.deviation_percent > 0 ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowDown className="h-4 w-4" />
                                )}
                                <span className="font-medium">
                                  {Math.abs(anomaly.deviation_percent).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {new Date(anomaly.detection_timestamp).toLocaleString('en-US', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            {anomaly.dimension_type && anomaly.dimension_value && (
                              <span className="flex items-center gap-1.5">
                                <Activity className="h-3 w-3" />
                                {anomaly.dimension_type}: {anomaly.dimension_value}
                              </span>
                            )}
                            {anomaly.false_positive && (
                              <Badge variant="outline" className="text-xs">False Positive</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("capitalize", statusColors[anomaly.status] || statusColors.new)}>
                          {anomaly.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => viewAnomaly(anomaly)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedAnomaly && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Anomaly Details
                  <Badge className={cn(
                    "capitalize",
                    severityConfig[selectedAnomaly.anomaly_severity as keyof typeof severityConfig]?.color ||
                    severityConfig.medium.color
                  )}>
                    {selectedAnomaly.anomaly_severity}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Detected at {new Date(selectedAnomaly.detection_timestamp).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Detected Value</p>
                      <p className="mt-1 text-2xl font-bold text-red-600">
                        {selectedAnomaly.detected_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Expected Value</p>
                      <p className="mt-1 text-2xl font-bold">
                        {selectedAnomaly.expected_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Deviation</p>
                    <p className="font-medium">
                      {selectedAnomaly.deviation_percent?.toFixed(1)}%
                      {selectedAnomaly.deviation_stddev && ` (${selectedAnomaly.deviation_stddev.toFixed(1)}σ)`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedAnomaly.status}</p>
                  </div>
                </div>

                {selectedAnomaly.dimension_type && selectedAnomaly.dimension_value && (
                  <div>
                    <p className="text-sm text-muted-foreground">Context</p>
                    <p className="font-medium">
                      {selectedAnomaly.dimension_type}: <span className="capitalize">{selectedAnomaly.dimension_value}</span>
                    </p>
                  </div>
                )}

                {selectedAnomaly.resolution_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Resolution Notes</p>
                    <p className="text-sm">{selectedAnomaly.resolution_notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Acknowledge
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <XCircle className="h-4 w-4" />
                    False Positive
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// Fix missing imports
function ArrowUp({ className }: { className?: string }) {
  return <TrendingUp className={className} />;
}

function ArrowDown({ className }: { className?: string }) {
  return <TrendingDown className={className} />;
}
