'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Copy,
  Eye,
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Play,
  Code,
  FileText,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type PromptCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

type Prompt = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  variables: string[];
  default_values: Record<string, any>;
  version: number;
  approval_status: string;
  usage_count: number;
  avg_latency_ms: number | null;
  avg_rating: number | null;
  is_active: boolean;
  created_at: string;
};

export default function PromptLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>({});

  const loadData = useCallback(async () => {
    setLoading(true);

    const [categoriesRes, promptsRes] = await Promise.all([
      supabase.from('prompt_categories').select('*').order('sort_order'),
      supabase.from('prompts').select('*').order('usage_count', { ascending: false }),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (promptsRes.data) setPrompts(promptsRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || 'FileText';
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(search.toLowerCase()) ||
                          prompt.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || prompt.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyPrompt = async (prompt: Prompt) => {
    let content = prompt.content;

    // Replace variables with preview values or placeholders
    if (prompt.variables && Array.isArray(prompt.variables)) {
      prompt.variables.forEach((v: string) => {
        const value = previewVariables[v] || `{{${v}}}`;
        const pattern = `{{${v}}}`;
        content = content.split(pattern).join(value);
      });
    }

    await navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard');
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/20 text-success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPreview = (prompt: Prompt) => {
    let content = prompt.content;
    if (prompt.variables && Array.isArray(prompt.variables)) {
      prompt.variables.forEach((v: string) => {
        const value = previewVariables[v] || `{{${v}}}`;
        content = content.split(`{{${v}}}`).join(value);
      });
    }
    return content;
  };

  return (
    <AppShell>
      <PageHeader
        title="Prompt Library"
        description="Centralized prompt management with versioning and approval workflows"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Prompt
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Prompts', value: prompts.length, icon: BookOpen },
          { label: 'Categories', value: categories.length, icon: FileText },
          { label: 'Approved', value: prompts.filter(p => p.approval_status === 'approved').length, icon: CheckCircle },
          { label: 'Total Uses', value: prompts.reduce((acc, p) => acc + (p.usage_count || 0), 0).toLocaleString(), icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            <BookOpen className="h-4 w-4" />
            All Prompts
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="pl-9"
        />
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No prompts found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => { setSelectedPrompt(prompt); setDetailOpen(true); }}
              className="glass-card overflow-hidden p-5 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{prompt.name}</h3>
                  <p className="text-xs text-muted-foreground">{getCategoryName(prompt.category_id)}</p>
                </div>
                {getApprovalBadge(prompt.approval_status)}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{prompt.description}</p>

              {/* Variables */}
              {prompt.variables && Array.isArray(prompt.variables) && prompt.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {prompt.variables.slice(0, 4).map((v: string) => (
                    <Badge key={v} variant="outline" className="text-[9px] font-mono">{v}</Badge>
                  ))}
                  {prompt.variables.length > 4 && (
                    <Badge variant="outline" className="text-[9px]">+{prompt.variables.length - 4}</Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {prompt.avg_rating?.toFixed(1) || 'N/A'}
                  </span>
                  <span>{prompt.usage_count || 0} uses</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); copyPrompt(prompt); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Prompt Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPrompt?.name}
              <Badge variant="outline">v{selectedPrompt?.version}</Badge>
              {selectedPrompt && getApprovalBadge(selectedPrompt.approval_status)}
            </DialogTitle>
          </DialogHeader>
          {selectedPrompt && (
            <Tabs defaultValue="content" className="mt-4">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">{selectedPrompt.description}</p>

                  {/* Variables Section */}
                  {selectedPrompt.variables && Array.isArray(selectedPrompt.variables) && selectedPrompt.variables.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Variables</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPrompt.variables.map((v: string) => (
                          <div key={v} className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">{'{{' + v + '}}'}</span>
                            <Input
                              placeholder={selectedPrompt.default_values?.[v] || v}
                              value={previewVariables[v] || ''}
                              onChange={(e) => setPreviewVariables(prev => ({ ...prev, [v]: e.target.value }))}
                              className="flex-1 h-8"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Prompt Content</p>
                      <Button variant="ghost" size="sm" onClick={() => copyPrompt(selectedPrompt)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                      {selectedPrompt.content}
                    </pre>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Usage</p>
                    <p className="font-bold">{selectedPrompt.usage_count || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                    <p className="font-bold">{selectedPrompt.avg_latency_ms ? `${selectedPrompt.avg_latency_ms}ms` : 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-bold">{selectedPrompt.avg_rating?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Version</p>
                    <p className="font-bold">{selectedPrompt.version}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 gap-2">
                    <Play className="h-4 w-4" />
                    Test Prompt
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div>
                  <p className="text-sm font-medium mb-2">Rendered Preview</p>
                  <div
                    className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderPreview(selectedPrompt) }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Version History</p>
                  <p className="text-sm text-muted-foreground">Version {selectedPrompt.version} - Created {new Date(selectedPrompt.created_at).toLocaleDateString()}</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
