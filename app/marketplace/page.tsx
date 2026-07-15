'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Search,
  Filter,
  Star,
  Download,
  Plug,
  Bot,
  Palette,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Crown,
  Zap,
  Users,
  BarChart3,
  Globe,
  Shield,
  Layers,
  ChevronRight,
  Grid3X3,
  List,
  SortAsc,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type MarketplaceApp = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  icon_url: string;
  banner_url: string;
  screenshots: any[];
  is_free: boolean;
  price: number;
  price_type: string;
  subscription_price_monthly: number;
  subscription_price_yearly: number;
  trial_days: number;
  is_verified: boolean;
  is_featured: boolean;
  installs_count: number;
  rating: number;
  ratings_count: number;
  developer_name: string;
  permissions: string[];
  capabilities: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  app_count: number;
};

const categoryIcons: Record<string, typeof Users> = {
  'CRM Extensions': Users,
  'Accounting': BarChart3,
  'GST Tools': FileText,
  'HR & Payroll': Users,
  'Loan Processing': Globe,
  'Legal': Shield,
  'Marketing': TrendingUp,
  'AI Tools': Sparkles,
  'Automation Packs': Zap,
  'Analytics': BarChart3,
  'Dashboards': Layers,
  'Themes': Palette,
  'Widgets': Grid3X3,
  'Reports': FileText,
  'Integrations': Plug,
  'Industry Templates': Globe,
};

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = useCallback(async () => {
    setLoading(true);

    const [appsRes, categoriesRes] = await Promise.all([
      supabase.from('marketplace_apps').select('*').eq('is_active', true).order('installs_count', { ascending: false }).limit(50),
      supabase.from('marketplace_categories').select('*').order('sort_order'),
    ]);

    if (appsRes.data) setApps(appsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const installApp = async (app: MarketplaceApp) => {
    toast.success(`Installing ${app.name}...`);

    await supabase.from('installed_apps').insert({
      app_id: app.id,
      version: '1.0.0',
      status: 'active',
    });

    await supabase.from('marketplace_apps').update({
      installs_count: (app.installs_count || 0) + 1,
    }).eq('id', app.id);

    toast.success(`${app.name} installed successfully!`);
    loadData();
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular': return (b.installs_count || 0) - (a.installs_count || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      default: return 0;
    }
  });

  const featuredApps = apps.filter(a => a.is_featured).slice(0, 4);
  const popularApps = apps.filter(a => !a.is_featured).slice(0, 8);

  return (
    <AppShell>
      <PageHeader
        title="Enterprise Marketplace"
        description="Extend your platform with apps, themes, and integrations"
        action={
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Become a Developer
          </Button>
        }
      />

      {/* Featured Apps */}
      {featuredApps.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Featured Apps
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredApps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden premium-shadow cursor-pointer group"
              >
                <div className="h-24 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center relative">
                  {app.is_free ? (
                    <Badge className="absolute top-2 right-2 bg-success/90">Free</Badge>
                  ) : app.price > 0 ? (
                    <Badge className="absolute top-2 right-2 bg-purple-500/90">${app.price}</Badge>
                  ) : null}
                  {app.is_verified && (
                    <Badge className="absolute top-2 left-2 bg-blue-500/90">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{app.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{app.short_description || app.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium">{app.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-muted-foreground">({app.ratings_count || 0})</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{app.installs_count || 0} installs</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Links */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Store className="h-4 w-4" />
            All
          </button>
          {categories.slice(0, 8).map((cat) => {
            const Icon = categoryIcons[cat.name] || Store;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
                <Badge variant="outline" className="text-[9px]">{cat.app_count}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="pl-9"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <div className="flex gap-1.5">
            {['all', 'free', 'paid'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  selectedType === type ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
              >
                {type}
              </button>
            ))}
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

      {/* Apps List */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{filteredApps.length} apps found</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No apps found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card overflow-hidden premium-shadow group hover:shadow-lg transition-all"
            >
              <div className="h-28 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                <Plug className="h-10 w-10 text-muted-foreground/50" />
                {app.is_free ? (
                  <Badge className="absolute top-2 right-2 bg-success/90 text-white">Free</Badge>
                ) : app.price && app.price > 0 ? (
                  <Badge className="absolute top-2 right-2 bg-purple-500/90 text-white">${app.price}</Badge>
                ) : app.price_type === 'subscription' ? (
                  <Badge className="absolute top-2 right-2 bg-blue-500/90 text-white">${app.subscription_price_monthly}/mo</Badge>
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-1">{app.name}</h3>
                  {app.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{app.short_description || app.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-medium">{app.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{app.installs_count || 0} installs</span>
                </div>
                <Button
                  size="sm"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => installApp(app)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card p-4 premium-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Plug className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{app.name}</h3>
                    {app.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    {app.is_featured && <Badge className="bg-yellow-500/10 text-yellow-500 text-[9px]">Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{app.short_description || app.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {app.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span>{app.installs_count || 0} installs</span>
                    <span>{app.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {app.is_free ? (
                    <Badge className="bg-success/10 text-success mb-2">Free</Badge>
                  ) : (
                    <p className="font-bold mb-2">${app.price || app.subscription_price_monthly || 0}</p>
                  )}
                  <Button size="sm" onClick={() => installApp(app)}>
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/marketplace/agents" className="glass-card p-6 premium-shadow hover:shadow-lg transition-all group text-center">
          <Bot className="h-10 w-10 mx-auto mb-3 text-purple-500 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">AI Agent Store</h3>
          <p className="text-xs text-muted-foreground mt-1">Specialized AI assistants</p>
        </a>
        <a href="/marketplace/themes" className="glass-card p-6 premium-shadow hover:shadow-lg transition-all group text-center">
          <Palette className="h-10 w-10 mx-auto mb-3 text-pink-500 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Theme Store</h3>
          <p className="text-xs text-muted-foreground mt-1">Customize your interface</p>
        </a>
        <a href="/marketplace/templates" className="glass-card p-6 premium-shadow hover:shadow-lg transition-all group text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-cyan-500 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Template Library</h3>
          <p className="text-xs text-muted-foreground mt-1">Reusable templates</p>
        </a>
        <a href="/developers" className="glass-card p-6 premium-shadow hover:shadow-lg transition-all group text-center">
          <Zap className="h-10 w-10 mx-auto mb-3 text-orange-500 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold">Developer Portal</h3>
          <p className="text-xs text-muted-foreground mt-1">Build & publish apps</p>
        </a>
      </div>
    </AppShell>
  );
}
