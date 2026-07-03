'use client';

import { motion } from 'framer-motion';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Mail,
  MessageSquare,
  Package,
  Camera,
  IdCard,
  BookOpen,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const stats = {
    inProgress: 8,
    completedMonth: 12,
    avgCompletionTime: 5,
    pendingTasks: 15,
  };

  const newHires = [
    { id: '1', name: 'Rohan Mehta', position: 'Software Engineer', department: 'Engineering', startDate: '2024-07-01', progress: 85, status: 'in_progress', buddy: 'Arjun Sharma' },
    { id: '2', name: 'Kavita Reddy', position: 'UX Designer', department: 'Design', startDate: '2024-07-05', progress: 45, status: 'in_progress', buddy: 'Neha Gupta' },
    { id: '3', name: 'Suresh Kumar', position: 'Sales Executive', department: 'Sales', startDate: '2024-07-08', progress: 20, status: 'in_progress', buddy: 'Priya Patel' },
    { id: '4', name: 'Anita Sharma', position: 'HR Executive', department: 'HR', startDate: '2024-07-10', progress: 0, status: 'pending', buddy: 'Anjali Singh' },
  ];

  const onboardingTasks = [
    { task: 'Welcome Email Sent', type: 'communication', assignee: 'HR', completed: true },
    { task: 'Document Collection', type: 'documents', assignee: 'Employee', completed: true },
    { task: 'Equipment Setup', type: 'equipment', assignee: 'IT', completed: true },
    { task: 'Account Creation', type: 'access', assignee: 'IT', completed: true },
    { task: 'Policy Training', type: 'training', assignee: 'HR', completed: false },
    { task: 'Team Introduction', type: 'orientation', assignee: 'Manager', completed: false },
    { task: 'Tool Training', type: 'training', assignee: 'Buddy', completed: false },
    { task: '30-Day Review', type: 'review', assignee: 'Manager', completed: false },
  ];

  const completedOnboarding = [
    { name: 'Vikram Singh', completed: '2024-06-28', score: 92 },
    { name: 'Priya Nair', completed: '2024-06-25', score: 88 },
    { name: 'Amit Sharma', completed: '2024-06-20', score: 95 },
  ];

  const taskIcons: Record<string, typeof Mail> = {
    communication: Mail,
    documents: FileText,
    equipment: Package,
    access: IdCard,
    training: BookOpen,
    orientation: Users,
    review: CheckCircle2,
  };

  return (
    <AppShell>
      <PageHeader
        title="Onboarding Management"
        description="Track new employee onboarding progress"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'In Progress', value: stats.inProgress, icon: UserPlus, color: 'text-blue-600' },
          { label: 'Completed This Month', value: stats.completedMonth, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Avg. Completion', value: `${stats.avgCompletionTime} days`, icon: Clock, color: 'text-purple-600' },
          { label: 'Pending Tasks', value: stats.pendingTasks, icon: FileText, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs className="mt-6" defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="checklist">Onboarding Checklist</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newHires.map((hire, i) => (
              <motion.div
                key={hire.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg">
                            {hire.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{hire.name}</p>
                          <p className="text-sm text-muted-foreground">{hire.position}</p>
                        </div>
                      </div>
                      <Badge className={hire.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700' : 'bg-blue-500/10 text-blue-700'}>
                        {hire.status === 'pending' ? 'Not Started' : 'In Progress'}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Department</span>
                        <span>{hire.department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Date</span>
                        <span>{hire.startDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Buddy</span>
                        <span>{hire.buddy}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{hire.progress}%</span>
                        </div>
                        <Progress value={hire.progress} className="h-2" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                      <Button size="sm" className="flex-1">Update Progress</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Onboarding Checklist</CardTitle>
              <CardDescription>Default tasks for all new hires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboardingTasks.map((task, i) => {
                  const Icon = taskIcons[task.type] || FileText;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center',
                          task.completed ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">Assigned to: {task.assignee}</p>
                        </div>
                      </div>
                      {task.completed ? (
                        <Badge className="bg-green-500/10 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {completedOnboarding.map((emp, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">Completed: {emp.completed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {emp.score}%</p>
                        <p className="text-xs text-muted-foreground">Onboarding Rating</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Onboarded
                      </Badge>
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
