'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Star,
  StarOff,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Trash2,
  Check,
  ChevronDown,
  ArrowUpDown,
  GripVertical,
  Image as ImageIcon,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Settings,
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type GoogleReview = {
  id: string;
  google_review_id: string;
  reviewer_name: string;
  reviewer_photo_url: string | null;
  rating: number;
  review_text: string | null;
  review_date: string;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
};

type SyncLog = {
  id: string;
  sync_type: string;
  status: string;
  reviews_fetched: number;
  reviews_added: number;
  reviews_updated: number;
  error_message: string | null;
  sync_duration_ms: number;
  synced_at: string;
};

type ReviewStats = {
  total_reviews: number;
  visible_reviews: number;
  hidden_reviews: number;
  featured_reviews: number;
  avg_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
};

type DisplaySettings = {
  widget_theme: string;
  widget_layout: string;
  max_reviews_display: string;
  show_ratings: string;
  show_photos: string;
  auto_sync_enabled: string;
  auto_sync_interval: string;
  google_place_id: string;
  last_sync_at: string;
};

const ratingColors: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-green-500',
};

const ratingBgColors: Record<number, string> = {
  1: 'bg-red-500/10',
  2: 'bg-orange-500/10',
  3: 'bg-yellow-500/10',
  4: 'bg-lime-500/10',
  5: 'bg-green-500/10',
};

