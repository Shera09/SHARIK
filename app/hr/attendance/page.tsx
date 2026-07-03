'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  CheckSquare,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

const weeklyAttendance = [
  { day: 'Mon', present: 165, absent: 8, late: 7 },
  { day: 'Tue', present: 168, absent: 5, late: 7 },
  { day: 'Wed', present: 170, absent: 4, late: 6 },
  { day: 'Thu', present: 162, absent: 10, late: 8 },
  { day: 'Fri', present: 160, absent: 12, late: 8 },
];

export default function AttendancePage() {
  const stats = {
    totalEmployees: 180,
    presentToday: 165,
    absentToday: 8,
    lateToday: 7,
    onLeave: 8,
    wfh: 12,
    avgWorkHours: 8.2,
    overtimeHours: 45,
  };

  const todayRecords = [
    { id: '1', employee: 'Arjun Sharma', code: 'EMP001', checkIn: '09:00', checkOut: null, status: 'present', workHours: '6.5h', location: 'Bangalore' },
    { id: '2', employee: 'Priya Patel', code: 'EMP002', checkIn: '09:15', checkOut: null, status: 'late', workHours: '6.3h', location: 'Mumbai' },
    { id: '3', employee: 'Rahul Kumar', code: 'EMP003', checkIn: '08:45', checkOut: '17:30', status: 'present', workHours: '8.7h', location: 'Delhi' },
    { id: '4', employee: 'Anjali Singh', code: 'EMP004', checkIn: null, checkOut: null, status: 'on_leave', workHours: '0h', location: 'Mumbai' },
    { id: '5', employee: 'Vikram Reddy', code: 'EMP005', checkIn: '09:00', checkOut: null, status: 'wfh', workHours: '6.5h', location: 'Remote' },
    { id: '6', employee: 'Neha Gupta', code: 'EMP006', checkIn: null, checkOut: null, status: 'absent', workHours: '0h', location: 'Mumbai' },
  ];

  const corrections = [
    { id: '1', employee: 'Sanjay Verma', requestType: 'Missing Check-in', date: '2024-06-28', status: 'pending', reason: 'Biometric not working' },
    { id: '2', employee: 'Meera Nair', requestType: 'Late Correction', date: '2024-06-27', status: 'approved', reason: 'System issue' },
    { id: '3', employee: 'Amit Kumar', requestType: 'Early Departure', date: '2024-06-26', status: 'rejected', reason: 'Personal work' },
  ];

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    present: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
    late: { color: 'bg-yellow-500/10 text-yellow-700', icon: Clock },
    absent: { color: 'bg-red-500/10 text-red-700', icon: XCircle },
    on_leave: { color: 'bg-blue-500/10 text-blue-700', icon: Calendar },
    wfh: { color: 'bg-purple-500/10 text-purple-700', icon: MapPin },
  };

  return (
    <AppShell>
      <PageHeader
        title="Attendance Management"
        description="Track employee attendance, manage corrections, and monitor work hours"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => {}}>
              <Clock className="h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {[
          { label: 'Total', value: stats.totalEmployees, icon: Users, color: 'text-blue-600' },
          { label: 'Present', value: stats.presentToday, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Absent', value: stats.absentToday, icon: XCircle, color: 'text-red-600' },
          { label: 'Late', value: stats.lateToday, icon: Clock, color: 'text-yellow-600' },
          { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'text-blue-600' },
          { label: 'WFH', value: stats.wfh, icon: MapPin, color: 'text-purple-600' },
          { label: 'Avg Hours', value: stats.avgWorkHours, icon: Clock, color: 'text-cyan-600' },
          { label: 'Overtime', value: `${stats.overtimeHours}h`, icon: Clock, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-3">
            <stat.icon className={cn('h-4 w-4', stat.color)} />
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Attendance trend for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="present" fill="hsl(142 71% 45%)" name="Present" />
                  <Bar dataKey="absent" fill="hsl(0 84% 60%)" name="Absent" />
                  <Bar dataKey="late" fill="hsl(38 92% 50%)" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>Attendance breakdown for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-500/10">
                <p className="text-3xl font-bold text-green-600">
                  {((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Attendance Rate</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10">
                <p className="text-3xl font-bold text-blue-600">{stats.avgWorkHours}h</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Work Hours</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10">
                <p className="text-3xl font-bold text-yellow-600">{stats.lateToday}</p>
                <p className="text-sm text-muted-foreground mt-1">Late Arrivals</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10">
                <p className="text-3xl font-bold text-purple-600">{stats.wfh}</p>
                <p className="text-sm text-muted-foreground mt-1">Working From Home</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs className="mt-6" defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today's Records</TabsTrigger>
          <TabsTrigger value="corrections">Correction Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {todayRecords.map((record, i) => {
                  const status = statusConfig[record.status] || statusConfig.present;
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{record.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.employee}</p>
                          <p className="text-sm text-muted-foreground">{record.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm">In: {record.checkIn || '--:--'}</p>
                          <p className="text-sm text-muted-foreground">Out: {record.checkOut || '--:--'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{record.workHours}</p>
                          <p className="text-xs text-muted-foreground">{record.location}</p>
                        </div>
                        <Badge className={status.color}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {corrections.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div>
                      <p className="font-medium">{req.employee}</p>
                      <p className="text-sm text-muted-foreground">{req.requestType} - {req.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{req.reason}</p>
                    </div>
                    <Badge className={cn(
                      req.status === 'pending' && 'bg-yellow-500/10 text-yellow-700',
                      req.status === 'approved' && 'bg-green-500/10 text-green-700',
                      req.status === 'rejected' && 'bg-red-500/10 text-red-700',
                    )}>
                      {req.status}
                    </Badge>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Daily Attendance Report', description: 'Complete daily attendance', icon: Calendar },
              { title: 'Monthly Summary', description: 'Monthly attendance trends', icon: Calendar },
              { title: 'Late Arrivals Report', description: 'Employees with late marks', icon: Clock },
              { title: 'Absenteeism Report', description: 'Absentee patterns', icon: XCircle },
              { title: 'Overtime Report', description: 'Overtime hours logged', icon: Clock },
              { title: 'WFH Report', description: 'Work from home stats', icon: MapPin },
            ].map((report, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <report.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
