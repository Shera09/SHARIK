'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  MapPin,
  Link,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Meeting {
  meeting_id: string;
  title: string;
  description: string;
  agenda: string;
  status: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_url: string;
  organizer_id: string;
  is_recurring: boolean;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  scheduled: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: Clock },
  in_progress: { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: Video },
  completed: { color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mockMeetings = meetings.length > 0 ? meetings : [
    { meeting_id: '1', title: 'Weekly Team Standup', description: 'Weekly sync with the team', agenda: 'Updates, Blockers, Plans', status: 'in_progress', start_time: new Date(Date.now() - 1800000).toISOString(), end_time: new Date(Date.now() + 1800000).toISOString(), location: 'Virtual', meeting_url: 'https://meet.example.com/standup', organizer_id: 'u1', is_recurring: true },
    { meeting_id: '2', title: 'Product Review', description: 'Q3 product roadmap review', agenda: 'Feature status, Timeline, Resources', status: 'scheduled', start_time: new Date(Date.now() + 3600000).toISOString(), end_time: new Date(Date.now() + 7200000).toISOString(), location: 'Conference Room A', meeting_url: '', organizer_id: 'u2', is_recurring: false },
    { meeting_id: '3', title: 'Client Kickoff', description: 'New project kickoff with client', agenda: 'Requirements, Timeline, Team introduction', status: 'scheduled', start_time: new Date(Date.now() + 86400000).toISOString(), end_time: new Date(Date.now() + 90000000).toISOString(), location: 'Virtual', meeting_url: 'https://meet.example.com/client', organizer_id: 'u1', is_recurring: false },
    { meeting_id: '4', title: 'Sprint Retrospective', description: 'Sprint 12 retrospective', agenda: 'What went well, What to improve, Action items', status: 'completed', start_time: new Date(Date.now() - 86400000).toISOString(), end_time: new Date(Date.now() - 82800000).toISOString(), location: 'Virtual', meeting_url: '', organizer_id: 'u3', is_recurring: true },
    { meeting_id: '5', title: 'Budget Planning', description: 'Q4 budget review and allocation', agenda: 'Current spend, Q4 projections, Adjustments', status: 'cancelled', start_time: new Date(Date.now() - 172800000).toISOString(), end_time: new Date(Date.now() - 169200000).toISOString(), location: 'Finance Office', meeting_url: '', organizer_id: 'u2', is_recurring: false },
  ];

  const stats = {
    total: mockMeetings.length,
    today: mockMeetings.filter(m => new Date(m.start_time).toDateString() === new Date().toDateString()).length,
    scheduled: mockMeetings.filter(m => m.status === 'scheduled').length,
    completed: mockMeetings.filter(m => m.status === 'completed').length,
  };

  const todayMeetings = mockMeetings.filter(m => new Date(m.start_time).toDateString() === new Date().toDateString());
  const upcomingMeetings = filteredMeetings.filter(m => new Date(m.start_time) > new Date() && m.status === 'scheduled');
  const pastMeetings = filteredMeetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  return (
    <AppShell>
      <PageHeader
        title="Meetings"
        description="Schedule, manage, and track team meetings"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>
                  Create a new meeting invite
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1.5" placeholder="Meeting title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" placeholder="Meeting purpose..." rows={2} />
                </div>
                <div>
                  <Label>Agenda</Label>
                  <Textarea className="mt-1.5" placeholder="Meeting agenda items..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <Input type="time" placeholder="Start" />
                      <Input type="time" placeholder="End" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input className="mt-1.5" placeholder="Room or virtual" />
                  </div>
                  <div>
                    <Label>Meeting URL</Label>
                    <Input className="mt-1.5" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="recurring" className="rounded" />
                  <Label htmlFor="recurring" className="font-normal text-sm">Recurring meeting</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Today', value: todayMeetings.length, icon: Calendar, color: 'text-blue-600' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-green-600' },
          { label: 'This Week', value: 5, icon: Video, color: 'text-purple-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600' },
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

      {/* Today's Meetings */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Today's Meetings</h2>
        {todayMeetings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Video className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No meetings scheduled for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayMeetings.map((meeting, i) => {
              const status = statusConfig[meeting.status] || statusConfig.scheduled;
              const Icon = status.icon;
              const startTime = new Date(meeting.start_time);
              const endTime = new Date(meeting.end_time);

              return (
                <motion.div
                  key={meeting.meeting_id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn(
                    "overflow-hidden",
                    meeting.status === 'in_progress' && "border-green-500 bg-green-50/50"
                  )}>
                    <div className={cn(
                      "h-1",
                      meeting.status === 'in_progress' && "bg-green-500",
                      meeting.status === 'scheduled' && "bg-blue-500"
                    )} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg",
                            status.color
                          )}>
                            <Icon className={cn("h-6 w-6", meeting.status === 'in_progress' && "animate-pulse")} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{meeting.title}</h3>
                              <Badge className={status.color}>
                                {meeting.status.replace('_', ' ')}
                              </Badge>
                              {meeting.is_recurring && (
                                <Badge variant="outline" className="text-xs">Recurring</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                {meeting.meeting_url ? <Link className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                {meeting.meeting_url ? 'Virtual' : meeting.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                5 participants
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {meeting.status === 'in_progress' && (
                            <Button className="gap-2">
                              <Video className="h-4 w-4" />
                              Join Now
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            {meeting.meeting_url ? (<Link className="h-4 w-4" />) : (<MapPin className="h-4 w-4" />)}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Meetings */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {upcomingMeetings.slice(0, 5).map((meeting, i) => {
                const status = statusConfig[meeting.status] || statusConfig.scheduled;
                const startTime = new Date(meeting.start_time);

                return (
                  <motion.div
                    key={meeting.meeting_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <p className="text-sm font-medium">{startTime.toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-xl font-bold">{startTime.getDate()}</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">{startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {meeting.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>S</AvatarFallback></Avatar>
                        <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>M</AvatarFallback></Avatar>
                        <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>+3</AvatarFallback></Avatar>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
