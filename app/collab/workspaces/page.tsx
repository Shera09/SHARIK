'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Archive,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Video,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ProjectWorkspace {
  project_workspace_id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  progress_percent: number;
  priority: string;
  owner_id: string;
}

export default function ProjectWorkspacesPage() {
  const [projects, setProjects] = useState<ProjectWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('project_workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    planning: { color: 'bg-blue-500/10 text-blue-700', icon: Clock },
    active: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
    on_hold: { color: 'bg-yellow-500/10 text-yellow-700', icon: AlertTriangle },
    completed: { color: 'bg-purple-500/10 text-purple-700', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-500/10 text-red-700', icon: AlertTriangle },
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-green-500 text-white',
  };

  const mockProjects = projects.length > 0 ? projects : [
    { project_workspace_id: '1', name: 'Product Launch Q3', description: 'Launch new product line in Q3', status: 'active', start_date: '2026-07-01', end_date: '2026-09-30', progress_percent: 45, priority: 'high', owner_id: 'u1' },
    { project_workspace_id: '2', name: 'Website Redesign', description: 'Complete redesign of company website', status: 'planning', start_date: '2026-08-01', end_date: '2026-11-30', progress_percent: 10, priority: 'medium', owner_id: 'u2' },
    { project_workspace_id: '3', name: 'CRM Integration', description: 'Integrate CRM with sales pipeline', status: 'active', start_date: '2026-06-15', end_date: '2026-08-15', progress_percent: 75, priority: 'high', owner_id: 'u1' },
    { project_workspace_id: '4', name: 'Employee Training Program', description: 'Annual training and certification', status: 'completed', start_date: '2026-01-01', end_date: '2026-06-30', progress_percent: 100, priority: 'low', owner_id: 'u3' },
    { project_workspace_id: '5', name: 'Data Migration', description: 'Migrate legacy data to new system', status: 'on_hold', start_date: '2026-05-01', end_date: '2026-07-31', progress_percent: 30, priority: 'medium', owner_id: 'u2' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Project Workspaces"
        description="Manage projects, collaborate with teams, and track progress"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new project workspace for your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Project Name</Label>
                  <Input className="mt-1.5" placeholder="Enter project name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" placeholder="Brief description..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
        {[
          { label: 'Total', value: mockProjects.length, color: 'text-blue-600' },
          { label: 'Active', value: mockProjects.filter(p => p.status === 'active').length, color: 'text-green-600' },
          { label: 'Planning', value: mockProjects.filter(p => p.status === 'planning').length, color: 'text-blue-600' },
          { label: 'Completed', value: mockProjects.filter(p => p.status === 'completed').length, color: 'text-purple-600' },
          { label: 'On Hold', value: mockProjects.filter(p => p.status === 'on_hold').length, color: 'text-yellow-600' },
          { label: 'High Priority', value: mockProjects.filter(p => p.priority === 'high').length, color: 'text-red-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1 border rounded-lg p-1">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl shimmer" />)}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map((project, i) => {
              const status = statusConfig[project.status] || statusConfig.planning;
              const Icon = status.icon;

              return (
                <motion.div
                  key={project.project_workspace_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <Badge className={priorityColors[project.priority] || priorityColors.medium}>
                              {project.priority}
                            </Badge>
                          </div>
                          <CardDescription className="mt-1 line-clamp-1">{project.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress_percent}%</span>
                          </div>
                          <Progress value={project.progress_percent} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <Badge className={status.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <div className="flex -space-x-2">
                            <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>S</AvatarFallback></Avatar>
                            <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>M</AvatarFallback></Avatar>
                            <Avatar className="h-6 w-6 border-2 border-background"><AvatarFallback>+2</AvatarFallback></Avatar>
                          </div>
                          <div className="flex items-center gap-3 ml-auto text-muted-foreground">
                            <span className="flex items-center gap-1 text-xs"><FileText className="h-3 w-3" /> 12</span>
                            <span className="flex items-center gap-1 text-xs"><MessageSquare className="h-3 w-3" /> 24</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockProjects.map((project, i) => {
                  const status = statusConfig[project.status] || statusConfig.planning;
                  const Icon = status.icon;

                  return (
                    <motion.div
                      key={project.project_workspace_id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.end_date).toLocaleDateString()}
                        </div>
                        <div className="w-24">
                          <Progress value={project.progress_percent} className="h-2" />
                        </div>
                        <Badge className={status.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
