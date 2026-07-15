'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  DollarSign,
  Zap,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  PieChart,
  Users,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type AIUsageLog = {
  id: string;
  model_name: string;
  provider: string;
  operation: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  request_type: string;
  user_id: string;
  session_id: string;
  request_duration_ms: number;
  success: boolean;
  created_at: string;
};

type AIConversation = {
  id: string;
  user_id: string;
  agent_type: string;
  title: string;
  message_count: number;
  total_tokens: number;
  total_cost: number;
  satisfaction_rating: number | null;
  started_at: string;
  ended_at: string | null;
};

type PromptTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_at: string;
};

type ContentReview = {
  id: string;
  conversation_id: string;
  message_id: string;
  content_type: string;
  content: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
};

export default function AIUsagePage() {
  const [loading, setLoading] = useState(true);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateDialog, setTemplateDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [logsRes, convRes, templatesRes, reviewsRes] = await Promise.all([
      supabase.from('ai_usage_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('ai_conversations').select('*').order('started_at', { ascending: false }).limit(50),
      supabase.from('prompt_templates').select('*').eq('is_active', true).order('name'),
      supabase.from('ai_content_reviews').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (logsRes.data) setUsageLogs(logsRes.data);
    if (convRes.data) setConversations(convRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);

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

  // Calculate stats
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const todayLogs = usageLogs.filter(l => new Date(l.created_at).toDateString() === today);
  const monthLogs = usageLogs.filter(l => {
    const d = new Date(l.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const todayTokens = todayLogs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
  const todayCost = todayLogs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);
  const monthTokens = monthLogs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
  const monthCost = monthLogs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);

  const successRate = usageLogs.length > 0
    ? Math.round((usageLogs.filter(l => l.success).length / usageLogs.length) * 100)
    : 100;

  const avgLatency = usageLogs.length > 0
    ? Math.round(usageLogs.reduce((sum, l) => sum + (l.request_duration_ms || 0), 0) / usageLogs.length)
    : 0;

  // Group by model
  const modelUsage: Record<string, { count: number; tokens: number; cost: number }> = {};
  usageLogs.forEach(l => {
    if (!modelUsage[l.model_name]) modelUsage[l.model_name] = { count: 0, tokens: 0, cost: 0 };
    modelUsage[l.model_name].count++;
    modelUsage[l.model_name].tokens += l.total_tokens || 0;
    modelUsage[l.model_name].cost += l.cost_usd || 0;
  });

  // Group by operation type
  const operationUsage: Record<string, number> = {};
  usageLogs.forEach(l => {
    operationUsage[l.operation] = (operationUsage[l.operation] || 0) + 1;
  });

  const filteredLogs = usageLogs.filter(l =>
    l.model_name.toLowerCase().includes(search.toLowerCase()) ||
    l.operation.toLowerCase().includes(search.toLowerCase()) ||
    l.request_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        title="AI Usage & Governance"
        description="Monitor AI model usage, costs, and content quality"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Today Tokens</span>
          </div>
          <p className="text-2xl font-bold">{(todayTokens / 1000).toFixed(1)}K</p>
          <p className="text-xs text-muted-foreground">{todayLogs.length} requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Today Cost</span>
          </div>
          <p className="text-2xl font-bold">₹{todayCost.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Month Tokens</span>
          </div>
          <p className="text-2xl font-bold">{(monthTokens / 1000).toFixed(1)}K</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Month Cost</span>
          </div>
          <p className="text-2xl font-bold">₹{monthCost.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Success Rate</span>
          </div>
          <p className="text-2xl font-bold">{successRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Avg Latency</span>
          </div>
          <p className="text-2xl font-bold">{avgLatency}ms</p>
        </motion.div>
      </div>

      {/* Budget Progress */}
      <div className="glass-card p-4 premium-shadow mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Monthly Budget</h3>
          <span className="text-sm text-muted-foreground">₹{monthCost.toFixed(2)} / ₹100.00</span>
        </div>
        <Progress value={Math.min((monthCost / 100) * 100, 100)} className="h-3" />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{((monthCost / 100) * 100).toFixed(1)}% used</span>
          <span>₹{(100 - monthCost).toFixed(2)} remaining</span>
        </div>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="usage" className="rounded-lg">Usage Logs</TabsTrigger>
          <TabsTrigger value="conversations" className="rounded-lg">Conversations</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Prompt Templates</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg">Content Reviews</TabsTrigger>
        </TabsList>

        {/* Usage Logs Tab */}
        <TabsContent value="usage" className="mt-0">
          <div className="glass-card p-4 premium-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search usage logs..." className="pl-9" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}</div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No usage logs found</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredLogs.slice(0, 50).map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      log.success ? 'bg-success/10' : 'bg-destructive/10'
                    )}>
                      {log.success ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{log.model_name}</span>
                        <Badge variant="outline" className="text-[9px]">{log.operation}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.prompt_tokens} prompt + {log.completion_tokens} completion = {log.total_tokens} tokens
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">₹{(log.cost_usd * 83).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{log.request_duration_ms}ms</p>
                    </div>
                    <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Model Usage Chart */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Usage by Model
              </h3>
              <div className="space-y-3">
                {Object.entries(modelUsage).map(([model, data]) => (
                  <div key={model} className="flex items-center gap-3">
                    <span className="text-sm font-medium truncate flex-1">{model}</span>
                    <div className="flex-1">
                      <Progress value={(data.tokens / monthTokens) * 100} className="h-2" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium">{(data.tokens / 1000).toFixed(1)}K</span>
                      <span className="text-xs text-muted-foreground ml-2">₹{data.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Conversations
              </h3>
              {conversations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {conversations.slice(0, 10).map((conv, i) => (
                    <div key={conv.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{conv.title || 'Untitled'}</span>
                        <Badge variant="outline" className="text-[9px]">{conv.agent_type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{conv.message_count} messages</span>
                        <span>{(conv.total_tokens / 1000).toFixed(1)}K tokens</span>
                        {conv.satisfaction_rating && (
                          <span className="text-yellow-500">★ {conv.satisfaction_rating}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Prompt Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 premium-shadow cursor-pointer hover:shadow-lg transition-all"
                onClick={() => { setSelectedTemplate(template); setTemplateDialog(true); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm truncate">{template.name}</span>
                  <Badge variant="outline" className="text-[10px]">v{template.version}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{template.category}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {template.variables?.slice(0, 4).map((v: string) => (
                    <Badge key={v} variant="secondary" className="text-[9px]">{'{{' + v + '}}'}</Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Content Reviews Tab */}
        <TabsContent value="reviews" className="mt-0">
          <div className="glass-card p-4 premium-shadow">
            <h3 className="font-semibold mb-4">AI Content Review Queue</h3>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                <p className="text-sm font-medium">No content pending review</p>
                <p className="text-xs text-muted-foreground">All AI outputs are approved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={review.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          'text-[10px]',
                          review.review_status === 'approved' ? 'bg-success/10 text-success' :
                          review.review_status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          review.review_status === 'flagged' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {review.review_status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{review.content_type}</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </div>
                    <p className="text-sm line-clamp-2">{review.content}</p>
                    {review.reviewed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed: {new Date(review.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">{selectedTemplate.category}</p>
                <p className="text-sm mt-1">{selectedTemplate.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Template</p>
                <pre className="p-4 rounded-lg bg-muted text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-64">
                  {selectedTemplate.template}
                </pre>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables?.map((v: string) => (
                  <Badge key={v} variant="secondary">{'{{' + v + '}}'}</Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>Close</Button>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
