'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Search,
  Star,
  Download,
  Sparkles,
  Brain,
  MessageSquare,
  BarChart3,
  Shield,
  Users,
  FileText,
  Globe,
  Zap,
  CheckCircle,
  Settings,
  Play,
  Info,
  Crown,
  Cpu,
  BookOpen,
  Target,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

type AIAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  capabilities: string[];
  languages_supported: string[];
  required_permissions: string[];
  required_integrations: string[];
  knowledge_sources: string[];
  config_schema: any;
  default_config: any;
  price: number;
  is_free: boolean;
  is_verified: boolean;
  is_published: boolean;
  icon_url: string;
  documentation_url: string;
  rating_average: number;
  rating_count: number;
  install_count: number;
  tags: string[];
  created_at: string;
};

const categoryIcons: Record<string, typeof Bot> = {
  finance: BarChart3,
  hr: Users,
  marketing: Target,
  analytics: BarChart3,
  legal: Shield,
  crm: Users,
  support: MessageSquare,
  operations: Cpu,
};

export default function AIAgentStorePage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [installing, setInstalling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('ai_agent_listings')
      .select('*')
      .eq('is_published', true)
      .order('install_count', { ascending: false })
      .limit(50);

    if (data) setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const installAgent = async (agent: AIAgent) => {
    setInstalling(true);

    const { error } = await supabase.from('installed_ai_agents').insert({
      agent_id: agent.id,
      config: agent.default_config || {},
      status: 'active',
    });

    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from('ai_agent_listings').update({
        install_count: (agent.install_count || 0) + 1,
      }).eq('id', agent.id);

      toast.success(`${agent.name} installed successfully!`);
      setDetailDialog(false);
      loadData();
    }

    setInstalling(false);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
                          agent.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(agents.map(a => a.category).filter(Boolean)));

  return (
    <AppShell>
      <PageHeader
        title="AI Agent Store"
        description="Install specialized AI assistants for your business"
        action={
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Agent SDK
          </Button>
        }
      />

      {/* Featured Agents */}
      {agents.filter(a => a.is_verified).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Verified AI Agents
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.filter(a => a.is_verified).slice(0, 3).map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 premium-shadow cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => { setSelectedAgent(agent); setDetailDialog(true); }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bot className="h-7 w-7 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">{agent.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{agent.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agent.capabilities?.slice(0, 3).map((cap: string) => (
                    <Badge key={cap} variant="secondary" className="text-[9px] capitalize">{cap.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {agent.rating_average?.toFixed(1) || '0.0'}
                    </span>
                    <span>{agent.install_count || 0} installs</span>
                  </div>
                  {agent.is_free ? (
                    <Badge className="bg-success/10 text-success">Free</Badge>
                  ) : (
                    <span className="font-bold">${agent.price}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Bot className="h-4 w-4" />
            All Agents
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Bot;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 capitalize',
                  selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
              >
                <Icon className="h-4 w-4" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search AI agents..."
          className="pl-9"
        />
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 rounded-2xl shimmer" />)}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No AI agents found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card overflow-hidden premium-shadow group hover:shadow-lg transition-all cursor-pointer"
              onClick={() => { setSelectedAgent(agent); setDetailDialog(true); }}
            >
              <div className="h-28 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center relative">
                <Bot className="h-10 w-10 text-purple-500/50" />
                {agent.is_free ? (
                  <Badge className="absolute top-2 right-2 bg-success/90">Free</Badge>
                ) : agent.price > 0 ? (
                  <Badge className="absolute top-2 right-2 bg-purple-500/90">${agent.price}</Badge>
                ) : null}
                {agent.is_verified && (
                  <Badge className="absolute top-2 left-2 bg-blue-500/90">
                    <CheckCircle className="h-3 w-3 mr-0.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.short_description || agent.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.capabilities?.slice(0, 2).map((cap: string) => (
                    <Badge key={cap} variant="outline" className="text-[9px] capitalize">{cap.replace(/_/g, ' ')}</Badge>
                  ))}
                  {agent.capabilities?.length > 2 && (
                    <Badge variant="outline" className="text-[9px]">+{agent.capabilities.length - 2}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-medium">{agent.rating_average?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{agent.install_count || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Agent Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAgent?.name}
              {selectedAgent?.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
            </DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-bold">{selectedAgent.rating_average?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Download className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Installs</p>
                  <p className="font-bold">{selectedAgent.install_count || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Globe className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Languages</p>
                  <p className="font-bold">{selectedAgent.languages_supported?.length || 1}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  {selectedAgent.is_free ? (
                    <>
                      <Sparkles className="h-4 w-4 mx-auto mb-1 text-success" />
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-bold text-success">Free</p>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">$</span>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-bold">${selectedAgent.price}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities?.map((cap: string) => (
                    <Badge key={cap} variant="secondary" className="capitalize">{cap.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Required Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.required_permissions?.length > 0 ? (
                    selectedAgent.required_permissions.map((perm: string) => (
                      <Badge key={perm} variant="outline" className="capitalize">{perm.replace(/_/g, ' ')}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No special permissions required</span>
                  )}
                </div>
              </div>

              {selectedAgent.knowledge_sources?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Knowledge Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.knowledge_sources.map((src: string) => (
                      <Badge key={src} variant="outline">{src}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => installAgent(selectedAgent)}
                  disabled={installing}
                >
                  {installing ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {selectedAgent.is_free ? 'Install Free' : `Install $${selectedAgent.price}`}
                    </>
                  )}
                </Button>
                {selectedAgent.documentation_url && (
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Docs
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
