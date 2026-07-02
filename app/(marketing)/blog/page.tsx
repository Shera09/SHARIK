'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Search,
  Calendar,
  Clock,
  Eye,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  published_at: string;
  read_time: number;
  views: number;
  featured_image?: string;
};

const staticPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How AI is Transforming Business Operations in India',
    slug: 'ai-transforming-business-operations-india',
    excerpt: 'Discover how Indian businesses are leveraging AI agents to automate everything from lead capture to GST compliance.',
    content: '',
    author: 'Rahul Sharma',
    category: 'AI & Technology',
    tags: ['AI', 'Automation', 'GST'],
    published_at: '2024-01-15',
    read_time: 6,
    views: 1250,
  },
  {
    id: '2',
    title: 'GST Compliance Made Easy: A Complete Guide for 2024',
    slug: 'gst-compliance-guide-2024',
    excerpt: 'Everything you need to know about GST filing, HSN codes, and maintaining compliance in the new year.',
    content: '',
    author: 'Priya Patel',
    category: 'Tax & Compliance',
    tags: ['GST', 'Compliance', 'Tax'],
    published_at: '2024-01-10',
    read_time: 8,
    views: 2340,
  },
  {
    id: '3',
    title: 'The Power of Automated Invoice Follow-ups',
    slug: 'automated-invoice-follow-ups-power',
    excerpt: 'Learn how automated payment reminders and WhatsApp integration can significantly reduce late payments.',
    content: '',
    author: 'Amit Kumar',
    category: 'Finance',
    tags: ['Invoicing', 'Automation', 'Payments'],
    published_at: '2024-01-05',
    read_time: 5,
    views: 890,
  },
  {
    id: '4',
    title: 'Building Customer Trust with Self-Service Portals',
    slug: 'customer-trust-self-service-portals',
    excerpt: 'Why customer portals are becoming essential for service businesses and how to implement them effectively.',
    content: '',
    author: 'Sneha Gupta',
    category: 'Customer Experience',
    tags: ['Customer Portal', 'UX', 'Payments'],
    published_at: '2023-12-28',
    read_time: 7,
    views: 1560,
  },
  {
    id: '5',
    title: 'Trademark Registration: A Step-by-Step Guide',
    slug: 'trademark-registration-guide',
    excerpt: 'Protect your brand with this comprehensive guide to trademark registration in India.',
    content: '',
    author: 'Priya Patel',
    category: 'Legal',
    tags: ['Trademark', 'Legal', 'Business'],
    published_at: '2023-12-20',
    read_time: 10,
    views: 3200,
  },
  {
    id: '6',
    title: 'GST Registration for New Businesses',
    slug: 'gst-registration-new-businesses',
    excerpt: 'A beginner-friendly guide to getting your GSTIN and starting your business on the right foot.',
    content: '',
    author: 'Amit Kumar',
    category: 'Tax & Compliance',
    tags: ['GST', 'Registration', 'Startup'],
    published_at: '2023-12-15',
    read_time: 6,
    views: 1890,
  },
];

const categories = ['All', 'AI & Technology', 'Tax & Compliance', 'Finance', 'Customer Experience', 'Legal'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(staticPosts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filtered[0];
  const recentPosts = filtered.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">WebHoster</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/our-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/blog" className="text-sm font-medium text-primary">Blog</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="gap-2 rounded-xl">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-4 py-1.5 rounded-full">
              Resources & Insights
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              Latest from Our
              <br />
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights, guides, and tips to help your business grow with AI and automation.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="h-12 pl-11 rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/blog/${featuredPost.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden group hover:shadow-xl transition-shadow"
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-primary/50" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">Featured</Badge>
                      <Badge variant="secondary">{featuredPost.category}</Badge>
                    </div>
                    <h2 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground">{featuredPost.excerpt}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(featuredPost.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredPost.read_time} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {featuredPost.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium">
                      Read Article
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-display text-xl font-bold mb-6">Recent Articles</h3>
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="glass-card overflow-hidden group hover:shadow-lg transition-shadow h-full">
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">{post.category}</span>
                        </div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl font-bold">Subscribe to Our Newsletter</h2>
            <p className="mt-2 text-muted-foreground">
              Get the latest articles, tips, and updates delivered to your inbox.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="rounded-xl" />
              <Button className="rounded-xl gap-2">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">WebHoster</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered business operating system for Indian businesses.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/our-services" className="hover:text-foreground transition-colors">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>2024 WebHoster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
