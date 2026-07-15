'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserX,
  Plus,
  Search,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  MoreHorizontal,
  Eye,
  MessageSquare,
  FileCheck,
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
import { cn } from '@/lib/utils';

export default function ExitManagementPage() {
  const stats = {
    exitRequests: 5,
    pendingInterviews: 3,
    fnfPending: 4,
    completedThisMonth: 8,
    avgNoticePeriod: 32,
    avgExitTime: 14,
  };

  const exitRequests = [
    { id: '1', employee: 'Amit Kumar', code: 'EMP007', department: 'Operations', reason: 'Better Opportunity', lastDay: '2024-07-31', status: 'pending', type: 'resignation', submitted: '2024-06-15' },
    { id: '2', employee: 'Sneha Patel', code: 'EMP012', department: 'Sales', reason: 'Personal Reasons', lastDay: '2024-07-15', status: 'approved', type: 'resignation', submitted: '2024-06-01' },
    { id: '3', employee: 'Ravi Sharma', code: 'EMP015', department: 'Engineering', reason: 'End of Contract', lastDay: '2024-07-20', status: 'pending', type: 'contract_end', submitted: '2024-06-20' },
    { id: '4', employee: 'Neha Gupta', code: 'EMP018', department: 'Marketing', reason: 'Relocation', lastDay: '2024-08-15', status: 'pending', type: 'resignation', submitted: '2024-06-25' },
  ];

  const interviews = [
    { id: '1', employee: 'Sneha Patel', date: '2024-07-05', interviewer: 'Anjali Singh', status: 'scheduled', notes: null },
    { id: '2', employee: 'Amit Kumar', date: '2024-07-10', interviewer: 'HR Team', status: 'pending', notes: null },
    { id: '3', employee: 'Meera Nair', date: '2024-06-28', interviewer: 'Rahul Kumar', status: 'completed', notes: 'Positive feedback, would recommend' },
  ];

  const fnfSettlements = [
    { id: '1', employee: 'Sanjay Verma', lastDay: '2024-06-30', salaryDays: 30, salaryAmount: 125000, leaveEncashment: 15000, gratuity: 0, totalPayable: 142000, status: 'pending' },
    { id: '2', employee: 'Meera Nair', lastDay: '2024-06-25', salaryDays: 25, salaryAmount: 104000, leaveEncashment: 24000, gratuity: 50000, totalPayable: 178000, status: 'processing' },
    { id: '3', employee: 'Rajesh Kumar', lastDay: '2024-06-15', salaryDays: 15, salaryAmount: 62000, leaveEncashment: 8000, gratuity: 25000, totalPayable: 95000, status: 'paid' },
  ];

  const exitReasons = [
    { reason: 'Better Opportunity', count: 45, percentage: 40 },
    { reason: 'Personal Reasons', count: 25, percentage: 22 },
    { reason: 'Relocation', count: 18, percentage: 16 },
    { reason: 'Higher Studies', count: 12, percentage: 11 },
    { reason: 'Health Issues', count: 8, percentage: 7 },
    { reason: 'Others', count: 5, percentage: 4 },
  ];

  const statusConfig: Record<string, { color: string }> = {
    pending: { color: 'bg-yellow-500/10 text-yellow-700' },
    approved: { color: 'bg-green-500/10 text-green-700' },
    rejected: { color: 'bg-red-500/10 text-red-700' },
    scheduled: { color: 'bg-blue-500/10 text-blue-700' },
    completed: { color: 'bg-purple-500/10 text-purple-700' },
    processing: { color: 'bg-cyan-500/10 text-cyan-700' },
    paid: { color: 'bg-green-500/10 text-green-700' },
  };

  return (
    <AppShell>
      <PageHeader
        title="Exit Management"
        description="Handle employee exits, interviews, and settlements"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Exit Requests', value: stats.exitRequests, icon: UserX, color: 'text-red-600' },
          { label: 'Pending Interviews', value: stats.pendingInterviews, icon: MessageSquare, color: 'text-blue-600' },
          { label: 'FNF Pending', value: stats.fnfPending, icon: DollarSign, color: 'text-orange-600' },
          { label: 'Completed', value: stats.completedThisMonth, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Avg Notice', value: `${stats.avgNoticePeriod}d`, icon: Calendar, color: 'text-purple-600' },
          { label: 'Avg Exit Days', value: stats.avgExitTime, icon: Clock, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Exit Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Exit Reasons</CardTitle>
            <CardDescription>Common reasons for leaving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exitReasons.map((item, i) => (
              <div key={item.reason} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.reason}</span>
                  <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exit Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exit Requests</CardTitle>
            <CardDescription>Pending and recent exit applications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {exitRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{req.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{req.employee}</p>
                      <p className="text-sm text-muted-foreground">{req.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Last Day: {req.lastDay}</p>
                    <p className="text-xs text-muted-foreground">{req.reason}</p>
                  </div>
                  <Badge className={statusConfig[req.status]?.color}>{req.status}</Badge>
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
      </div>

      {/* Tabs */}
      <Tabs className="mt-6" defaultValue="interviews">
        <TabsList>
          <TabsTrigger value="interviews">Exit Interviews</TabsTrigger>
          <TabsTrigger value="fnf">FNF Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
              {interviews.map((int) => (
                  <div key={int.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{int.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{int.employee}</p>
                        <p className="text-sm text-muted-foreground">By {int.interviewer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{int.date}</p>
                      {int.notes && <p className="text-xs text-muted-foreground">{int.notes}</p>}
                    </div>
                    <Badge className={statusConfig[int.status]?.color}>{int.status}</Badge>
                    <Button variant="outline" size="sm">{int.status === 'scheduled' ? 'Conduct' : 'View'}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fnf" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {fnfSettlements.map((fnf) => (
                  <div key={fnf.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{fnf.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{fnf.employee}</p>
                        <p className="text-sm text-muted-foreground">Last Day: {fnf.lastDay}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Salary</p>
                        <p className="font-medium">(INR {fnf.salaryAmount.toLocaleString()})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Leave Encash</p>
                        <p className="font-medium">(INR {fnf.leaveEncashment.toLocaleString()})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-bold text-green-600">(INR {fnf.totalPayable.toLocaleString()})</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[fnf.status]?.color}>{fnf.status}</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Eye className="h-3 w-3" /></Button>
                      {fnf.status !== 'paid' && <Button size="sm">Process</Button>}
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
