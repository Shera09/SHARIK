'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Bell,
  CheckCircle,
  UserCheck,
  Smartphone,
  Download,
  GraduationCap,
  Award,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const mobileHRFeatures = [
  { label: 'Mark Attendance', icon: Clock, description: 'GPS-verified check-in/out', available: true },
  { label: 'Apply Leave', icon: Calendar, description: 'Request and track leaves', available: true },
  { label: 'View Payslips', icon: DollarSign, description: 'Access salary slips', available: true },
  { label: 'Update Profile', icon: UserCheck, description: 'Personal info management', available: true },
  { label: 'Training', icon: GraduationCap, description: 'Complete courses on mobile', available: true },
  { label: 'View Tasks', icon: Briefcase, description: 'Task assignments and tracking', available: true },
  { label: 'Submit Expenses', icon: DollarSign, description: 'Expense claims with receipts', available: true },
  { label: 'Company Policies', icon: FileText, description: 'Access policy documents', available: true },
];

const recentHRActions = [
  { id: '1', type: 'attendance', title: 'Check-in recorded', user: 'John Smith', time: '9:00 AM', location: 'Main Office' },
  { id: '2', type: 'leave', title: 'Leave requested for July 15', user: 'Sarah Johnson', time: '10:30 AM', type_label: 'Annual Leave' },
  { id: '3', type: 'expense', title: 'Travel expense submitted', user: 'Mike Chen', time: '11:45 AM', amount: '₹4,500' },
  { id: '4', type: 'training', title: 'Completed Safety Training', user: 'Emily Davis', time: '2:00 PM', score: '95%' },
];

const actionColors: Record<string, string> = {
  attendance: 'bg-green-500/10 text-green-600',
  leave: 'bg-blue-500/10 text-blue-600',
  expense: 'bg-orange-500/10 text-orange-600',
  training: 'bg-purple-500/10 text-purple-600',
};

export default function MobileHRMSPage() {
  const stats = {
    checkedIn: 145,
    onLeave: 12,
    pendingExpenses: 8,
    trainingsCompleted: 23,
  };

  return (
    <AppShell>
      <PageHeader
        title="Mobile HRMS"
        description="Employee self-service and HR management on mobile"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Checked In', value: stats.checkedIn, icon: Clock, color: 'text-green-500' },
          { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'text-blue-500' },
          { label: 'Pending Expenses', value: stats.pendingExpenses, icon: DollarSign, color: 'text-orange-500' },
          { label: 'Trainings Done', value: stats.trainingsCompleted, icon: GraduationCap, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="features" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="features" className="rounded-lg gap-1.5">
            <Smartphone className="h-4 w-4" />
            Mobile Features
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-1.5">
            <Bell className="h-4 w-4" />
            Recent Actions
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-lg gap-1.5">
            <Award className="h-4 w-4" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileHRFeatures.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      {feature.available && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{feature.label}</CardTitle>
                    <CardDescription className="text-xs mt-1">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentHRActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge className={cn('text-[10px]', actionColors[action.type])}>
                        {action.type}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.user} • {action.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {action.location && <span>{action.location}</span>}
                      {action.type_label && <span>{action.type_label}</span>}
                      {action.amount && <span>{action.amount}</span>}
                      {action.score && <span>Score: {action.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Announcements</CardTitle>
              <CardDescription>Latest updates from HR department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Annual Performance Review', date: 'July 15, 2024', content: 'Performance reviews begin next week. Please complete self-assessment by July 20.' },
                  { title: 'New Leave Policy', date: 'July 10, 2024', content: 'Updated leave policy now allows work-from-home for up to 3 days per week.' },
                ].map((announcement) => (
                  <div key={announcement.title} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{announcement.title}</p>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
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
