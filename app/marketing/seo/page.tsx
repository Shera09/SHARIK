'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Image,
  Link2,
  FileText,
  Gauge,
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SEOToolkitPage() {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockPages = [
    { id: '1', page_url: '/pricing', page_title: 'Pricing - WebHoster AI', seo_score: 85, page_speed_score: 92, focus_keywords: ['ai business software pricing', 'crm pricing'], issues: 2 },
    { id: '2', page_url: '/features', page_title: 'Features - WebHoster AI', seo_score: 72, page_speed_score: 78, focus_keywords: ['ai crm features', 'automation tools'], issues: 5 },
    { id: '3', page_url: '/', page_title: 'WebHoster - AI Business OS', seo_score: 92, page_speed_score: 95, focus_keywords: ['ai business os', 'crm software india'], issues: 1 },
    { id: '4', page_url: '/about', page_title: 'About Us - WebHoster AI', seo_score: 58, page_speed_score: 65, focus_keywords: ['about webhoster', 'business software company'], issues: 8 },
  ];

  const mockKeywords = [
    { id: '1', keyword: 'ai crm software', search_volume: 12000, keyword_difficulty: 45, current_rank: 12, previous_rank: 15, search_intent: 'transactional' },
    { id: '2', keyword: 'business automation tools', search_volume: 8500, keyword_difficulty: 52, current_rank: 8, previous_rank: 10, search_intent: 'informational' },
    { id: '3', keyword: 'gst billing software', search_volume: 25000, keyword_difficulty: 68, current_rank: 25, previous_rank: 28, search_intent: 'transactional' },
    { id: '4', keyword: 'whatsapp marketing software', search_volume: 15000, keyword_difficulty: 35, current_rank: 5, previous_rank: 6, search_intent: 'transactional' },
  ];

  const stats = {
    totalPages: mockPages.length,
    avgSeoScore: Math.round(mockPages.reduce((sum, p) => sum + p.seo_score, 0) / mockPages.length),
    avgPageSpeed: Math.round(mockPages.reduce((sum, p) => sum + p.page_speed_score, 0) / mockPages.length),
    totalIssues: mockPages.reduce((sum, p) => sum + p.issues, 0),
  };

  return (
    <AppShell>
      <PageHeader
        title="SEO Toolkit"
        description="Optimize pages and track keyword rankings"
        action={
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Analyze Page
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Pages Analyzed', value: stats.totalPages, icon: Globe, color: 'text-blue-600' },
          { label: 'Avg SEO Score', value: stats.avgSeoScore, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Avg Page Speed', value: stats.avgPageSpeed, icon: Gauge, color: 'text-purple-600' },
          { label: 'Total Issues', value: stats.totalIssues, icon: AlertTriangle, color: 'text-red-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pages" className="mt-6">
        <TabsList>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Rankings</TabsTrigger>
        </TabsList>
        <TabsContent value="pages">
          <div className="mt-4 space-y-3">
            {mockPages.map((page, i) => (
              <motion.div key={page.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{page.page_title}</p>
                        <p className="text-sm text-muted-foreground truncate">{page.page_url}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Progress value={page.seo_score} className="h-2 w-16" />
                            <span className="font-bold text-sm">{page.seo_score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">SEO Score</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Progress value={page.page_speed_score} className="h-2 w-16" />
                            <span className="font-bold text-sm">{page.page_speed_score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Speed</p>
                        </div>
                      </div>
                      <Badge className={page.issues > 0 ? 'bg-red-500/10 text-red-700' : 'bg-green-500/10 text-green-700'}>
                        {page.issues} issue{page.issues !== 1 ? 's' : ''}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Optimize</DropdownMenuItem>
                          <DropdownMenuItem><Image className="h-4 w-4 mr-2" /> Images</DropdownMenuItem>
                          <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Content</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {page.focus_keywords.map((kw: string) => (
                        <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="keywords">
          <div className="mt-4 space-y-3">
            {mockKeywords.map((kw, i) => (
              <motion.div key={kw.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{kw.keyword}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">{kw.search_volume.toLocaleString()} searches</span>
                        <Badge variant="outline" className="text-xs">{kw.search_intent}</Badge>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold">{kw.keyword_difficulty}</p>
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-green-600">#{kw.current_rank}</p>
                          <span className="text-xs text-green-600">+{kw.previous_rank - kw.current_rank}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Current Rank</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {kw.current_rank <= 10 ? 'Page 1' : kw.current_rank <= 20 ? 'Page 2' : 'Page 3+'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
