'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Video,
  HelpCircle,
  Shield,
  Rocket,
  Code,
  FolderOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Clock as ClockIcon,
  Archive,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Article {
  article_id: string;
  title: string;
  slug: string;
  summary: string;
  article_type: string;
  status: string;
  author_id: string;
  category_id: string;
  view_count: number;
  helpful_count: number;
  tags: string[];
  created_at: string;
  published_at: string;
}

interface Category {
  category_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const categoryIcons: Record<string, typeof BookOpen> = {
  rocket: Rocket,
  shield: Shield,
  'file-text': FileText,
  'help-circle': HelpCircle,
  book: BookOpen,
  code: Code,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700',
  pending_review: 'bg-yellow-500/10 text-yellow-700',
  approved: 'bg-green-500/10 text-green-700',
  archived: 'bg-purple-500/10 text-purple-700',
  deprecated: 'bg-red-500/10 text-red-700',
};

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        supabase.from('knowledge_articles').select('*').order('published_at', { ascending: false }),
        supabase.from('knowledge_categories').select('*').order('order_index'),
      ]);

      setArticles(articlesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const mockCategories = categories.length > 0 ? categories : [
    { category_id: '1', name: 'Getting Started', description: 'New user guides', icon: 'rocket', color: 'blue' },
    { category_id: '2', name: 'Policies', description: 'Company policies', icon: 'shield', color: 'purple' },
    { category_id: '3', name: 'SOPs', description: 'Standard procedures', icon: 'file-text', color: 'green' },
    { category_id: '4', name: 'FAQs', description: 'Common questions', icon: 'help-circle', color: 'yellow' },
    { category_id: '5', name: 'Training', description: 'Learning materials', icon: 'book', color: 'cyan' },
    { category_id: '6', name: 'Technical', description: 'Technical docs', icon: 'code', color: 'orange' },
  ];

  const mockArticles = articles.length > 0 ? articles : [
    { article_id: '1', title: 'Getting Started with WebHoster OS', slug: 'getting-started', summary: 'Complete guide for new users to get started with the platform', article_type: 'article', status: 'approved', author_id: 'u1', category_id: '1', view_count: 1245, helpful_count: 89, tags: ['onboarding', 'guide'], created_at: new Date().toISOString(), published_at: new Date().toISOString() },
    { article_id: '2', title: 'Data Security Policy', slug: 'data-security', summary: 'Comprehensive data security and privacy policy guidelines', article_type: 'policy', status: 'approved', author_id: 'u2', category_id: '2', view_count: 856, helpful_count: 45, tags: ['security', 'compliance'], created_at: new Date().toISOString(), published_at: new Date().toISOString() },
    { article_id: '3', title: 'Invoice Processing SOP', slug: 'invoice-sop', summary: 'Step-by-step process for creating and managing invoices', article_type: 'sop', status: 'approved', author_id: 'u1', category_id: '3', view_count: 534, helpful_count: 67, tags: ['finance', 'invoices'], created_at: new Date().toISOString(), published_at: new Date().toISOString() },
    { article_id: '4', title: 'How to Reset Your Password', slug: 'password-reset', summary: 'Instructions for password reset and account recovery', article_type: 'faq', status: 'approved', author_id: 'u3', category_id: '4', view_count: 2103, helpful_count: 156, tags: ['account', 'security'], created_at: new Date().toISOString(), published_at: new Date().toISOString() },
    { article_id: '5', title: 'AI Features Training', slug: 'ai-training', summary: 'Learn how to use AI features effectively', article_type: 'training', status: 'draft', author_id: 'u2', category_id: '5', view_count: 0, helpful_count: 0, tags: ['ai', 'training'], created_at: new Date().toISOString(), published_at: new Date(Date.now() + 86400000).toISOString() },
    { article_id: '6', title: 'API Integration Guide', slug: 'api-guide', summary: 'Technical documentation for API integration', article_type: 'article', status: 'approved', author_id: 'u1', category_id: '6', view_count: 678, helpful_count: 34, tags: ['api', 'development'], created_at: new Date().toISOString(), published_at: new Date().toISOString() },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Knowledge Base"
        description="Central hub for articles, policies, SOPs, and training materials"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Knowledge Article</DialogTitle>
                <DialogDescription>
                  Write a new article for the knowledge base
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1.5" placeholder="Article title" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(cat => (
                        <SelectItem key={cat.category_id} value={cat.category_id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Article Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="sop">SOP</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Summary</Label>
                  <Textarea className="mt-1.5" placeholder="Brief summary..." rows={2} />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea className="mt-1.5" placeholder="Write your article content..." rows={6} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button variant="outline">Save Draft</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Submit for Review</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Categories */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {mockCategories.map((category, i) => {
          const Icon = categoryIcons[category.icon] || BookOpen;
          const colorClass = category.color === 'blue' ? 'text-blue-600 bg-blue-500/10' :
            category.color === 'purple' ? 'text-purple-600 bg-purple-500/10' :
            category.color === 'green' ? 'text-green-600 bg-green-500/10' :
            category.color === 'yellow' ? 'text-yellow-600 bg-yellow-500/10' :
            category.color === 'cyan' ? 'text-cyan-600 bg-cyan-500/10' :
            'text-orange-600 bg-orange-500/10';

          return (
            <motion.div
              key={category.category_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn("cursor-pointer hover:shadow-md transition-shadow", selectedCategory === category.category_id && "ring-2 ring-primary")}
                onClick={() => setSelectedCategory(category.category_id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={cn("w-10 h-10 rounded-lg mx-auto flex items-center justify-center", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-2 font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mockArticles.filter(a => a.category_id === category.category_id).length} articles</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedCategory('all')}>
          <Filter className="h-4 w-4" />
          All Articles
        </Button>

        <div className="ml-auto flex items-center gap-1 border rounded-lg p-1">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Articles */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl shimmer" />)}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockArticles.filter(a => selectedCategory === 'all' || a.category_id === selectedCategory).map((article, i) => (
              <motion.div
                key={article.article_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={statusColors[article.status] || statusColors.draft}>
                          {article.status.replace('_', ' ')}
                        </Badge>
                        <CardTitle className="text-base mt-2">{article.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{article.summary}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags?.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {article.view_count}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        {article.helpful_count}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockArticles.filter(a => selectedCategory === 'all' || a.category_id === selectedCategory).map((article, i) => (
                  <motion.div
                    key={article.article_id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{article.title}</p>
                          <Badge className={statusColors[article.status] || statusColors.draft}>
                            {article.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{article.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {article.view_count}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful_count}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
