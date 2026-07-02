'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Cpu,
  Database,
  DollarSign,
  Zap,
  Shield,
  FileSearch,
  BarChart3,
  MessageSquare,
  Settings,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
  BookOpen,
  Target,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type AIProvider = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type AIModel = {
  id: string;
  name: string;
  model_id: string;
  model_type: string;
  is_active: boolean;
};

type PromptCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export default function AIPlatformPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);
  const [stats, setStats] = useState({
    totalProviders: 0,
    activeModels: 0,
    totalPrompts: 0,
    knowledgeSources: 0,
    todayRequests: 0,
    monthlyCost: 0,
    avgLatency: 0,
    successRate: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    const [providersRes, modelsRes, categoriesRes, promptsRes, sourcesRes] = await Promise.all([
      supabase.from('ai_providers').select('id, name, slug, is_active'),
      supabase.from('ai_models').select('id, name, model_id, model_type, is_active'),
      supabase.from('prompt_categories').select('id, name, slug, icon').order('sort_order'),
      supabase.from('prompts').select('id', { count: 'exact', head: true }),
      supabase.from('knowledge_sources').select('id', { count: 'exact', head: true }),
    ]);

    if (providersRes.data) setProviders(providersRes.data);
    if (modelsRes.data) setModels(modelsRes.data);
    if (categoriesRes.data) setPromptCategories(categoriesRes.data);

    setStats({
      totalProviders: providersRes.data?.length || 0,
      activeModels: modelsRes.data?.filter(m => m.is_active).length || 0,
      totalPrompts: promptsRes.count || 0,
      knowledgeSources: sourcesRes.count || 0,
      todayRequests: 2847,
      monthlyCost: 127.45,
      avgLatency: 1240,
      successRate: 99.2,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const platformModules = [
    {
      title: 'Model Router',
      description: 'Intelligent model selection based on task, cost, and performance',
      icon: Cpu,
      href: '/ai-platform/model-router',
      color: 'from-blue-500/20 to-cyan-500/20',
      stats: `${stats.activeModels} models`,
    },
    {
      title: 'Prompt Library',
      description: 'Centralized prompt management with versioning and approval',
      icon: BookOpen,
      href: '/ai-platform/prompts',
      color: 'from-purple-500/20 to-pink-500/20',
      stats: `${stats.totalPrompts} prompts`,
    },
    {
      title: 'RAG Knowledge',
      description: 'Document upload, chunking, embeddings, and semantic retrieval',
      icon: Database,
      href: '/ai-platform/knowledge',
      color: 'from-emerald-500/20 to-teal-500/20',
      stats: `${stats.knowledgeSources} sources`,
    },
    {
      title: 'Memory Engine',
      description: 'Multi-layer memory: session, user, customer, organization',
      icon: Layers,
      href: '/ai-platform/memory',
      color: 'from-orange-500/20 to-amber-500/20',
      stats: '7 layers',
    },
    {
      title: 'Vector Search',
      description: 'Semantic search across all business entities',
      icon: FileSearch,
      href: '/ai-platform/vector-search',
      color: 'from-rose-500/20 to-red-500/20',
      stats: 'Hybrid search',
    },
    {
      title: 'AI Guardrails',
      description: 'Security filters, prompt injection detection, PII protection',
      icon: Shield,
      href: '/ai-platform/guardrails',
      color: 'from-yellow-500/20 to-orange-500/20',
      stats: '5 active',
    },
    {
      title: 'Document Intelligence',
      description: 'OCR, entity extraction, classification, and form processing',
      icon: FileSearch,
      href: '/ai-platform/document-intelligence',
      color: 'from-indigo-500/20 to-violet-500/20',
      stats: 'Smart extraction',
    },
    {
      title: 'Evaluation',
      description: 'Quality metrics, grounding scores, and performance tracking',
      icon: Target,
      href: '/ai-platform/evaluation',
      color: 'from-cyan-500/20 to-blue-500/20',
      stats: '8 metrics',
    },
    {
      title: 'Cost Management',
      description: 'Budget tracking, usage analytics, and optimization',
      icon: DollarSign,
      href: '/ai-platform/costs',
      color: 'from-green-500/20 to-emerald-500/20',
      stats: `$${stats.monthlyCost}/mo`,
    },
    {
      title: 'Observability',
      description: 'Real-time monitoring, logging, and performance dashboards',
      icon: Activity,
      href: '/ai-platform/observability',
      color: 'from-pink-500/20 to-rose-500/20',
      stats: 'Live metrics',
    },
    {
      title: 'Approvals',
      description: 'Human-in-the-loop for high-impact AI actions',
      icon: CheckCircle,
      href: '/ai-platform/approvals',
      color: 'from-sky-500/20 to-blue-500/20',
      stats: '4 workflows',
    },
  ];

  const modelTypeLabels: Record<string, string> = {
    chat: 'Chat',
    embedding: 'Embedding',
    completion: 'Completion',
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Platform"
        description="Enterprise AI infrastructure powering intelligent features"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Test Router
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Providers', value: stats.totalProviders, icon: Cpu },
          { label: 'Active Models', value: stats.activeModels, icon: Brain },
          { label: 'Today Requests', value: stats.todayRequests.toLocaleString(), icon: MessageSquare },
          { label: 'Monthly Cost', value: `$${stats.monthlyCost}`, icon: DollarSign },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Bar */}
      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{stats.avgLatency}ms</p>
              <p className="text-xs text-muted-foreground">Avg Latency</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">1.2M</p>
              <p className="text-xs text-muted-foreground">Tokens Today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">850</p>
              <p className="text-xs text-muted-foreground">Vectors Created</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Providers Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Connected Providers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)
          ) : (
            providers.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{provider.name}</h3>
                  <Badge variant={provider.is_active ? 'default' : 'outline'} className={provider.is_active ? 'bg-success/20 text-success' : ''}>
                    {provider.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {models.filter(m => m.model_id.includes(provider.slug === 'openai' ? 'gpt' : provider.slug === 'anthropic' ? 'claude' : 'gemini')).length} models available
                </p>
                <div className="flex flex-wrap gap-1">
                  {models
                    .filter(m => m.model_id.includes(provider.slug === 'openai' ? 'gpt' : provider.slug === 'anthropic' ? 'claude' : 'gemini'))
                    .slice(0, 3)
                    .map(m => (
                      <Badge key={m.id} variant="secondary" className="text-[9px]">
                        {m.name}
                      </Badge>
                    ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Platform Modules */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Platform Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platformModules.map((module, i) => (
            <Link key={module.href} href={module.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-5 premium-shadow group hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-3`}>
                  <module.icon className="h-6 w-6 text-foreground/70" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{module.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{module.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{module.stats}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Prompt Categories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Prompt Categories</h2>
          <Link href="/ai-platform/prompts">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            [...Array(8)].map((_, i) => <div key={i} className="h-8 w-24 rounded-lg shimmer" />)
          ) : (
            promptCategories.slice(0, 10).map((cat) => (
              <Link key={cat.id} href={`/ai-platform/prompts?category=${cat.slug}`}>
                <Badge variant="secondary" className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat.name}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* AI Request Pipeline */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">AI Request Pipeline</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {[
            { label: 'Auth', icon: Shield },
            { label: 'Prompt', icon: BookOpen },
            { label: 'Context', icon: Database },
            { label: 'Knowledge', icon: FileSearch },
            { label: 'Router', icon: Cpu },
            { label: 'Validate', icon: CheckCircle },
            { label: 'Memory', icon: Layers },
            { label: 'Audit', icon: Activity },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-2">
                  <step.icon className="h-5 w-5 text-cyan-600" />
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </motion.div>
              {i < 7 && (
                <div className="w-8 h-0.5 bg-border mx-2 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
