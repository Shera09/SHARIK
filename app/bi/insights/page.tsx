'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Sparkles,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Zap,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
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

interface Insight {
  insight_id: string;
  insight_type: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  priority: string;
  impact_level: string | null;
  confidence_score: number | null;
  affected_metrics: string[];
  recommendations: string[];
  action_items: any[];
  detection_timestamp: string;
  status: string;
  acknowledged_by: string | null;
  resolved_by: string | null;
}

const insightTypeConfig: Record<string, { color: string; icon: typeof Lightbulb; label: string }> = {
  opportunity: { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: TrendingUp, label: 'Opportunity' },
  risk: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: AlertTriangle, label: 'Risk' },
  anomaly: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20', icon: Zap, label: 'Anomaly' },
  trend: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: BarChart3, label: 'Trend' },
  recommendation: { color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', icon: Lightbulb, label: 'Recommendation' },
  alert: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: AlertTriangle, label: 'Alert' },
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white',
};

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      const { data, error } = await supabase
        .from('ai_business_insights')
        .select('*')
        .order('detection_timestamp', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || insight.insight_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || insight.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: insights.length,
    active: insights.filter(i => i.status === 'active').length,
    opportunities: insights.filter(i => i.insight_type === 'opportunity').length,
    risks: insights.filter(i => i.insight_type === 'risk').length,
    acknowledged: insights.filter(i => i.status === 'acknowledged').length,
    resolved: insights.filter(i => i.status === 'resolved').length,
  };

  const viewInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setDetailDialogOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Business Insights"
        description="AI-powered business intelligence and recommendations"
        action={
          <Badge variant="outline" className="gap-1.5 bg-purple-500/10 text-purple-700 border-purple-500/20">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Active', value: stats.active, color: 'text-blue-600' },
          { label: 'Opportunities', value: stats.opportunities, color: 'text-green-600' },
          { label: 'Risks', value: stats.risks, color: 'text-red-600' },
          { label: 'Acknowledged', value: stats.acknowledged, color: 'text-purple-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
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
            placeholder="Search insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="opportunity">Opportunity</SelectItem>
            <SelectItem value="risk">Risk</SelectItem>
            <SelectItem value="anomaly">Anomaly</SelectItem>
            <SelectItem value="trend">Trend</SelectItem>
            <SelectItem value="recommendation">Recommendation</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Insights List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 space-y-4"
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))
        ) : filteredInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No insights found</p>
          </div>
        ) : (
          filteredInsights.map((insight, i) => {
            const config = insightTypeConfig[insight.insight_type] || insightTypeConfig.recommendation;
            const Icon = config.icon;

            return (
              <motion.div
                key={insight.insight_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    insight.insight_type === 'opportunity' && "bg-green-500",
                    insight.insight_type === 'risk' && "bg-red-500",
                    insight.insight_type === 'anomaly' && "bg-orange-500",
                    insight.insight_type === 'trend' && "bg-blue-500",
                    insight.insight_type === 'recommendation' && "bg-purple-500",
                    insight.insight_type === 'alert' && "bg-yellow-500"
                  )} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        config.color
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge className={cn("text-xs", priorityColors[insight.priority] || priorityColors.medium)}>
                                {insight.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {config.label}
                              </Badge>
                              {insight.confidence_score && (
                                <span className="text-xs text-muted-foreground">
                                  {(insight.confidence_score * 100).toFixed(0)}% confidence
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {new Date(insight.detection_timestamp).toLocaleDateString('en-US', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className={cn(
                            "capitalize",
                            insight.status === 'active' && "bg-blue-500/10 text-blue-700",
                            insight.status === 'acknowledged' && "bg-purple-500/10 text-purple-700",
                            insight.status === 'resolved' && "bg-green-500/10 text-green-700"
                          )}>
                            {insight.status}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {insight.description}
                        </p>
                        {insight.affected_metrics && insight.affected_metrics.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">Affects:</span>
                            {insight.affected_metrics.slice(0, 3).map((metric, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                            {insight.affected_metrics.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{insight.affected_metrics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        {insight.recommendations && insight.recommendations.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</p>
                            <p className="text-sm">{insight.recommendations[0]}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => viewInsight(insight)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ThumbsUp className="h-4 w-4" />
                          Helpful
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedInsight && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    insightTypeConfig[selectedInsight.insight_type]?.color || 'bg-muted'
                  )}>
                    {(() => {
                      const Icon = insightTypeConfig[selectedInsight.insight_type]?.icon || Lightbulb;
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedInsight.title}</DialogTitle>
                    <DialogDescription>
                      Detected on {new Date(selectedInsight.detection_timestamp).toLocaleString()}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedInsight.description}</p>
                </div>

                {selectedInsight.affected_metrics && selectedInsight.affected_metrics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Affected Metrics</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInsight.affected_metrics.map((metric, idx) => (
                        <Badge key={idx} variant="outline">{metric}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInsight.recommendations && selectedInsight.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedInsight.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{selectedInsight.insight_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <p className="font-medium capitalize">{selectedInsight.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="font-medium">
                      {selectedInsight.confidence_score ? `${(selectedInsight.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Acknowledge
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <XCircle className="h-4 w-4" />
                    Dismiss
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
