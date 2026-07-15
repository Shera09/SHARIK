'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Play,
  Pause,
  Calendar,
  Sparkles,
  Target,
  BarChart3,
  Award,
  MessageSquare,
  ChevronRight,
  Video,
  FileText,
  Lightbulb,
  Brain,
  Heart,
  Zap,
  Star,
  TrendingUp,
  User,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type CoachingProgram = {
  id: string;
  name: string;
  description: string;
  target_role: string;
  skills_focus: string[];
  duration_weeks: number;
  total_sessions: number;
  ai_approach: string;
  learning_objectives: string[];
  is_active: boolean;
  created_at: string;
};

type CoachingSession = {
  id: string;
  program_id: string;
  employee_id: string;
  session_number: number;
  title: string;
  status: string;
  scheduled_at: string;
  started_at: string;
  completed_at: string;
  ai_coach_notes: string;
  employee_reflections: string;
  key_learnings: string[];
  action_items: string[];
  progress_score: number;
  engagement_score: number;
  created_at: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar_url: string;
  coaching_status: string;
  programs_enrolled: number;
  sessions_completed: number;
  overall_progress: number;
};

const skillCategories = [
  'Leadership', 'Communication', 'Problem Solving', 'Time Management',
  'Technical Skills', 'Sales', 'Customer Service', 'Project Management',
  'Team Collaboration', 'Strategic Thinking', 'Emotional Intelligence', 'Adaptability'
];

const defaultProgram = {
  name: '',
  description: '',
  target_role: '',
  skills_focus: [] as string[],
  duration_weeks: 4,
  total_sessions: 4,
  ai_approach: '',
  learning_objectives: [] as string[],
};

