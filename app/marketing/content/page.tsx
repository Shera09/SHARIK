'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  FileText,
  Mail,
  MessageSquare,
  Share2,
  Video,
  BookOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wand2,
  RefreshCw,
  FileBarChart,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Content {
  id: string;
  content_title: string;
  content_type: string;
  content_status: string;
  content_excerpt: string;
  generated_by_ai: boolean;
  tone: string;
  actual_word_count: number;
  created_at: string;
}

const contentTypeConfig: Record<string, { icon: typeof FileText; label: string }> = {
  blog_post: { icon: BookOpen, label: 'Blog Article' },
  email_content: { icon: Mail, label: 'Email Campaign' },
  whatsapp_message: { icon: MessageSquare, label: 'WhatsApp Message' },
  social_post: { icon: Share2, label: 'Social Post' },
  ad_copy: { icon: FileBarChart, label: 'Ad Copy' },
  video_script: { icon: Video, label: 'Video Script' },
};

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock },
  in_review: { color: 'bg-yellow-500/10 text-yellow-700', icon: AlertTriangle },
  approved: { color: 'bg-blue-500/10 text-blue-700', icon: CheckCircle2 },
  published: { color: 'bg-green-500/10 text-green-700', icon: Send },
};

const toneOptions = ['Professional', 'Friendly', 'Casual', 'Formal', 'Enthusiastic', 'Persuasive', 'Informational'];

export default function AIContentStudio() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const { data } = await supabase.from('marketing_content').select('*').order('created_at', { ascending: false });
      if (data) setContent(data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockContent: Content[] = content.length > 0 ? content : [
    { id: '1', content_title: '5 Ways AI Can Boost Your Sales', content_type: 'blog_post', content_status: 'published', content_excerpt: 'Discover how artificial intelligence is revolutionizing sales processes...', generated_by_ai: true, tone: 'Professional', actual_word_count: 1250, created_at: '2026-06-28' },
    { id: '2', content_title: 'Summer Newsletter - July', content_type: 'email_content', content_status: 'approved', content_excerpt: 'Summer is here! Check out our latest offerings and exclusive deals...', generated_by_ai: true, tone: 'Friendly', actual_word_count: 450, created_at: '2026-07-01' },
    { id: '3', content_title: 'Product Launch WhatsApp', content_type: 'whatsapp_message', content_status: 'approved', content_excerpt: '🚀 Exciting News! Our new product is here...', generated_by_ai: true, tone: 'Enthusiastic', actual_word_count: 85, created_at: '2026-07-02' },
    { id: '4', content_title: 'LinkedIn Thought Leadership', content_type: 'social_post', content_status: 'in_review', content_excerpt: 'The future of business automation is here...', generated_by_ai: true, tone: 'Professional', actual_word_count: 180, created_at: '2026-07-02' },
    { id: '5', content_title: 'Case Study: Enterprise Success', content_type: 'blog_post', content_status: 'draft', content_excerpt: 'Learn how Company X achieved 300% growth...', generated_by_ai: false, tone: 'Informational', actual_word_count: 520, created_at: '2026-07-01' },
    { id: '6', content_title: 'Ad Copy - Google Search', content_type: 'ad_copy', content_status: 'published', content_excerpt: 'AI-Powered Business OS - Transform your operations today!', generated_by_ai: true, tone: 'Persuasive', actual_word_count: 32, created_at: '2026-06-25' },
  ];

  const filteredContent = mockContent.filter(c => c.content_title.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    total: mockContent.length,
    aiGenerated: mockContent.filter(c => c.generated_by_ai).length,
    published: mockContent.filter(c => c.content_status === 'published').length,
    totalWords: mockContent.reduce((sum, c) => sum + c.actual_word_count, 0),
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`# ${prompt}

This is AI-generated content based on your prompt. In a real implementation, this would connect to an AI model to generate high-quality marketing content tailored to your specifications.

## Key Points:
- Compelling headline that captures attention
- Relevant body content that engages readers
- Clear call-to-action that drives conversions
- SEO-optimized keywords naturally integrated
- Tone and style matching your brand voice

The content is ready for your review and can be edited before publishing.`);
      setGenerating(false);
    }, 2000);
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Content Studio"
        description="Generate, review, and publish marketing content with AI"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Wand2 className="h-4 w-4" />
                Generate Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Content Generator
                </DialogTitle>
                <DialogDescription>Create marketing content with AI</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog_post">Blog Article</SelectItem>
                        <SelectItem value="email_content">Email Campaign</SelectItem>
                        <SelectItem value="whatsapp_message">WhatsApp Message</SelectItem>
                        <SelectItem value="social_post">Social Media Post</SelectItem>
                        <SelectItem value="ad_copy">Ad Copy</SelectItem>
                        <SelectItem value="video_script">Video Script</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tone</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Input className="mt-1.5" placeholder="e.g., Small business owners" />
                  </div>
                  <div>
                    <Label>Topic / Prompt</Label>
                    <Textarea className="mt-1.5" placeholder="Describe what content you want to generate..." rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                  </div>
                  <div>
                    <Label>SEO Keywords (optional)</Label>
                    <Input className="mt-1.5" placeholder="business automation, AI, CRM" />
                  </div>
                  <Button className="w-full gap-2" onClick={handleGenerate} disabled={generating || !prompt}>
                    {generating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Content</>}
                  </Button>
                </div>
                <div className="flex flex-col">
                  <Label>Generated Content</Label>
                  <ScrollArea className="flex-1 mt-1.5 border rounded-lg p-3 bg-muted/30 min-h-[300px]">
                    {generatedContent ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{generatedContent}</div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Wand2 className="h-8 w-8 mb-2" />
                        <p className="text-sm">Generated content will appear here</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button variant="outline">Regenerate</Button>
                <Button disabled={!generatedContent}>Save as Draft</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Content', value: stats.total, icon: FileText, color: 'text-blue-600' },
          { label: 'AI Generated', value: stats.aiGenerated, icon: Sparkles, color: 'text-purple-600' },
          { label: 'Published', value: stats.published, icon: Send, color: 'text-green-600' },
          { label: 'Total Words', value: stats.totalWords.toLocaleString(), icon: BookOpen, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog_post">Blog Articles</SelectItem>
            <SelectItem value="email_content">Emails</SelectItem>
            <SelectItem value="whatsapp_message">WhatsApp</SelectItem>
            <SelectItem value="social_post">Social Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.map((item, i) => {
          const typeConfig = contentTypeConfig[item.content_type] || contentTypeConfig.blog_post;
          const TypeIcon = typeConfig.icon;
          const status = statusConfig[item.content_status] || statusConfig.draft;
          const StatusIcon = status.icon;

          return (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TypeIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{typeConfig.label}</p>
                        {item.generated_by_ai && (
                          <Badge className="bg-purple-500/10 text-purple-700 text-[10px]"><Sparkles className="h-3 w-3 mr-0.5" /> AI</Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {item.content_status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="font-medium">{item.content_title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.content_excerpt}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {item.actual_word_count} words
                    </span>
                    <span>{item.tone}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Preview</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" /> Regenerate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
