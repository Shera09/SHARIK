'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  Send,
  Download,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: FileText },
  open: { color: 'bg-blue-500/10 text-blue-700', icon: Briefcase },
  on_hold: { color: 'bg-yellow-500/10 text-yellow-700', icon: Clock },
  closed: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-500/10 text-red-700', icon: XCircle },
};

const candidateStatusConfig: Record<string, { color: string }> = {
  new: { color: 'bg-blue-500/10 text-blue-700' },
  screening: { color: 'bg-purple-500/10 text-purple-700' },
  shortlisted: { color: 'bg-cyan-500/10 text-cyan-700' },
  interview_scheduled: { color: 'bg-yellow-500/10 text-yellow-700' },
  selected: { color: 'bg-green-500/10 text-green-700' },
  offered: { color: 'bg-emerald-500/10 text-emerald-700' },
  hired: { color: 'bg-green-500/10 text-green-700' },
  rejected: { color: 'bg-red-500/10 text-red-700' },
};

export default function RecruitmentPage() {
  const [loading, setLoading] = useState(true);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  const stats = {
    openPositions: 24,
    totalApplications: 245,
    interviewsScheduled: 18,
    offersPending: 8,
    hiredThisMonth: 12,
    avgTimeToHire: 21,
  };

  const jobRequisitions = [
    { id: '1', job_title: 'Senior Software Engineer', department: 'Engineering', positions: 2, filled: 1, applications: 45, status: 'open', priority: 'high', posted: '2024-06-15' },
    { id: '2', job_title: 'Product Manager', department: 'Product', positions: 1, filled: 0, applications: 32, status: 'open', priority: 'medium', posted: '2024-06-20' },
    { id: '3', job_title: 'UI/UX Designer', department: 'Design', positions: 2, filled: 0, applications: 28, status: 'open', priority: 'medium', posted: '2024-06-25' },
    { id: '4', job_title: 'DevOps Engineer', department: 'Engineering', positions: 1, filled: 1, applications: 21, status: 'closed', priority: 'high', posted: '2024-05-10' },
    { id: '5', job_title: 'Sales Executive', department: 'Sales', positions: 3, filled: 1, applications: 67, status: 'open', priority: 'high', posted: '2024-06-18' },
    { id: '6', job_title: 'Data Analyst', department: 'Analytics', positions: 1, filled: 0, applications: 19, status: 'on_hold', priority: 'low', posted: '2024-06-01' },
  ];

  const candidates = [
    { id: '1', name: 'Amit Kumar', email: 'amit@email.com', phone: '+91 87654 32101', position: 'Senior Software Engineer', status: 'interview_scheduled', rating: 4.2, applied: '2024-06-20', experience: '5 years', source: 'LinkedIn' },
    { id: '2', name: 'Sneha Patel', email: 'sneha@email.com', phone: '+91 87654 32102', position: 'Product Manager', status: 'shortlisted', rating: 4.5, applied: '2024-06-22', experience: '7 years', source: 'Naukri' },
    { id: '3', name: 'Ravi Sharma', email: 'ravi@email.com', phone: '+91 87654 32103', position: 'UI/UX Designer', status: 'new', rating: null, applied: '2024-07-01', experience: '3 years', source: 'Referral' },
    { id: '4', name: 'Priya Singh', email: 'priya@email.com', phone: '+91 87654 32104', position: 'Sales Executive', status: 'offered', rating: 4.8, applied: '2024-06-10', experience: '4 years', source: 'Indeed' },
    { id: '5', name: 'Vikram Reddy', email: 'vikram@email.com', phone: '+91 87654 32105', position: 'DevOps Engineer', status: 'hired', rating: 4.6, applied: '2024-05-15', experience: '6 years', source: 'LinkedIn' },
    { id: '6', name: 'Anita Das', email: 'anita@email.com', phone: '+91 87654 32106', position: 'Data Analyst', status: 'rejected', rating: 3.2, applied: '2024-06-05', experience: '2 years', source: 'Naukri' },
  ];

  const recruitmentFunnel = [
    { stage: 'Total Applications', count: 245, percent: 100 },
    { stage: 'Screened', count: 120, percent: 49 },
    { stage: 'Shortlisted', count: 45, percent: 18 },
    { stage: 'Interviewed', count: 28, percent: 11 },
    { stage: 'Selected', count: 15, percent: 6 },
    { stage: 'Hired', count: 12, percent: 5 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Recruitment Management"
        description="Manage job postings, candidates, and hiring pipeline"
        action={
          <Dialog open={createJobOpen} onOpenChange={setCreateJobOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Job Requisition</DialogTitle>
                <DialogDescription>
                  Post a new job opening for recruitment
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2">
                  <Label>Job Title</Label>
                  <Input className="mt-1.5" placeholder="e.g., Senior Software Engineer" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Positions</Label>
                  <Input className="mt-1.5" type="number" placeholder="1" />
                </div>
                <div>
                  <Label>Min Experience (Years)</Label>
                  <Input className="mt-1.5" type="number" placeholder="0" />
                </div>
                <div>
                  <Label>Max Experience (Years)</Label>
                  <Input className="mt-1.5" type="number" placeholder="10" />
                </div>
                <div>
                  <Label>Min Salary (LPA)</Label>
                  <Input className="mt-1.5" type="number" placeholder="6" />
                </div>
                <div>
                  <Label>Max Salary (LPA)</Label>
                  <Input className="mt-1.5" type="number" placeholder="15" />
                </div>
                <div className="col-span-2">
                  <Label>Job Description</Label>
                  <Input className="mt-1.5" placeholder="Enter job description..." />
                </div>
                <div>
                  <Label>Hiring Manager</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp1">Rahul Kumar</SelectItem>
                      <SelectItem value="emp2">Anjali Singh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateJobOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateJobOpen(false)}>Create Job</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Open Positions', value: stats.openPositions, icon: Briefcase, color: 'text-blue-600' },
          { label: 'Applications', value: stats.totalApplications, icon: FileText, color: 'text-purple-600' },
          { label: 'Interviews', value: stats.interviewsScheduled, icon: Calendar, color: 'text-orange-600' },
          { label: 'Pending Offers', value: stats.offersPending, icon: Send, color: 'text-cyan-600' },
          { label: 'Hired (Month)', value: stats.hiredThisMonth, icon: UserPlus, color: 'text-green-600' },
          { label: 'Avg. Time to Hire', value: `${stats.avgTimeToHire}d`, icon: Clock, color: 'text-pink-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs className="mt-6" defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Job Requisitions</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {jobRequisitions.map((job, i) => {
                  const StatusIcon = statusConfig[job.status]?.icon || Briefcase;
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', statusConfig[job.status]?.color)}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{job.job_title}</p>
                          <p className="text-sm text-muted-foreground">{job.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{job.filled}/{job.positions} Positions</p>
                          <p className="text-xs text-muted-foreground">{job.applications} applications</p>
                        </div>
                        <div className="w-24">
                          <Progress value={(job.filled / job.positions) * 100} className="h-2" />
                        </div>
                        <Badge className={cn('capitalize', statusConfig[job.status]?.color)}>{job.status.replace('_', ' ')}</Badge>
                        <Badge variant={job.priority === 'high' ? 'destructive' : 'outline'}>{job.priority}</Badge>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate, i) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {candidate.rating && (
                        <Badge className="bg-yellow-500/10 text-yellow-700">
                          {candidate.rating}/5
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      <p className="text-xs text-muted-foreground mt-1">{candidate.experience} experience</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Badge className={candidateStatusConfig[candidate.status]?.color}>
                        {candidate.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{candidate.source}</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-3 w-3 mr-1" /> Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Funnel</CardTitle>
              <CardDescription>Candidate progression through hiring stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruitmentFunnel.map((stage, i) => (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">{stage.count} ({stage.percent}%)</span>
                    </div>
                    <div className="mt-2 h-8 w-full rounded-lg bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percent}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        className="h-full rounded-lg bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Scheduled interviews for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { candidate: 'Amit Kumar', position: 'Sr. Engineer', interviewer: 'Rahul K.', date: 'Jul 3, 2024', time: '10:00 AM', type: 'Technical' },
                  { candidate: 'Sneha Patel', position: 'Product Manager', interviewer: 'Anjali S.', date: 'Jul 3, 2024', time: '2:00 PM', type: 'HR Round' },
                  { candidate: 'Ravi Sharma', position: 'UI/UX Designer', interviewer: 'Neha G.', date: 'Jul 4, 2024', time: '11:00 AM', type: 'Portfolio Review' },
                  { candidate: 'Priya Singh', position: 'Sales Executive', interviewer: 'Vikram R.', date: 'Jul 5, 2024', time: '3:00 PM', type: 'Final Round' },
                ].map((interview, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{interview.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{interview.candidate}</p>
                        <p className="text-sm text-muted-foreground">{interview.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{interview.date} at {interview.time}</p>
                      <p className="text-xs text-muted-foreground">{interview.type} with {interview.interviewer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Reschedule</Button>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
