'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Play,
  Pause,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  Eye,
  Settings,
  BarChart3,
  Activity,
  Zap,
  Database,
  Table,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Pipeline {
  pipeline_id: string;
  name: string;
  description: string | null;
  source_type: string;
  target_table: string;
  schedule_cron: string | null;
  is_active: boolean;
  last_run_timestamp: string | null;
  last_run_status: string | null;
  last_run_records_processed: number | null;
  last_run_duration_ms: number | null;
  error_count: number;
}

interface PipelineRun {
  run_id: string;
  pipeline_id: string;
  run_status: string;
  start_timestamp: string | null;
  end_timestamp: string | null;
  duration_ms: number | null;
  records_read: number;
  records_processed: number;
  records_failed: number;
}

const statusConfig = {
  completed: { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: CheckCircle2, label: 'Completed' },
  running: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: Loader2, label: 'Running' },
  pending: { color: 'bg-gray-500/10 text-gray-700 border-gray-500/20', icon: Clock, label: 'Pending' },
  failed: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20', icon: Pause, label: 'Cancelled' },
};

const sourceIcons: Record<string, typeof Database> = {
  database: Database,
  api: Zap,
  file: Table,
  stream: Activity,
  warehouse: Database,
};

export default function ETLPipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pipelinesRes, runsRes] = await Promise.all([
        supabase.from('etl_pipelines').select('*').order('name'),
        supabase.from('etl_pipeline_runs').select('*').order('start_timestamp', { ascending: false }).limit(20),
      ]);

      setPipelines(pipelinesRes.data || []);
      setRuns(runsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipeline.target_table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && pipeline.is_active) ||
      (statusFilter === 'inactive' && !pipeline.is_active);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: pipelines.length,
    active: pipelines.filter(p => p.is_active).length,
    runsToday: runs.filter(r => r.start_timestamp && new Date(r.start_timestamp) > new Date(Date.now() - 24*60*60*1000)).length,
    failed: pipelines.filter(p => p.last_run_status === 'failed').length,
    recordsProcessed: pipelines.reduce((sum, p) => sum + (p.last_run_records_processed || 0), 0),
    avgDuration: pipelines.reduce((sum, p) => sum + (p.last_run_duration_ms || 0), 0) / (pipelines.length || 1),
  };

  const getLatestRun = (pipelineId: string) => {
    return runs.find(r => r.pipeline_id === pipelineId);
  };

  return (
    <AppShell>
      <PageHeader
        title="ETL Pipelines"
        description="Manage data integration and transformation pipelines"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create ETL Pipeline</DialogTitle>
                <DialogDescription>
                  Define a new data integration pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Pipeline Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Sync Customer Data" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="stream">Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Table</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fact_sales">fact_sales</SelectItem>
                        <SelectItem value="fact_payments">fact_payments</SelectItem>
                        <SelectItem value="dim_customer">dim_customer</SelectItem>
                        <SelectItem value="dim_employee">dim_employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Source Configuration</Label>
                  <Textarea className="mt-1.5 font-mono text-sm" placeholder='{"connection": "...", "query": "..."}' rows={3} />
                </div>
                <div>
                  <Label>Transformation Logic (SQL)</Label>
                  <Textarea className="mt-1.5 font-mono text-sm" placeholder="SELECT * FROM source WHERE..." rows={4} />
                </div>
                <div>
                  <Label>Schedule (Cron)</Label>
                  <Input className="mt-1.5" placeholder="0 */6 * * *" />
                  <p className="text-xs text-muted-foreground mt-1">Run every 6 hours</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Pipeline</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Pipelines', value: stats.total, icon: GitBranch, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: Play, color: 'text-green-600' },
          { label: 'Runs Today', value: stats.runsToday, icon: Activity, color: 'text-purple-600' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-600' },
          { label: 'Records', value: stats.recordsProcessed.toLocaleString(), icon: Database, color: 'text-cyan-600' },
          { label: 'Avg Duration', value: `${(stats.avgDuration / 1000).toFixed(1)}s`, icon: Clock, color: 'text-orange-600' },
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
                    <p className={cn("mt-1 text-xl font-bold", stat.color)}>{stat.value}</p>
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
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Pipelines List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 space-y-4"
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))
        ) : filteredPipelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No pipelines found</p>
          </div>
        ) : (
          filteredPipelines.map((pipeline, i) => {
            const latestRun = getLatestRun(pipeline.pipeline_id);
            const status = latestRun?.run_status || pipeline.last_run_status || 'pending';
            const statusCfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = statusCfg.icon;
            const SourceIcon = sourceIcons[pipeline.source_type] || Database;

            return (
              <motion.div
                key={pipeline.pipeline_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          pipeline.is_active ? "bg-blue-500/10" : "bg-gray-500/10"
                        )}>
                          <SourceIcon className={cn("h-6 w-6", pipeline.is_active ? "text-blue-600" : "text-gray-500")} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{pipeline.name}</h3>
                            <Badge variant="outline" className="capitalize">
                              {pipeline.source_type}
                            </Badge>
                            {!pipeline.is_active && (
                              <Badge variant="outline" className="bg-gray-500/10 text-gray-600">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Table className="h-4 w-4" />
                              {pipeline.target_table}
                            </span>
                            {pipeline.schedule_cron && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {pipeline.schedule_cron}
                              </span>
                            )}
                          </div>
                          {pipeline.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{pipeline.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn("capitalize", statusCfg.color)}>
                          {status === 'running' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <StatusIcon className="h-3 w-3 mr-1" />
                          )}
                          {statusCfg.label}
                        </Badge>
                        {pipeline.last_run_timestamp && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(pipeline.last_run_timestamp).toLocaleString('en-US', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {status === 'running' && latestRun && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Processing...</span>
                          <span>{latestRun.records_processed.toLocaleString()} records</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}

                    {/* Last run stats */}
                    {latestRun && status !== 'running' && (
                      <div className="mt-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Records:</span>
                          <span className="font-medium">
                            {latestRun.records_read?.toLocaleString() || 0} read
                          </span>
                          <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                          <span className="font-medium">
                            {latestRun.records_processed?.toLocaleString() || 0} processed
                          </span>
                        </div>
                        {latestRun.duration_ms && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{(latestRun.duration_ms / 1000).toFixed(1)}s</span>
                          </div>
                        )}
                        {latestRun.records_failed > 0 && (
                          <Badge variant="outline" className="text-red-600">
                            {latestRun.records_failed} failed
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Play className="h-4 w-4" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-4 w-4" />
                        View Runs
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Settings className="h-4 w-4" />
                        Configure
                      </Button>
                      <div className="flex-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Recent Runs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8"
      >
        <h2 className="text-xl font-semibold mb-4">Recent Pipeline Runs</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {runs.slice(0, 10).map((run) => {
                const pipeline = pipelines.find(p => p.pipeline_id === run.pipeline_id);
                const statusCfg = statusConfig[run.run_status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = statusCfg.icon;

                return (
                  <div key={run.run_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        statusCfg.color
                      )}>
                        <StatusIcon className={cn("h-4 w-4", run.run_status === 'running' && "animate-spin")} />
                      </div>
                      <div>
                        <p className="font-medium">{pipeline?.name || 'Unknown Pipeline'}</p>
                        <p className="text-sm text-muted-foreground">
                          {run.start_timestamp ? new Date(run.start_timestamp).toLocaleString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{run.records_processed?.toLocaleString() || 0} records</p>
                        <p className="text-xs text-muted-foreground">
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : 'In progress'}
                        </p>
                      </div>
                      <Badge className={cn("capitalize", statusCfg.color)}>
                        {run.run_status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
}
