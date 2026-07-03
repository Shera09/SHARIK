'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  Plus,
  Search,
  Calendar,
  Image,
  Video,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  Send,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const platformIcons: Record<string, typeof Share2> = {
  facebook: Globe,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Share2,
  youtube: Youtube,
};

export default function SocialMediaPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockAccounts = [
    { id: '1', platform: 'facebook', account_name: 'WebHoster', account_handle: '@webhoster', follower_count: 45000, is_connected: true },
    { id: '2', platform: 'instagram', account_name: 'WebHoster AI', account_handle: '@webhoster.ai', follower_count: 28000, is_connected: true },
    { id: '3', platform: 'linkedin', account_name: 'WebHoster Technologies', account_handle: 'webhoster-technologies', follower_count: 12500, is_connected: true },
    { id: '4', platform: 'twitter', account_name: 'WebHoster', account_handle: '@webhoster_io', follower_count: 8500, is_connected: true },
  ];

  const mockPosts = [
    { id: '1', platform: 'instagram', content: 'Excited to announce our new AI-powered features! 🚀', scheduled_at: '2026-07-03 10:00', status: 'scheduled', media_type: 'image', like_count: 0 },
    { id: '2', platform: 'facebook', content: 'Summer Sale is here! Get 50% off on all plans.', scheduled_at: '2026-07-02 14:00', status: 'published', media_type: 'image', like_count: 245 },
    { id: '3', platform: 'linkedin', content: 'How AI is transforming business operations in 2026', scheduled_at: '2026-07-01 09:00', status: 'published', media_type: null, like_count: 89 },
    { id: '4', platform: 'twitter', content: 'Thread: 10 tips for improving your CRM strategy', scheduled_at: '2026-07-04 11:00', status: 'draft', media_type: null, like_count: 0 },
  ];

  const stats = {
    totalFollowers: mockAccounts.reduce((sum, a) => sum + a.follower_count, 0),
    totalPosts: 156,
    totalEngagement: 12500,
    avgEngagementRate: 4.2,
  };

  return (
    <AppShell>
      <PageHeader
        title="Social Media Management"
        description="Schedule, publish, and analyze social media content"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Social Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Platforms</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(platformIcons).map(([key, Icon]) => (
                      <Button key={key} variant="outline" size="sm" className="gap-1">
                        <Icon className="h-4 w-4" />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Post Content</Label>
                  <Textarea className="mt-1.5" placeholder="What's on your mind?" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Media</Label>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="gap-1"><Image className="h-4 w-4" /> Image</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Video className="h-4 w-4" /> Video</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Schedule</Label>
                    <Input className="mt-1.5" type="datetime-local" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Save Draft</Button>
                <Button>Schedule Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Followers', value: stats.totalFollowers.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'text-green-600' },
          { label: 'Total Engagement', value: stats.totalEngagement.toLocaleString(), icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Avg Engagement Rate', value: `${stats.avgEngagementRate}%`, icon: BarChart3, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Connected Accounts */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Your connected social media profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockAccounts.map((account, i) => {
                const PlatformIcon = platformIcons[account.platform] || Share2;
                return (
                  <motion.div key={account.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <PlatformIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{account.account_name}</p>
                            <p className="text-xs text-muted-foreground">{account.account_handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{account.follower_count.toLocaleString()} followers</span>
                          <Badge className={account.is_connected ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}>
                            {account.is_connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Calendar */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Scheduled and published posts</CardDescription>
              </div>
              <Button variant="outline" className="gap-1">
                <Calendar className="h-4 w-4" />
                Calendar View
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockPosts.map((post, i) => {
              const PlatformIcon = platformIcons[post.platform] || Share2;
              return (
                <motion.div key={post.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <PlatformIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.content}</p>
                    <p className="text-sm text-muted-foreground">{post.scheduled_at}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    {post.media_type && (
                      <Badge variant="outline" className="text-xs">
                        {post.media_type === 'image' ? <Image className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                        {post.media_type}
                      </Badge>
                    )}
                    {post.like_count > 0 && (
                      <span className="text-sm text-muted-foreground">{post.like_count} likes</span>
                    )}
                  </div>
                  <Badge className={post.status === 'published' ? 'bg-green-500/10 text-green-700' : post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-700' : 'bg-gray-500/10 text-gray-700'}>
                    {post.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Preview</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