export default function GoogleReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [settings, setSettings] = useState<DisplaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, logsRes, statsRes, settingsRes] = await Promise.all([
        supabase.from('google_reviews').select('*').order('display_order', { ascending: true }),
        supabase.from('review_sync_logs').select('*').order('synced_at', { ascending: false }).limit(10),
        supabase.rpc('get_review_stats'),
        supabase.from('review_display_settings').select('*'),
      ]);

      if (reviewsRes.data) setReviews(reviewsRes.data as GoogleReview[]);
      if (logsRes.data) setSyncLogs(logsRes.data as SyncLog[]);
      if (statsRes.data) setStats(statsRes.data as ReviewStats);
      if (settingsRes.data) {
        const settingsMap = settingsRes.data.reduce((acc, s) => {
          acc[s.setting_key] = s.setting_value;
          return acc;
        }, {} as Record<string, string>);
        setSettings(settingsMap as DisplaySettings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    const startTime = Date.now();
    try {
      // Call the edge function to sync reviews
      const { data: result, error: invokeError } = await supabase.functions.invoke('sync-google-reviews', {
        method: 'POST',
      });

      const duration = Date.now() - startTime;

      if (invokeError || !result) {
        throw new Error(invokeError?.message || result?.error || 'Sync failed');
      }

      // Log the sync
      await supabase.from('review_sync_logs').insert({
        sync_type: 'manual',
        status: result.added > 0 || result.updated > 0 ? 'success' : 'partial',
        reviews_fetched: result.fetched || 0,
        reviews_added: result.added || 0,
        reviews_updated: result.updated || 0,
        sync_duration_ms: duration,
      });

      await supabase.from('review_display_settings')
        .update({ setting_value: new Date().toISOString() })
        .eq('setting_key', 'last_sync_at');

      toast.success(`Synced ${result.fetched} reviews. Added: ${result.added}, Updated: ${result.updated}`);
      loadData();
    } catch (error) {
      const duration = Date.now() - startTime;
      await supabase.from('review_sync_logs').insert({
        sync_type: 'manual',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sync_duration_ms: duration,
      });
      toast.error('Failed to sync reviews. Check your Google Business Profile connection.');
    } finally {
      setSyncing(false);
    }
  };

  const toggleVisibility = async (reviewIds: string[], visible: boolean) => {
    const { error } = await supabase
      .from('google_reviews')
      .update({ is_visible: visible })
      .in('id', reviewIds);

    if (error) {
      toast.error('Failed to update visibility');
      return;
    }

    setReviews(prev => prev.map(r =>
      reviewIds.includes(r.id) ? { ...r, is_visible: visible } : r
    ));
    setSelectedReviews(new Set());
    toast.success(`Marked ${reviewIds.length} review(s) as ${visible ? 'visible' : 'hidden'}`);
  };

  const toggleFeatured = async (reviewIds: string[], featured: boolean) => {
    const { error } = await supabase
      .from('google_reviews')
      .update({ is_featured: featured })
      .in('id', reviewIds);

    if (error) {
      toast.error('Failed to update featured status');
      return;
    }

    setReviews(prev => prev.map(r =>
      reviewIds.includes(r.id) ? { ...r, is_featured: featured } : r
    ));
    setSelectedReviews(new Set());
    toast.success(`${featured ? 'Featured' : 'Unfeatured'} ${reviewIds.length} review(s)`);
  };

  const updateDisplayOrder = async (reviewId: string, newOrder: number) => {
    await supabase
      .from('google_reviews')
      .update({ display_order: newOrder })
      .eq('id', reviewId);
  };

  const handleReorder = (newOrder: GoogleReview[]) => {
    setReviews(newOrder);
    newOrder.forEach((review, index) => {
      updateDisplayOrder(review.id, index);
    });
  };

  const deleteReviews = async (reviewIds: string[]) => {
    const { error } = await supabase
      .from('google_reviews')
      .delete()
      .in('id', reviewIds);

    if (error) {
      toast.error('Failed to delete reviews');
      return;
    }

    setReviews(prev => prev.filter(r => !reviewIds.includes(r.id)));
    setSelectedReviews(new Set());
    toast.success(`Deleted ${reviewIds.length} review(s)`);
  };

  const selectAll = () => {
    setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedReviews(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchQuery === '' ||
      review.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesVisibility = visibilityFilter === 'all' ||
      (visibilityFilter === 'visible' && review.is_visible) ||
      (visibilityFilter === 'hidden' && !review.is_visible);
    const matchesFeatured = featuredFilter === 'all' ||
      (featuredFilter === 'featured' && review.is_featured) ||
      (featuredFilter === 'not_featured' && !review.is_featured);

    return matchesSearch && matchesRating && matchesVisibility && matchesFeatured;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_desc': return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
      case 'date_asc': return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
      case 'rating_desc': return b.rating - a.rating;
      case 'rating_asc': return a.rating - b.rating;
      case 'featured': return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      case 'order': return a.display_order - b.display_order;
      default: return 0;
    }
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={cn(
              sizeClass,
              i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  return (
    <AppShell>
      <PageHeader
        title="Google Reviews"
        description="Manage and display reviews from your Google Business Profile"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Reviews
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats?.total_reviews || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Visible</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.visible_reviews || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-muted-foreground">Hidden</span>
          </div>
          <p className="text-2xl font-bold">{stats?.hidden_reviews || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Pin className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Featured</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats?.featured_reviews || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {stats?.avg_rating ? stats.avg_rating.toFixed(1) : '0.0'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 col-span-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Rating Distribution</span>
          </div>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs w-3">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Progress
                  value={stats ? (stats[`${rating}_star` as keyof ReviewStats] as number / stats.total_reviews) * 100 : 0}
                  className="h-1.5 flex-1"
                />
                <span className="text-xs w-6 text-right">
                  {stats ? stats[`${rating}_star` as keyof ReviewStats] : 0}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="glass-card p-1 h-auto">
          <TabsTrigger value="reviews" className="rounded-lg gap-1.5">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="sync-logs" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Sync History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Manage Reviews</CardTitle>
                  <CardDescription>
                    {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
                    {selectedReviews.size > 0 && ` • ${selectedReviews.size} selected`}
                  </CardDescription>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Newest First</SelectItem>
                      <SelectItem value="date_asc">Oldest First</SelectItem>
                      <SelectItem value="rating_desc">Highest Rated</SelectItem>
                      <SelectItem value="rating_asc">Lowest Rated</SelectItem>
                      <SelectItem value="featured">Featured First</SelectItem>
                      <SelectItem value="order">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedReviews.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <Badge variant="secondary">{selectedReviews.size} selected</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleVisibility(Array.from(selectedReviews), true)}
                    className="gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Show
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleVisibility(Array.from(selectedReviews), false)}
                    className="gap-1"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(Array.from(selectedReviews), true)}
                    className="gap-1"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Feature
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(Array.from(selectedReviews), false)}
                    className="gap-1"
                  >
                    <PinOff className="h-3.5 w-3.5" />
                    Unfeature
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteReviews(Array.from(selectedReviews))}
                    className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deselectAll}
                    className="ml-auto"
                  >
                    Clear
                  </Button>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="p-8 text-center">
                  <StarOff className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-medium">No reviews found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviews.length === 0
                      ? 'Sync your Google Business Profile to import reviews'
                      : 'Try adjusting your filters'}
                  </p>
                  {reviews.length === 0 && (
                    <Button onClick={handleSync} disabled={syncing} className="mt-4 gap-2">
                      <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
                      Sync Now
                    </Button>
                  )}
                </div>
              ) : sortBy === 'order' ? (
                <Reorder.Group
                  axis="y"
                  values={filteredReviews}
                  onReorder={handleReorder}
                  className="divide-y"
                >
                  {filteredReviews.map((review) => (
                    <Reorder.Item
                      key={review.id}
                      value={review}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <ReviewRow
                        review={review}
                        selected={selectedReviews.has(review.id)}
                        onToggleSelect={() => toggleSelect(review.id)}
                        onToggleVisibility={() => toggleVisibility([review.id], !review.is_visible)}
                        onToggleFeatured={() => toggleFeatured([review.id], !review.is_featured)}
                        renderStars={renderStars}
                        formatDate={formatDate}
                        formatTimeAgo={formatTimeAgo}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="divide-y">
                  {filteredReviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={cn(
                        'flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors',
                        !review.is_visible && 'opacity-60'
                      )}
                    >
                      <ReviewRow
                        review={review}
                        selected={selectedReviews.has(review.id)}
                        onToggleSelect={() => toggleSelect(review.id)}
                        onToggleVisibility={() => toggleVisibility([review.id], !review.is_visible)}
                        onToggleFeatured={() => toggleFeatured([review.id], !review.is_featured)}
                        renderStars={renderStars}
                        formatDate={formatDate}
                        formatTimeAgo={formatTimeAgo}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sync History</CardTitle>
              <CardDescription>Recent review synchronization activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {syncLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No sync history yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {syncLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        log.status === 'success' && 'bg-green-500/10 text-green-600',
                        log.status === 'failed' && 'bg-red-500/10 text-red-600',
                        log.status === 'partial' && 'bg-yellow-500/10 text-yellow-600',
                      )}>
                        {log.status === 'success' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : log.status === 'failed' ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm capitalize">{log.sync_type} Sync</p>
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            log.status === 'success' && 'text-green-600',
                            log.status === 'failed' && 'text-red-600',
                            log.status === 'partial' && 'text-yellow-600',
                          )}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>Fetched: {log.reviews_fetched}</span>
                          <span>•</span>
                          <span>Added: {log.reviews_added}</span>
                          <span>•</span>
                          <span>Updated: {log.reviews_updated}</span>
                          {log.sync_duration_ms > 0 && (
                            <>
                              <span>•</span>
                              <span>{(log.sync_duration_ms / 1000).toFixed(1)}s</span>
                            </>
                          )}
                        </div>
                        {log.error_message && (
                          <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.synced_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.synced_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Review Widget Settings</SheetTitle>
            <SheetDescription>
              Configure how reviews are displayed on your website
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Google Place ID</Label>
                <Input
                  placeholder="ChIJN1t_tDeuEmsRso..."
                  value={settings?.google_place_id || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'google_place_id');
                    setSettings(prev => prev ? { ...prev, google_place_id: value } : null);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Find your Place ID at developers.google.com/places
                </p>
              </div>

              <div className="space-y-2">
                <Label>Widget Theme</Label>
                <Select
                  value={settings?.widget_theme || 'light'}
                  onValueChange={async (value) => {
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'widget_theme');
                    setSettings(prev => prev ? { ...prev, widget_theme: value } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Widget Layout</Label>
                <Select
                  value={settings?.widget_layout || 'carousel'}
                  onValueChange={async (value) => {
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'widget_layout');
                    setSettings(prev => prev ? { ...prev, widget_layout: value } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Maximum Reviews to Display</Label>
                <Select
                  value={settings?.max_reviews_display || '10'}
                  onValueChange={async (value) => {
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'max_reviews_display');
                    setSettings(prev => prev ? { ...prev, max_reviews_display: value } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 reviews</SelectItem>
                    <SelectItem value="10">10 reviews</SelectItem>
                    <SelectItem value="20">20 reviews</SelectItem>
                    <SelectItem value="50">50 reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Star Ratings</Label>
                  <p className="text-xs text-muted-foreground">Display star ratings next to reviews</p>
                </div>
                <Switch
                  checked={settings?.show_ratings === 'true'}
                  onCheckedChange={async (checked) => {
                    const value = checked.toString();
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'show_ratings');
                    setSettings(prev => prev ? { ...prev, show_ratings: value } : null);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Reviewer Photos</Label>
                  <p className="text-xs text-muted-foreground">Display reviewer profile photos</p>
                </div>
                <Switch
                  checked={settings?.show_photos === 'true'}
                  onCheckedChange={async (checked) => {
                    const value = checked.toString();
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'show_photos');
                    setSettings(prev => prev ? { ...prev, show_photos: value } : null);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Sync Reviews</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync reviews</p>
                </div>
                <Switch
                  checked={settings?.auto_sync_enabled === 'true'}
                  onCheckedChange={async (checked) => {
                    const value = checked.toString();
                    await supabase
                      .from('review_display_settings')
                      .update({ setting_value: value })
                      .eq('setting_key', 'auto_sync_enabled');
                    setSettings(prev => prev ? { ...prev, auto_sync_enabled: value } : null);
                  }}
                />
              </div>

              {settings?.auto_sync_enabled === 'true' && (
                <div className="space-y-2">
                  <Label>Sync Interval</Label>
                  <Select
                    value={settings?.auto_sync_interval || '24'}
                    onValueChange={async (value) => {
                      await supabase
                        .from('review_display_settings')
                        .update({ setting_value: value })
                        .eq('setting_key', 'auto_sync_interval');
                      setSettings(prev => prev ? { ...prev, auto_sync_interval: value } : null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every hour</SelectItem>
                      <SelectItem value="6">Every 6 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Every 24 hours</SelectItem>
                      <SelectItem value="168">Every week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last synced: {settings?.last_sync_at
                  ? formatTimeAgo(settings.last_sync_at)
                  : 'Never'}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function ReviewRow({
  review,
  selected,
  onToggleSelect,
  onToggleVisibility,
  onToggleFeatured,
  renderStars,
  formatDate,
  formatTimeAgo,
}: {
  review: GoogleReview;
  selected: boolean;
  onToggleSelect: () => void;
  onToggleVisibility: () => void;
  onToggleFeatured: () => void;
  renderStars: (rating: number, size?: 'sm' | 'md') => React.ReactNode;
  formatDate: (date: string) => string;
  formatTimeAgo: (date: string) => string;
}) {
  return (
    <>
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelect}
        className="flex-shrink-0"
      />
      {review.reviewer_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.reviewer_photo_url}
          alt={review.reviewer_name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium">
            {review.reviewer_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{review.reviewer_name}</p>
          {renderStars(review.rating, 'sm')}
          {review.is_featured && (
            <Badge className="text-[10px] bg-purple-500/10 text-purple-600">
              <Pin className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {!review.is_visible && (
            <Badge variant="outline" className="text-[10px] text-gray-500">
              Hidden
            </Badge>
          )}
        </div>
        {review.review_text && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {review.review_text}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(review.review_date)}
          </span>
          <span>•</span>
          <span>Synced {formatTimeAgo(review.last_synced_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleVisibility}
          className={cn(
            'h-8 w-8',
            review.is_visible ? 'text-green-500' : 'text-gray-400'
          )}
        >
          {review.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleFeatured}
          className={cn(
            'h-8 w-8',
            review.is_featured ? 'text-purple-500' : 'text-gray-400'
          )}
        >
          {review.is_featured ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}