export default function AICoachPage() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<CoachingProgram[]>([]);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('programs');
  const [createDialog, setCreateDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<CoachingProgram | null>(null);
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null);
  const [newProgram, setNewProgram] = useState(defaultProgram);
  const [skillInput, setSkillInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [programsRes, sessionsRes] = await Promise.all([
      supabase.from('coaching_programs').select('*').order('created_at', { ascending: false }),
      supabase.from('coaching_sessions').select('*').order('scheduled_at', { ascending: false }).limit(20),
    ]);

    if (programsRes.data) setPrograms(programsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);

    // Simulated employees for demo
    setEmployees([
      { id: '1', name: 'Rahul Sharma', role: 'Sales Manager', department: 'Sales', avatar_url: '', coaching_status: 'active', programs_enrolled: 2, sessions_completed: 6, overall_progress: 75 },
      { id: '2', name: 'Priya Patel', role: 'Team Lead', department: 'Operations', avatar_url: '', coaching_status: 'active', programs_enrolled: 1, sessions_completed: 3, overall_progress: 60 },
      { id: '3', name: 'Vikram Singh', role: 'Developer', department: 'Engineering', avatar_url: '', coaching_status: 'pending', programs_enrolled: 0, sessions_completed: 0, overall_progress: 0 },
      { id: '4', name: 'Anita Desai', role: 'Customer Success', department: 'Support', avatar_url: '', coaching_status: 'completed', programs_enrolled: 1, sessions_completed: 4, overall_progress: 100 },
      { id: '5', name: 'Amit Kumar', role: 'Marketing Lead', department: 'Marketing', avatar_url: '', coaching_status: 'active', programs_enrolled: 2, sessions_completed: 8, overall_progress: 85 },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addSkill = () => {
    if (skillInput.trim() && !newProgram.skills_focus.includes(skillInput.trim())) {
      setNewProgram(p => ({ ...p, skills_focus: [...p.skills_focus, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewProgram(p => ({ ...p, skills_focus: p.skills_focus.filter(s => s !== skill) }));
  };

  const addObjective = () => {
    if (objectiveInput.trim() && !newProgram.learning_objectives.includes(objectiveInput.trim())) {
      setNewProgram(p => ({ ...p, learning_objectives: [...p.learning_objectives, objectiveInput.trim()] }));
      setObjectiveInput('');
    }
  };

  const removeObjective = (obj: string) => {
    setNewProgram(p => ({ ...p, learning_objectives: p.learning_objectives.filter(o => o !== obj) }));
  };

  const saveProgram = async () => {
    if (!newProgram.name.trim()) {
      toast.error('Program name is required');
      return;
    }
    if (newProgram.skills_focus.length === 0) {
      toast.error('Add at least one skill focus');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('coaching_programs').insert({
      name: newProgram.name,
      description: newProgram.description,
      target_role: newProgram.target_role,
      skills_focus: newProgram.skills_focus,
      duration_weeks: newProgram.duration_weeks,
      total_sessions: newProgram.total_sessions,
      ai_approach: newProgram.ai_approach,
      learning_objectives: newProgram.learning_objectives,
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Coaching program created');
      setCreateDialog(false);
      setNewProgram(defaultProgram);
      loadData();
    }
    setSaving(false);
  };

  const startSession = async (session: CoachingSession) => {
    const { error } = await supabase.from('coaching_sessions').update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    }).eq('id', session.id);

    if (error) toast.error(error.message);
    else {
      toast.success('Session started');
      loadData();
    }
  };

  const completeSession = async (session: CoachingSession) => {
    const { error } = await supabase.from('coaching_sessions').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress_score: 85,
      engagement_score: 90,
    }).eq('id', session.id);

    if (error) toast.error(error.message);
    else {
      toast.success('Session completed');
      setSessionDialog(false);
      loadData();
    }
  };

  const stats = {
    activePrograms: programs.filter(p => p.is_active).length,
    activeSessions: sessions.filter(s => s.status === 'in_progress').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    avgProgress: employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.overall_progress, 0) / employees.length)
      : 0,
  };

  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress');

  return (
    <AppShell>
      <PageHeader
        title="AI Coach"
        description="Personalized AI-powered employee coaching and development"
        action={
          <Button
            onClick={() => setCreateDialog(true)}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Program
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="h-96 rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Programs', value: stats.activePrograms, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Sessions In Progress', value: stats.activeSessions, icon: Play, color: 'text-orange-500' },
              { label: 'Completed Sessions', value: stats.completedSessions, icon: CheckCircle, color: 'text-success' },
              { label: 'Avg Team Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-purple-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card p-1 h-auto mb-4">
              <TabsTrigger value="programs" className="rounded-lg gap-2">
                <BookOpen className="h-4 w-4" />
                Programs
              </TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-lg gap-2">
                <Calendar className="h-4 w-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="employees" className="rounded-lg gap-2">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="insights" className="rounded-lg gap-2">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            <TabsContent value="programs" className="mt-0">
              {programs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">No Coaching Programs</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered coaching program</p>
                  <Button onClick={() => setCreateDialog(true)} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Create Program
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.map((program, i) => (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card overflow-hidden premium-shadow group hover:shadow-lg transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <Badge className={program.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <h3 className="font-semibold mb-1">{program.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{program.description}</p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(program.skills_focus as string[] || []).slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                          ))}
                          {(program.skills_focus as string[] || []).length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{(program.skills_focus as string[]).length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {program.duration_weeks} weeks
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5" />
                            {program.total_sessions} sessions
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedProgram(program)}
                          variant="outline"
                          className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="mt-0">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Scheduled Sessions */}
                <div className="glass-card overflow-hidden premium-shadow">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Scheduled Sessions
                    </h3>
                    <Badge variant="outline">{scheduledSessions.length}</Badge>
                  </div>
                  {scheduledSessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No scheduled sessions</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
                      {scheduledSessions.map((session) => (
                        <div key={session.id} className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Session {session.session_number}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{session.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(session.scheduled_at).toLocaleString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Button size="sm" onClick={() => startSession(session)} className="rounded-lg">
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Start
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* In Progress Sessions */}
                <div className="glass-card overflow-hidden premium-shadow">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Play className="h-4 w-4 text-orange-500" />
                      In Progress
                    </h3>
                    <Badge className="bg-orange-500/10 text-orange-500">{inProgressSessions.length}</Badge>
                  </div>
                  {inProgressSessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <Play className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No sessions in progress</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {inProgressSessions.map((session) => (
                        <div key={session.id} className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{session.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">Started {session.started_at ? new Date(session.started_at).toLocaleTimeString() : ''}</p>
                              {session.progress_score > 0 && (
                                <div className="mt-2 w-32">
                                  <Progress value={session.progress_score} className="h-1.5" />
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedSession(session);
                                setSessionDialog(true);
                              }}
                              className="rounded-lg"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees" className="mt-0">
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-semibold">Team Coaching Progress</h3>
                </div>
                <div className="divide-y divide-border/40">
                  {employees.map((employee) => (
                    <div key={employee.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.role} - {employee.department}</p>
                            </div>
                            <Badge className={cn(
                              employee.coaching_status === 'completed' ? 'bg-success/10 text-success' :
                              employee.coaching_status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {employee.coaching_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {employee.programs_enrolled} programs
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {employee.sessions_completed} sessions
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{employee.overall_progress}%</span>
                            </div>
                            <Progress value={employee.overall_progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {/* AI Recommendations */}
                <div className="glass-card p-6 premium-shadow">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Coaching Recommendations
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Leadership Development Track', desc: '3 employees ready for leadership coaching based on performance metrics', icon: Award, color: 'text-yellow-500' },
                      { title: 'Communication Skills Gap', desc: '15% of team members would benefit from communication workshops', icon: MessageSquare, color: 'text-blue-500' },
                      { title: 'High Potential Alert', desc: 'Rahul Sharma showing exceptional progress - consider advanced track', icon: Star, color: 'text-orange-500' },
                      { title: 'Time Management Focus', desc: 'Q3 goal alignment requires time management refresh for Operations team', icon: Clock, color: 'text-cyan-500' },
                    ].map((rec, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0', rec.color.replace('text-', 'bg-') + '/10')}>
                            <rec.icon className={cn('h-5 w-5', rec.color)} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program Effectiveness */}
                <div className="glass-card p-6 premium-shadow">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Program Effectiveness
                  </h3>
                  <div className="space-y-4">
                    {programs.slice(0, 4).map((program, i) => {
                      const effectiveness = 70 + Math.random() * 30;
                      return (
                        <div key={program.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{program.name}</span>
                            <Badge variant="outline" className={effectiveness >= 85 ? 'text-success' : effectiveness >= 70 ? 'text-blue-500' : 'text-yellow-500'}>
                              {effectiveness.toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={effectiveness} className="h-2" />
                          <p className="text-[10px] text-muted-foreground">
                            Based on {Math.floor(3 + Math.random() * 5)} completed sessions
                          </p>
                        </div>
                      );
                    })}
                    {programs.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No programs to analyze
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Insights */}
                <div className="lg:col-span-2 glass-card p-6 premium-shadow">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Key Learning Insights
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Avg Session Rating', value: '4.8/5', icon: Star, trend: '+0.3' },
                      { label: 'Completion Rate', value: '92%', icon: CheckCircle, trend: '+5%' },
                      { label: 'Skill Improvement', value: '73%', icon: TrendingUp, trend: '+12%' },
                      { label: 'Engagement Score', value: '8.5/10', icon: Heart, trend: '+0.7' },
                    ].map((metric, i) => (
                      <div key={metric.label} className="p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <metric.icon className="h-3.5 w-3.5" />
                          {metric.label}
                        </div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-[10px] text-success mt-1">{metric.trend} from last month</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create Program Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Coaching Program</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Program Name *</Label>
              <Input
                value={newProgram.name}
                onChange={(e) => setNewProgram(p => ({ ...p, name: e.target.value }))}
                placeholder="Leadership Development Program"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={newProgram.description}
                onChange={(e) => setNewProgram(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Help your team develop essential leadership skills..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Target Role</Label>
                <Input
                  value={newProgram.target_role}
                  onChange={(e) => setNewProgram(p => ({ ...p, target_role: e.target.value }))}
                  placeholder="Team Lead, Manager"
                />
              </div>
              <div className="grid gap-2">
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  value={newProgram.duration_weeks}
                  onChange={(e) => setNewProgram(p => ({ ...p, duration_weeks: parseInt(e.target.value) || 4 }))}
                  min={1}
                  max={52}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Skills Focus</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button onClick={addSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newProgram.skills_focus.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Total Sessions</Label>
              <Input
                type="number"
                value={newProgram.total_sessions}
                onChange={(e) => setNewProgram(p => ({ ...p, total_sessions: parseInt(e.target.value) || 4 }))}
                min={1}
                max={24}
              />
            </div>
            <div className="grid gap-2">
              <Label>AI Coaching Approach</Label>
              <Select value={newProgram.ai_approach} onValueChange={(v) => setNewProgram(p => ({ ...p, ai_approach: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select approach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="socratic">Socratic Method - Question-based learning</SelectItem>
                  <SelectItem value="directive">Directive - Structured guidance</SelectItem>
                  <SelectItem value="facilitative">Facilitative - Collaborative exploration</SelectItem>
                  <SelectItem value="coaching">Coaching - Goal-focused development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Learning Objectives</Label>
              <div className="flex gap-2">
                <Input
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  placeholder="Add objective..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button onClick={addObjective} variant="outline">Add</Button>
              </div>
              <ul className="space-y-1 mt-2">
                {newProgram.learning_objectives.map((obj, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    {obj}
                    <button onClick={() => removeObjective(obj)} className="ml-auto text-muted-foreground hover:text-destructive">×</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={saveProgram} disabled={saving} className="gap-2 rounded-xl">
              {saving ? 'Creating...' : 'Create Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={sessionDialog} onOpenChange={setSessionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSession?.title}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Started</p>
                  <p className="font-medium text-sm">
                    {selectedSession.started_at ? new Date(selectedSession.started_at).toLocaleTimeString() : 'Not started'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Progress</p>
                  <p className="font-medium text-sm">{selectedSession.progress_score || 0}%</p>
                </div>
              </div>

              {selectedSession.ai_coach_notes && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">AI Coach Notes</p>
                  <p className="text-sm">{selectedSession.ai_coach_notes}</p>
                </div>
              )}

              {(selectedSession.key_learnings as string[] || []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Key Learnings</p>
                  <ul className="space-y-1">
                    {(selectedSession.key_learnings as string[]).map((learning, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                        {learning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionDialog(false)}>Pause Session</Button>
            <Button onClick={() => selectedSession && completeSession(selectedSession)} className="gap-2 rounded-xl">
              <CheckCircle className="h-4 w-4" />
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
