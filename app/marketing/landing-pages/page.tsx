'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  MousePointer,
  Users,
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Layout,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface LandingPage {
  id: string;
  page_name: string;
  slug: string;
  page_status: string;
  view_count: number;
  conversion_count: number;
  conversion_rate: number;
  published_at: string;
}

export default function LandingPagesPage() {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const { data } = await supabase.from('landing_pages').select('*').order('created_at', { ascending: false });
      if (data) setPages(data);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockPages: LandingPage[] = pages.length > 0 ? pages : [
    { id: '1', page_name: 'Summer Sale 2026', slug: 'summer-sale-2026', page_status: 'published', view_count: 4520, conversion_count: 562, conversion_rate: 12.4, published_at: '2026-06-01' },
    { id: '2', page_name: 'Enterprise Solution', slug: 'enterprise-solutions', page_status: 'published', view_count: 3280, conversion_count: 285, conversion_rate: 8.7, published_at: '2026-05-15' },
    { id: '3', page_name: 'Free Trial Signup', slug: 'free-trial', page_status: 'published', view_count: 8920, conversion_count: 1425, conversion_rate: 16.0, published_at: '2026-04-01' },
    { id: '4', page_name: 'Product Launch', slug: 'product-launch-q3', page_status: 'draft', view_count: 0, conversion_count: 0, conversion_rate: 0, published_at: '' },
    { id: '5', page_name: 'Webinar Registration', slug: 'webinar-ai-marketing', page_status: 'published', view_count: 2150, conversion_count: 485, conversion_rate: 22.6, published_at: '2026-06-20' },
    { id: '6', page_name: 'Partnership Program', slug: 'partnership-program', page_status: 'archived', view_count: 1850, conversion_count: 95, conversion_rate: 5.1, published_at: '2026-03-01' },
  ];

  const filteredPages = mockPages.filter(p => p.page_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    totalPages: mockPages.length,
    published: mockPages.filter(p => p.page_status === 'published').length,
    draft: mockPages.filter(p => p.page_status === 'draft').length,
    totalViews: mockPages.reduce((sum, p) => sum + p.view_count, 0),
    totalConversions: mockPages.reduce((sum, p) => sum + p.conversion_count, 0),
    avgConversionRate: (mockPages.filter(p => p.conversion_rate > 0).reduce((sum, p) => sum + p.conversion_rate, 0) / mockPages.filter(p => p.conversion_rate > 0).length || 0).toFixed(1),
  };

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock },
    published: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
    archived: { color: 'bg-red-500/10 text-red-700', icon: FileText },
  };

  const templates = [
    { name: 'Lead Capture', icon: Users, description: 'Simple form-focused landing page' },
    { name: 'Webinar', icon: Layout, description: 'Event registration with countdown' },
    { name: 'Product Launch', icon: Sparkles, description: 'Hero section with video' },
    { name: 'Pricing', icon: BarChart3, description: 'Pricing table comparison' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Landing Page Builder"
        description="Create, edit, and optimize high-converting landing pages"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Landing Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Landing Page</DialogTitle>
                <DialogDescription>Choose a template or start from scratch</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {templates.map(t => (
                      <Card key={t.name} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <t.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., Summer Sale 2026" />
                  </div>
                  <div>
                    <Label>URL Slug</Label>
                    <Input className="mt-1.5" placeholder="summer-sale-2026" />
                  </div>
                </div>
                <div>
                  <Label>SEO Title</Label>
                  <Input className="mt-1.5" placeholder="Page title for search engines" />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea className="mt-1.5" placeholder="Brief description for SEO..." rows={2} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Page</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Pages', value: stats.totalPages, icon: Globe, color: 'text-blue-600' },
          { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Drafts', value: stats.draft, icon: Clock, color: 'text-gray-600' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-600' },
          { label: 'Conversions', value: stats.totalConversions.toLocaleString(), icon: MousePointer, color: 'text-orange-600' },
          { label: 'Avg Conv. Rate', value: `${stats.avgConversionRate}%`, icon: TrendingUp, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pages Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page, i) => {
          const status = statusConfig[page.page_status] || statusConfig.draft;
          const StatusIcon = status.icon;

          return (
            <motion.div key={page.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <Globe className="h-8 w-8 text-muted-foreground/50" />
                    <div className="absolute top-2 right-2">
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {page.page_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{page.page_name}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {page.page_status === 'published' && (
                          <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" /> View Live</DropdownMenuItem>
                        )}
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem><BarChart3 className="h-4 w-4 mr-2" /> Analytics</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {page.page_status === 'published' && (
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{page.view_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{page.conversion_count}</p>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{page.conversion_rate}%</p>
                        <p className="text-xs text-muted-foreground">Rate</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
