'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Eye,
  Pin,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Star,
  Users,
  Building2,
  Globe,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  summary: string;
  ai_summary: string;
  priority: string;
  category: string;
  author_id: string;
  is_pinned: boolean;
  is_emergency: boolean;
  published_at: string;
  acknowledgement_required: boolean;
  acknowledgement_count: number;
  view_count: number;
}

const priorityConfig: Record<string, { color: string; icon: typeof Info; label: string }> = {
  emergency: { color: 'bg-red-500 text-white', icon: AlertCircle, label: 'Emergency' },
  urgent: { color: 'bg-orange-500 text-white', icon: AlertTriangle, label: 'Urgent' },
  high: { color: 'bg-yellow-500 text-white', icon: AlertTriangle, label: 'High' },
  normal: { color: 'bg-blue-500/10 text-blue-700', icon: Bell, label: 'Normal' },
  low: { color: 'bg-gray-500/10 text-gray-700', icon: Info, label: 'Low' },
};

const categoryColors: Record<string, string> = {
  general: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  holiday: 'bg-green-500/10 text-green-700 border-green-500/20',
  policy: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  emergency: 'bg-red-500/10 text-red-700 border-red-500/20',
  department: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  company: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ann.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const mockAnnouncements = announcements.length > 0 ? announcements : [
    { announcement_id: '1', title: 'System Maintenance Scheduled', content: 'We will be performing scheduled maintenance on Sunday, July 6th from 2:00 AM to 6:00 AM IST. During this time, some services may be temporarily unavailable.', summary: 'Maintenance scheduled for Sunday', ai_summary: '', priority: 'normal', category: 'general', author_id: 'u1', is_pinned: true, is_emergency: false, published_at: new Date(Date.now() - 86400000).toISOString(), acknowledgement_required: false, acknowledgement_count: 0, view_count: 156 },
    { announcement_id: '2', title: 'Q2 Results Announcement', content: 'We are pleased to announce that Q2 results exceeded expectations with 25% growth in revenue. Thank you all for your hard work and dedication!', summary: 'Q2 revenue up 25%', ai_summary: '', priority: 'high', category: 'company', author_id: 'u2', is_pinned: true, is_emergency: false, published_at: new Date(Date.now() - 172800000).toISOString(), acknowledgement_required: false, acknowledgement_count: 0, view_count: 234 },
    { announcement_id: '3', title: 'Holiday Notice: Independence Day', content: 'Please note that the office will be closed on August 15th for Independence Day. Regular operations will resume on August 16th.', summary: 'Office closed Aug 15', ai_summary: '', priority: 'normal', category: 'holiday', author_id: 'u3', is_pinned: false, is_emergency: false, published_at: new Date(Date.now() - 259200000).toISOString(), acknowledgement_required: false, acknowledgement_count: 0, view_count: 89 },
    { announcement_id: '4', title: 'New Safety Protocol - Mandatory Acknowledgement', content: 'A new workplace safety protocol has been implemented. All employees must review and acknowledge the updated guidelines by Friday.', summary: 'New safety protocol requires acknowledgement', ai_summary: '', priority: 'urgent', category: 'policy', author_id: 'u1', is_pinned: true, is_emergency: false, published_at: new Date(Date.now() - 43200000).toISOString(), acknowledgement_required: true, acknowledgement_count: 45, view_count: 120 },
    { announcement_id: '5', title: 'Emergency: Office Evacuation Drill', content: 'An emergency evacuation drill will be conducted today at 3:00 PM. Please follow the standard evacuation procedures.', summary: 'Evacuation drill at 3 PM', ai_summary: '', priority: 'emergency', category: 'emergency', author_id: 'u2', is_pinned: true, is_emergency: true, published_at: new Date(Date.now() - 3600000).toISOString(), acknowledgement_required: true, acknowledgement_count: 78, view_count: 180 },
  ];

  const stats = {
    total: mockAnnouncements.length,
    pinned: mockAnnouncements.filter(a => a.is_pinned).length,
    emergency: mockAnnouncements.filter(a => a.is_emergency).length,
    ackRequired: mockAnnouncements.filter(a => a.acknowledgement_required && a.acknowledgement_count === 0).length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Announcements"
        description="Company-wide announcements and updates"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Publish a company-wide announcement
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1.5" placeholder="Announcement title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea className="mt-1.5" placeholder="Announcement content..." rows={4} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pinned" className="rounded" />
                    <Label htmlFor="pinned" className="font-normal text-sm">Pin announcement</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ack" className="rounded" />
                    <Label htmlFor="ack" className="font-normal text-sm">Require acknowledgement</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Save Draft</Button>
                <Button onClick={() => setCreateDialogOpen(false)} className="gap-2">
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, icon: Megaphone, color: 'text-blue-600' },
          { label: 'Pinned', value: stats.pinned, icon: Pin, color: 'text-purple-600' },
          { label: 'Emergency', value: stats.emergency, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Pending Ack', value: stats.ackRequired, icon: CheckCircle2, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color, "opacity-50")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Announcements List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl shimmer" />)
        ) : (
          mockAnnouncements.map((announcement, i) => {
            const priority = priorityConfig[announcement.priority] || priorityConfig.normal;
            const PriorityIcon = priority.icon;

            return (
              <motion.div
                key={announcement.announcement_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  "overflow-hidden",
                  announcement.is_emergency && "border-red-500",
                  announcement.is_pinned && "bg-muted/30"
                )}>
                  <div className={cn(
                    "h-1",
                    announcement.priority === 'emergency' && "bg-red-500",
                    announcement.priority === 'urgent' && "bg-orange-500",
                    announcement.priority === 'high' && "bg-yellow-500",
                    announcement.priority === 'normal' && "bg-blue-500"
                  )} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        priority.color
                      )}>
                        <PriorityIcon className={cn(
                          "h-6 w-6",
                          announcement.priority === 'emergency' && "animate-pulse"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {announcement.is_pinned && <Pin className="h-4 w-4 text-purple-500" />}
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          {announcement.is_emergency && (
                            <Badge className="bg-red-500 text-white">Emergency</Badge>
                          )}
                          <Badge className={cn("capitalize", categoryColors[announcement.category] || categoryColors.general)}>
                            {announcement.category}
                          </Badge>
                        </div>
                        {announcement.ai_summary && (
                          <div className="mt-2 p-2 rounded-lg bg-purple-500/10 flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-purple-700">{announcement.ai_summary}</p>
                          </div>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {new Date(announcement.published_at).toLocaleDateString('en-US', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-4 w-4" />
                              {announcement.view_count} views
                            </span>
                            {announcement.acknowledgement_required && (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                {announcement.acknowledgement_count} acknowledged
                              </span>
                            )}
                          </div>
                          {announcement.acknowledgement_required && (
                            <Button size="sm" className="gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
