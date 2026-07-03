'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type GoogleReview = {
  id: string;
  reviewer_name: string;
  reviewer_photo_url: string | null;
  rating: number;
  review_text: string | null;
  review_date: string;
  is_featured: boolean;
};

type WidgetSettings = {
  widget_theme: string;
  widget_layout: string;
  max_reviews_display: string;
  show_ratings: string;
  show_photos: string;
};

interface GoogleReviewsWidgetProps {
  layout?: 'carousel' | 'grid' | 'list' | 'featured';
  maxReviews?: number;
  showRating?: boolean;
  showPhotos?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export function GoogleReviewsWidget({
  layout = 'carousel',
  maxReviews = 10,
  showRating = true,
  showPhotos = true,
  theme = 'auto',
  className,
}: GoogleReviewsWidgetProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<GoogleReview[]>([]);
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const [reviewsRes, featuredRes, settingsRes] = await Promise.all([
        supabase
          .from('google_reviews')
          .select('id, reviewer_name, reviewer_photo_url, rating, review_text, review_date, is_featured')
          .eq('is_visible', true)
          .order('review_date', { ascending: false })
          .limit(maxReviews),
        supabase
          .from('google_reviews')
          .select('id, reviewer_name, reviewer_photo_url, rating, review_text, review_date, is_featured')
          .eq('is_visible', true)
          .eq('is_featured', true)
          .order('review_date', { ascending: false })
          .limit(5),
        supabase
          .from('review_display_settings')
          .select('setting_key, setting_value'),
      ]);

      if (reviewsRes.data) setReviews(reviewsRes.data as GoogleReview[]);
      if (featuredRes.data) setFeaturedReviews(featuredRes.data as GoogleReview[]);
      if (settingsRes.data) {
        const settingsMap = settingsRes.data.reduce((acc, s) => {
          acc[s.setting_key] = s.setting_value;
          return acc;
        }, {} as Record<string, string>);
        setSettings(settingsMap as unknown as WidgetSettings);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [maxReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Auto-scroll carousel
  useEffect(() => {
    if (layout !== 'carousel' || isPaused || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [layout, isPaused, reviews.length]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
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

  const displayReviews = featuredReviews.length > 0 ? featuredReviews : reviews;

  const effectiveTheme = theme === 'auto'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const gridCols = layout === 'grid'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : '';

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Featured Section Header */}
      {featuredReviews.length > 0 && (
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
          >
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">Featured Reviews</span>
          </motion.div>
        </div>
      )}

      {/* Layout Variants */}
      {layout === 'carousel' && (
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl"
            >
              <ReviewCard
                review={displayReviews[currentIndex]}
                showRating={showRating}
                showPhotos={showPhotos}
                renderStars={renderStars}
                formatDate={formatDate}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {displayReviews.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(prev => (prev - 1 + displayReviews.length) % displayReviews.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 shadow-lg border border-border hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => (prev + 1) % displayReviews.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 shadow-lg border border-border hover:bg-background transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {displayReviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === currentIndex
                      ? 'bg-primary w-4'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {layout === 'grid' && (
        <div className={cn('grid gap-6', gridCols)}>
          {displayReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ReviewCard
                review={review}
                showRating={showRating}
                showPhotos={showPhotos}
                renderStars={renderStars}
                formatDate={formatDate}
              />
            </motion.div>
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="space-y-4">
          {displayReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ReviewCard
                review={review}
                showRating={showRating}
                showPhotos={showPhotos}
                renderStars={renderStars}
                formatDate={formatDate}
                compact
              />
            </motion.div>
          ))}
        </div>
      )}

      {layout === 'featured' && featuredReviews.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredReviews.slice(0, 3).map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'relative',
                i === 0 && 'md:col-span-2 lg:col-span-1'
              )}
            >
              <ReviewCard
                review={review}
                showRating={showRating}
                showPhotos={showPhotos}
                renderStars={renderStars}
                formatDate={formatDate}
                featured={i === 0}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  showRating,
  showPhotos,
  renderStars,
  formatDate,
  compact = false,
  featured = false,
}: {
  review: GoogleReview;
  showRating: boolean;
  showPhotos: boolean;
  renderStars: (rating: number) => React.ReactNode;
  formatDate: (date: string) => string;
  compact?: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-6 transition-all duration-300',
        'hover:shadow-lg hover:border-primary/20',
        featured && 'border-primary/30 bg-gradient-to-br from-card to-primary/5',
        compact && 'p-4 rounded-xl'
      )}
    >
      <div className="flex items-start gap-4">
        {showPhotos && (
          <div className="flex-shrink-0">
            {review.reviewer_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.reviewer_photo_url}
                alt={review.reviewer_name}
                className={cn(
                  'rounded-full object-cover',
                  compact ? 'w-10 h-10' : 'w-12 h-12'
                )}
              />
            ) : (
              <div
                className={cn(
                  'rounded-full bg-primary/10 flex items-center justify-center',
                  compact ? 'w-10 h-10' : 'w-12 h-12'
                )}
              >
                <span className="text-primary font-semibold">
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
              {review.reviewer_name}
            </p>
            {showRating && renderStars(review.rating)}
          </div>

          {review.review_text && (
            <div className={cn('mt-3 relative', !compact && 'pl-4')}>
              {!compact && (
                <Quote className="absolute left-0 top-0 h-4 w-4 text-primary/30 rotate-180" />
              )}
              <p className={cn(
                'text-muted-foreground leading-relaxed',
                compact ? 'text-sm line-clamp-2' : 'line-clamp-4'
              )}>
                {review.review_text}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <time>{formatDate(review.review_date)}</time>
            {review.is_featured && (
              <>
                <span>•</span>
                <span className="text-primary font-medium">Featured</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight inline widget for embedding
export function GoogleReviewsInline({
  maxReviews = 3,
  className,
}: {
  maxReviews?: number;
  className?: string;
}) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data } = await supabase
          .from('google_reviews')
          .select('id, reviewer_name, rating, review_text, review_date')
          .eq('is_visible', true)
          .eq('is_featured', true)
          .order('review_date', { ascending: false })
          .limit(maxReviews);

        if (data) setReviews(data as GoogleReview[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [maxReviews]);

  if (loading || reviews.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <div className="flex -space-x-2">
        {reviews.slice(0, 5).map(review => (
          <div
            key={review.id}
            className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
          >
            {review.reviewer_name.charAt(0)}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {reviews.length} verified reviews
      </p>
    </div>
  );
}

// Review badge for displaying rating summary
export function GoogleReviewBadge({ className }: { className?: string }) {
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await supabase.rpc('get_review_stats');
        if (data) {
          const statsData = data as { avg_rating: number; total_reviews: number };
          setStats({
            avg: statsData.avg_rating || 0,
            count: statsData.total_reviews || 0,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    loadStats();
  }, []);

  if (!stats) return null;

  return (
    <a
      href="/google-reviews"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors',
        className
      )}
    >
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium">{stats.avg.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">
        ({stats.count} reviews)
      </span>
    </a>
  );
}
