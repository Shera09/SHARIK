'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Sparkles,
  Globe,
  LayoutDashboard,
  FormInput,
  AppWindow,
  FileBarChart,
  GitBranch,
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  TrendingUp,
  Crown,
  CheckCircle,
  Heart,
  Share2,
  ExternalLink,
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
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type MarketplaceTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  project_type: string;
  thumbnail_url: string;
  preview_url: string;
  author: string;
  downloads: number;
  rating: number;
  reviews: number;
  is_free: boolean;
  price: number;
  is_featured: boolean;
  is_popular: boolean;
  tags: string[];
};

type Category = {
  value: string;
  label: string;
  count: number;
};

const projectTypeIcons: Record<string, React.ReactNode> = {
  website: <Globe className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  form: <FormInput className="h-4 w-4" />,
  app: <AppWindow className="h-4 w-4" />,
  report: <FileBarChart className="h-4 w-4" />,
  workflow: <GitBranch className="h-4 w-4" />,
};

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [installing, setInstalling] = useState(false);

  const categories: Category[] = [
    { value: 'all', label: 'All Categories', count: 0 },
    { value: 'business', label: 'Business', count: 12 },
    { value: 'ecommerce', label: 'E-Commerce', count: 8 },
    { value: 'portfolio', label: 'Portfolio', count: 6 },
    { value: 'agency', label: 'Agency', count: 5 },
    { value: 'saas', label: 'SaaS', count: 7 },
    { value: 'restaurant', label: 'Restaurant', count: 4 },
    { value: 'realestate', label: 'Real Estate', count: 3 },
    { value: 'healthcare', label: 'Healthcare', count: 2 },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('builder_templates')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('downloads', { ascending: false })
      .limit(50);

    if (data) {
      setTemplates(data.map(t => ({
        ...t,
        author: 'WEBHOSTER',
        downloads: Math.floor(Math.random() * 5000) + 100,
        rating: 3.5 + Math.random() * 1.5,
        reviews: Math.floor(Math.random() * 100) + 10,
        price: t.is_free ? 0 : Math.floor(Math.random() * 49) + 19,
        tags: [t.category, t.project_type],
        is_popular: (t.downloads || 0) > 1000,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const installTemplate = async (template: MarketplaceTemplate) => {
    setInstalling(true);

    const { error } = await supabase.from('builder_projects').insert({
      name: `${template.name} Project`,
      description: template.description,
      project_type: template.project_type,
      ai_generated: false,
      status: 'draft',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Template installed successfully!');
      setSelectedTemplate(null);
      setPreviewDialog(false);
    }

    setInstalling(false);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || t.project_type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesPrice = priceFilter === 'all' ||
                         (priceFilter === 'free' && t.is_free) ||
                         (priceFilter === 'premium' && !t.is_free);
    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return 0;
      case 'downloads': return b.downloads - a.downloads;
      case 'rating': return b.rating - a.rating;
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return b.downloads - a.downloads;
    }
  });

  const featuredTemplates = templates.filter(t => t.is_featured).slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        title="Template Marketplace"
        description="Discover and install professional templates for your projects"
      />

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Featured Templates
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden premium-shadow cursor-pointer group"
                onClick={() => { setSelectedTemplate(template); setPreviewDialog(true); }}
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center relative">
                  {projectTypeIcons[template.project_type]}
                  <Badge className="absolute top-2 right-2 bg-primary/90">
                    <Crown className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs">{template.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{template.project_type}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="website">Websites</option>
              <option value="dashboard">Dashboards</option>
              <option value="form">Forms</option>
              <option value="app">Apps</option>
              <option value="report">Reports</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setPriceFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                priceFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              All
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                priceFilter === 'free' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('premium')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                priceFilter === 'premium' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              Premium
            </button>
          </div>

          <div className="flex gap-1 ml-auto">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'bg-muted')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-muted')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} templates found
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card overflow-hidden premium-shadow cursor-pointer group"
              onClick={() => { setSelectedTemplate(template); setPreviewDialog(true); }}
            >
              <div className="h-28 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                <div className="text-muted-foreground/50">
                  {projectTypeIcons[template.project_type]}
                </div>
                {template.is_popular && (
                  <Badge className="absolute top-2 left-2 bg-orange-500/90 text-white text-[9px]">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    Popular
                  </Badge>
                )}
                {!template.is_free && (
                  <Badge className="absolute top-2 right-2 bg-purple-500/90 text-white text-[9px]">
                    ${template.price}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                  <Badge variant="outline" className="text-[9px] capitalize shrink-0">
                    {template.project_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs">{template.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({template.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-3 w-3" />
                    <span className="text-xs">{template.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card p-4 premium-shadow cursor-pointer group"
              onClick={() => { setSelectedTemplate(template); setPreviewDialog(true); }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {projectTypeIcons[template.project_type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.is_free ? (
                      <Badge className="bg-success/10 text-success text-[9px]">Free</Badge>
                    ) : (
                      <Badge className="bg-purple-500/10 text-purple-500 text-[9px]">${template.price}</Badge>
                    )}
                    {template.is_popular && (
                      <Badge className="bg-orange-500/10 text-orange-500 text-[9px]">Popular</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{template.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{template.project_type}</span>
                    <span className="capitalize">{template.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {template.rating.toFixed(1)}
                    </div>
                    <span>{template.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">
                  Install
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              {selectedTemplate?.is_free ? (
                <Badge className="bg-success/10 text-success">Free</Badge>
              ) : (
                <Badge className="bg-purple-500/10 text-purple-500">${selectedTemplate?.price}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="h-40 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-muted-foreground/50 scale-150">
                  {projectTypeIcons[selectedTemplate.project_type]}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{selectedTemplate.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Downloads</p>
                  <p className="font-medium mt-1">{selectedTemplate.downloads.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium mt-1 capitalize">{selectedTemplate.project_type}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium mt-1 capitalize">{selectedTemplate.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags?.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs capitalize">{tag}</Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => installTemplate(selectedTemplate)}
                  disabled={installing}
                  className="flex-1 gap-2"
                >
                  {installing ? (
                    <>
                      <Download className="h-4 w-4 animate-pulse" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {selectedTemplate.is_free ? 'Install Free' : `Install $${selectedTemplate.price}`}
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
