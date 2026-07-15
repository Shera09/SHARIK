'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Activity,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Metric = {
  id: string;
  metric_name: string;
  metric_type: string;
  target_value: number;
  unit: string;
};

export default function AIEvaluationPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('ai_evaluation_metrics').select('*');
    if (data) setMetrics(data);
    setLoading(false);
  }, []);

  const getCurrentValue = (metricName: string) => {
    const mockValues: Record<string, number> = {
      'Answer Relevance': 0.87,
      'Factual Accuracy': 0.92,
      'Grounding Score': 0.78,
      'Response Latency': 1850,
      'Token Efficiency': 0.82,
      'User Satisfaction': 4.2,
      'Task Completion': 0.88,
      'Cost Efficiency': 0.042,
    };
    return mockValues[metricName] || 0;
  };

  const getPerformanceColor = (current: number, target: number, inverse: boolean = false) => {
    const ratio = inverse ? target / current : current / target;
    if (ratio >= 1) return 'text-green-500';
    if (ratio >= 0.8) return 'text-yellow-500';
    return 'text-red-500';
  };

  const mockResults = [
    { conversation: 'conv_1', quality: 0.92, grounding: 0.88, satisfaction: 4.5 },
    { conversation: 'conv_2', quality: 0.85, grounding: 0.76, satisfaction: 4.1 },
    { conversation: 'conv_3', quality: 0.88, grounding: 0.82, satisfaction: 4.3 },
    { conversation: 'conv_4', quality: 0.91, grounding: 0.79, satisfaction: 4.4 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="AI Evaluation"
        description="Quality metrics, grounding scores, and performance tracking"
        action={
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Metrics
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Quality', value: '87%', icon: Target, trend: '+3%', color: 'text-green-500' },
          { label: 'Grounding Score', value: '78%', icon: Star, trend: '+5%', color: 'text-green-500' },
          { label: 'User Rating', value: '4.2/5', icon: Star, trend: '+0.3', color: 'text-green-500' },
          { label: 'Task Success', value: '88%', icon: CheckCircle, trend: '+2%', color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
            <p className={cn('text-xs mt-2', stat.color)}>{stat.trend} from last week</p>
          </motion.div>
        ))}
      </div>

      {/* Metrics Dashboard */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric, i) => {
              const current = getCurrentValue(metric.metric_name);
              const isInverse = metric.metric_name.includes('Latency') || metric.metric_name.includes('Cost');
              const percentage = isInverse ? Math.max(0, Math.min(100, (metric.target_value / current) * 100)) : (current / metric.target_value) * 100;
              const performance = percentage >= 100 ? 'meeting' : percentage >= 80 ? 'close' : 'below';

              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{metric.metric_name}</h3>
                      <p className="text-xs text-muted-foreground">{metric.metric_type}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-lg font-bold', getPerformanceColor(current, metric.target_value, isInverse))}>
                        {metric.unit === 'ms' ? `${current}` : current.toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Target: {metric.target_value} {metric.unit}</p>
                    </div>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="quality">Quality Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
            <div className="h-64 flex items-center justify-center text-center">
              <div>
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Trend Analysis</p>
                <p className="text-sm text-muted-foreground">View performance trends over time</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">User Feedback</h2>
            <div className="space-y-3">
              {mockResults.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 flex items-center justify-between">
                  <span className="font-mono text-sm">{r.conversation}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Quality: {(r.quality * 100).toFixed(0)}%</Badge>
                    <Badge variant="outline">Grounding: {(r.grounding * 100).toFixed(0)}%</Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                      {r.satisfaction}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quality Assurance</h2>
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Quality Checks</p>
              <p className="text-sm text-muted-foreground">Review quality check results</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
