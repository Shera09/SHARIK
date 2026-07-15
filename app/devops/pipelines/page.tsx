'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  ArrowRight,
  Zap,
  Shield,
  TestTube,
  Rocket,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const pipelineStages = [
  { name: 'Build', icon: Zap, duration: '2m 15s', status: 'success' },
  { name: 'Unit Tests', icon: TestTube, duration: '3m 42s', status: 'success' },
  { name: 'Security Scan', icon: Shield, duration: '1m 30s', status: 'success' },
  { name: 'Integration Tests', icon: TestTube, duration: '5m 12s', status: 'running' },
  { name: 'Deploy Staging', icon: Rocket, duration: '-', status: 'pending' },
  { name: 'Deploy Production', icon: Rocket, duration: '-', status: 'pending' },
];

const recentPipelines = [
  { id: '1', name: 'API Service', branch: 'main', commit: 'a1b2c3d', status: 'success', duration: '12m 45s', time: '2 hours ago' },
  { id: '2', name: 'Web App', branch: 'feature/auth', commit: 'e4f5g6h', status: 'failed', duration: '8m 32s', time: '3 hours ago' },
  { id: '3', name: 'AI Engine', branch: 'main', commit: 'i7j8k9l', status: 'success', duration: '15m 20s', time: '5 hours ago' },
  { id: '4', name: 'Worker Service', branch: 'hotfix/memory', commit: 'm0n1o2p', status: 'success', duration: '10m 15s', time: '1 day ago' },
];

const deploymentStrategies = [
  { name: 'Rolling Update', description: 'Gradually replace instances', icon: RefreshCw, active: true },
  { name: 'Blue/Green', description: 'Zero-downtime deployment', icon: Rocket, active: false },
  { name: 'Canary', description: 'Gradual traffic shift', icon: Zap, active: false },
];

export default function PipelinesPage() {
  const [runningPipeline, setRunningPipeline] = useState(false);

  function triggerBuild() {
    setRunningPipeline(true);
    setTimeout(() => setRunningPipeline(false), 5000);
  }

  const stats = {
    totalPipelines: 12,
    successRate: 94,
    avgDuration: '11m 32s',
    deploysToday: 8,
  };

  return (
    <AppShell>
      <PageHeader
        title="CI/CD Pipeline"
        description="Build, test, and deployment automation"
        action={
          <Button onClick={triggerBuild} disabled={runningPipeline} className="gap-2 rounded-xl">
            {runningPipeline ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Pipeline
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pipelines', value: stats.totalPipelines, icon: GitBranch, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Avg Duration', value: stats.avgDuration, icon: Clock, color: 'text-purple-500' },
          { label: 'Deploys Today', value: stats.deploysToday, icon: Rocket, color: 'text-cyan-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pipelines" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="pipelines" className="rounded-lg gap-1.5">
            <GitBranch className="h-4 w-4" />
            Pipelines
          </TabsTrigger>
          <TabsTrigger value="current" className="rounded-lg gap-1.5">
            <Play className="h-4 w-4" />
            Current Run
          </TabsTrigger>
          <TabsTrigger value="strategy" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Deployment Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPipelines.map((pipeline, i) => (
                  <motion.div
                    key={pipeline.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        pipeline.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      )}>
                        {pipeline.status === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{pipeline.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <code className="px-1 bg-muted rounded">{pipeline.branch}</code>
                          <span>•</span>
                          <code className="px-1 bg-muted rounded">{pipeline.commit}</code>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        'text-[10px]',
                        pipeline.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      )}>
                        {pipeline.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{pipeline.duration} • {pipeline.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                Pipeline Run #1234
              </CardTitle>
              <CardDescription>main • a1b2c3d • Triggered by push</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage, i) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      stage.status === 'success' && 'bg-green-500/10 text-green-600',
                      stage.status === 'running' && 'bg-blue-500/10 text-blue-600',
                      stage.status === 'pending' && 'bg-muted text-muted-foreground',
                      stage.status === 'failed' && 'bg-red-500/10 text-red-600'
                    )}>
                      {stage.status === 'running' ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : stage.status === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : stage.status === 'failed' ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <stage.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.status === 'running' ? 'In progress...' : stage.duration}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deployment Strategy</CardTitle>
                <CardDescription>Choose how new versions are deployed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentStrategies.map((strategy) => (
                    <div
                      key={strategy.name}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer',
                        strategy.active ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <strategy.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-xs text-muted-foreground">{strategy.description}</p>
                      </div>
                      {strategy.active && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pipeline Configuration</CardTitle>
                <CardDescription>Build and deployment settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Auto-deploy on merge', value: 'Enabled' },
                    { label: 'Run tests on PR', value: 'Enabled' },
                    { label: 'Require approval for prod', value: 'Yes' },
                    { label: 'Rollback on failure', value: 'Automatic' },
                    { label: 'Build timeout', value: '30 minutes' },
                    { label: 'Max concurrent builds', value: '5' },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{setting.label}</span>
                      <span className="text-sm font-medium">{setting.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
