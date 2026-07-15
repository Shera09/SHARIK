'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Search,
  Star,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Award,
  MoreHorizontal,
  Eye,
  Edit,
  Filter,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const performanceDistribution = [
  { rating: '5 - Exceptional', count: 12, color: 'hsl(142 71% 45%)' },
  { rating: '4 - Exceeds', count: 45, color: 'hsl(199 89% 48%)' },
  { rating: '3 - Meets', count: 95, color: 'hsl(221 83% 53%)' },
  { rating: '2 - Needs Improvement', count: 23, color: 'hsl(38 92% 50%)' },
  { rating: '1 - Below', count: 5, color: 'hsl(0 84% 60%)' },
];

const skillsData = [
  { skill: 'Technical', A: 85, B: 75, fullMark: 100 },
  { skill: 'Communication', A: 78, B: 70, fullMark: 100 },
  { skill: 'Leadership', A: 65, B: 55, fullMark: 100 },
  { skill: 'Teamwork', A: 90, B: 80, fullMark: 100 },
  { skill: 'Problem Solving', A: 82, B: 72, fullMark: 100 },
  { skill: 'Innovation', A: 70, B: 60, fullMark: 100 },
];

const goalStats = {
  totalGoals: 245,
  completed: 156,
  inProgress: 72,
  notStarted: 17,
  avgCompletion: 64,
};

export default function PerformancePage() {
  const [createGoalOpen, setCreateGoalOpen] = useState(false);

  const cycles = [
    { id: '1', name: 'Q1 2024 Review', period: 'Jan - Mar 2024', status: 'closed', employees: 180, completion: 100 },
    { id: '2', name: 'Q2 2024 Review', period: 'Apr - Jun 2024', status: 'active', employees: 180, completion: 75 },
    { id: '3', name: 'Annual 2024', period: 'Jan - Dec 2024', status: 'pending', employees: 180, completion: 0 },
  ];

  const employees = [
    { id: 'EMP001', name: 'Arjun Sharma', department: 'Engineering', goals: 5, completed: 4, rating: 4.2, status: 'submitted' },
    { id: 'EMP002', name: 'Priya Patel', department: 'Sales', goals: 4, completed: 3, rating: 4.5, status: 'pending_review' },
    { id: 'EMP003', name: 'Rahul Kumar', department: 'Engineering', goals: 6, completed: 5, rating: 4.8, status: 'completed' },
    { id: 'EMP004', name: 'Anjali Singh', department: 'HR', goals: 4, completed: 4, rating: 4.0, status: 'completed' },
    { id: 'EMP005', name: 'Vikram Reddy', department: 'Finance', goals: 3, completed: 1, rating: 3.2, status: 'pending' },
  ];

  const goals = [
    { id: '1', title: 'Complete API Integration', employee: 'Arjun Sharma', progress: 80, dueDate: '2024-06-30', status: 'in_progress', weight: 25 },
    { id: '2', title: 'Q2 Sales Target', employee: 'Priya Patel', progress: 100, dueDate: '2024-06-30', status: 'completed', weight: 30 },
    { id: '3', title: 'Team Building Activity', employee: 'Anjali Singh', progress: 100, dueDate: '2024-05-15', status: 'completed', weight: 20 },
    { id: '4', title: 'Code Review Coverage', employee: 'Rahul Kumar', progress: 60, dueDate: '2024-07-15', status: 'in_progress', weight: 25 },
    { id: '5', title: 'Budget Optimization', employee: 'Vikram Reddy', progress: 30, dueDate: '2024-07-30', status: 'at_risk', weight: 35 },
  ];

  const recognitions = [
    { id: '1', employee: 'Rahul Kumar', type: 'Employee of the Month', points: 500, date: '2024-06-01', awardedBy: 'Anjali Singh' },
    { id: '2', employee: 'Priya Patel', type: 'Spot Award', points: 100, date: '2024-06-15', awardedBy: 'Vikram Reddy' },
    { id: '3', employee: 'Engineering Team', type: 'Team Excellence', points: 200, date: '2024-06-20', awardedBy: 'Arjun Sharma' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Performance Management"
        description="Goals, reviews, feedback, and employee recognition"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Performance Goal</DialogTitle>
                  <DialogDescription>
                    Set a new goal for yourself or your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input className="mt-1.5" placeholder="Enter goal title" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input className="mt-1.5" placeholder="Goal description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date</Label>
                      <Input className="mt-1.5" type="date" />
                    </div>
                    <div>
                      <Label>Weight (%)</Label>
                      <Input className="mt-1.5" type="number" placeholder="20" />
                    </div>
                  </div>
                  <div>
                    <Label>Assign To</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateGoalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setCreateGoalOpen(false)}>Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Goals', value: goalStats.totalGoals, icon: Target, color: 'text-blue-600' },
          { label: 'Completed', value: goalStats.completed, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'In Progress', value: goalStats.inProgress, icon: Clock, color: 'text-orange-600' },
          { label: 'Avg. Completion', value: `${goalStats.avgCompletion}%`, icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Reviews Pending', value: 28, icon: Users, color: 'text-cyan-600' },
          { label: 'Recognition Given', value: 45, icon: Trophy, color: 'text-pink-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Employee ratings across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="rating" type="category" className="text-xs" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {performanceDistribution.map((entry, index) => (
                      <Bar key={`cell-${index}`} dataKey="count" fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Overview</CardTitle>
            <CardDescription>Avg. vs Target scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" className="text-xs" />
                  <PolarRadiusAxis />
                  <Radar name="Current" dataKey="A" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53%)" fillOpacity={0.5} />
                  <Radar name="Target" dataKey="B" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45%)" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs className="mt-6" defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="cycles">Review Cycles</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {goals.map((goal, i) => (
                  <div key={goal.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{goal.title}</p>
                          <Badge className={cn(
                            goal.status === 'completed' && 'bg-green-500/10 text-green-700',
                            goal.status === 'in_progress' && 'bg-blue-500/10 text-blue-700',
                            goal.status === 'at_risk' && 'bg-red-500/10 text-red-700',
                          )}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{goal.employee}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-32">
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12">{goal.progress}%</span>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Due</p>
                          <p className="text-sm">{new Date(goal.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {employees.map((emp, i) => (
                  <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.id} | {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">Goals: {emp.completed}/{emp.goals}</p>
                        <p className="text-xs text-muted-foreground">Weight: {emp.goals * 20}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{emp.rating}</span>
                      </div>
                      <Badge>{emp.status.replace('_', ' ')}</Badge>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cycles.map((cycle, i) => (
              <Card key={cycle.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cycle.name}</CardTitle>
                    <Badge className={cn(
                      cycle.status === 'closed' && 'bg-gray-500/10 text-gray-700',
                      cycle.status === 'active' && 'bg-green-500/10 text-green-700',
                      cycle.status === 'pending' && 'bg-yellow-500/10 text-yellow-700',
                    )}>
                      {cycle.status}
                    </Badge>
                  </div>
                  <CardDescription>{cycle.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion</span>
                        <span>{cycle.completion}%</span>
                      </div>
                      <Progress value={cycle.completion} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{cycle.employees} Employees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recognition" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Recognitions</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Award className="h-4 w-4" /> Give Recognition
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recognitions.map((rec, i) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{rec.employee}</p>
                        <p className="text-sm text-muted-foreground">{rec.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">{rec.points} pts</p>
                      <p className="text-xs text-muted-foreground">By {rec.awardedBy}</p>
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
