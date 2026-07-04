'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  MoreHorizontal,
  Eye,
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
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  status: string;
  reason: string;
  created_at: string;
}

export default function LeavesPage() {
  const { toast } = useToast();
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [newLeave, setNewLeave] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  async function loadLeaves() {
    try {
      const { data, error } = await supabase
        .from('hr_leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLeaveRequests(data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    teamOnLeave: 8,
    pendingRequests: 5,
    approvedToday: 12,
    rejectedToday: 2,
    avgLeaveBalance: 18,
    leaveEncashment: 450000,
  };

  const leaveTypes = [
    { type: 'Casual Leave', code: 'CL', balance: 8, used: 4, total: 12, color: 'bg-blue-500' },
    { type: 'Sick Leave', code: 'SL', balance: 5, used: 1, total: 6, color: 'bg-red-500' },
    { type: 'Earned Leave', code: 'EL', balance: 15, used: 6, total: 21, color: 'bg-green-500' },
    { type: 'Compensatory', code: 'COMP', balance: 3, used: 0, total: 3, color: 'bg-purple-500' },
  ];

  const teamOnLeave = [
    { name: 'Meera Nair', type: 'Earned Leave', from: 'Jul 1', to: 'Jul 5' },
    { name: 'Amit Kumar', type: 'Sick Leave', from: 'Jul 2', to: 'Jul 3' },
    { name: 'Sneha Reddy', type: 'Casual Leave', from: 'Jul 2', to: 'Jul 2' },
  ];

  const statusConfig: Record<string, { color: string }> = {
    pending: { color: 'bg-yellow-500/10 text-yellow-700' },
    approved: { color: 'bg-green-500/10 text-green-700' },
    rejected: { color: 'bg-red-500/10 text-red-700' },
    cancelled: { color: 'bg-gray-500/10 text-gray-700' },
  };

  async function handleApplyLeave() {
    if (!newLeave.leave_type || !newLeave.from_date || !newLeave.to_date || !newLeave.reason) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const fromDate = new Date(newLeave.from_date);
    const toDate = new Date(newLeave.to_date);
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
      toast({ title: 'Error', description: 'Invalid date range', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('hr_leave_requests')
        .insert({
          leave_type: newLeave.leave_type,
          from_date: newLeave.from_date,
          to_date: newLeave.to_date,
          days,
          reason: newLeave.reason,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLeaveRequests(prev => [data, ...prev]);
        setNewLeave({ leave_type: '', from_date: '', to_date: '', reason: '' });
        setApplyLeaveOpen(false);
        toast({ title: 'Success', description: 'Leave request submitted' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit leave request', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveLeave(leave: LeaveRequest) {
    try {
      const { error } = await supabase
        .from('hr_leave_requests')
        .update({ status: 'approved' })
        .eq('id', leave.id);

      if (error) throw error;
      setLeaveRequests(prev => prev.map(l => l.id === leave.id ? { ...l, status: 'approved' } : l));
      toast({ title: 'Success', description: 'Leave request approved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve leave', variant: 'destructive' });
    }
  }

  async function handleRejectLeave(leave: LeaveRequest) {
    try {
      const { error } = await supabase
        .from('hr_leave_requests')
        .update({ status: 'rejected' })
        .eq('id', leave.id);

      if (error) throw error;
      setLeaveRequests(prev => prev.map(l => l.id === leave.id ? { ...l, status: 'rejected' } : l));
      toast({ title: 'Success', description: 'Leave request rejected' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject leave', variant: 'destructive' });
    }
  }

  const displayRequests = leaveRequests.length > 0 ? leaveRequests : [
    { id: '1', employee_id: '1', employee_name: 'Arjun Sharma', leave_type: 'Earned Leave', from_date: '2024-07-10', to_date: '2024-07-12', days: 3, status: 'pending', reason: 'Family function', created_at: new Date().toISOString() },
    { id: '2', employee_id: '2', employee_name: 'Priya Patel', leave_type: 'Casual Leave', from_date: '2024-07-08', to_date: '2024-07-08', days: 1, status: 'approved', reason: 'Personal work', created_at: new Date().toISOString() },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Leave Management"
        description="Manage leave requests, balances, and policies"
        action={
          <Dialog open={applyLeaveOpen} onOpenChange={setApplyLeaveOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit a new leave request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Leave Type *</Label>
                  <Select value={newLeave.leave_type} onValueChange={(v) => setNewLeave(prev => ({ ...prev, leave_type: v }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                      <SelectItem value="Compensatory">Compensatory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Date *</Label>
                    <Input className="mt-1.5" type="date" value={newLeave.from_date} onChange={(e) => setNewLeave(prev => ({ ...prev, from_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>To Date *</Label>
                    <Input className="mt-1.5" type="date" value={newLeave.to_date} onChange={(e) => setNewLeave(prev => ({ ...prev, to_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Reason *</Label>
                  <Input className="mt-1.5" placeholder="Enter reason for leave" value={newLeave.reason} onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setApplyLeaveOpen(false)}>Cancel</Button>
                <Button onClick={handleApplyLeave} disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'On Leave Today', value: stats.teamOnLeave, icon: Users, color: 'text-blue-600' },
          { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'text-yellow-600' },
          { label: 'Approved Today', value: stats.approvedToday, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Rejected Today', value: stats.rejectedToday, icon: XCircle, color: 'text-red-600' },
          { label: 'Avg Balance', value: `${stats.avgLeaveBalance}d`, icon: Calendar, color: 'text-purple-600' },
          { label: 'Leave Encashment', value: `${(stats.leaveEncashment / 1000).toFixed(0)}K`, icon: FileText, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leave Types */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
            <CardDescription>Your current leave entitlements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveTypes.map((leave) => (
              <div key={leave.code} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{leave.type}</span>
                  <span className="text-sm text-muted-foreground">{leave.balance}/{leave.total}</span>
                </div>
                <Progress value={(leave.balance / leave.total) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Used: {leave.used}</span>
                  <span>Available: {leave.balance}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team on Leave */}
        <Card>
          <CardHeader>
            <CardTitle>Team on Leave</CardTitle>
            <CardDescription>Employees currently on leave</CardDescription>
          </CardHeader>
          <CardContent>
            {teamOnLeave.map((emp, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.type}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p>{emp.from} - {emp.to}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leave Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Calendar</CardTitle>
            <CardDescription>Upcoming approved leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: 'Jul 5', day: 'Fri', leaves: 2 },
                { date: 'Jul 10', day: 'Wed', leaves: 3 },
                { date: 'Jul 15', day: 'Mon', leaves: 5 },
                { date: 'Jul 22', day: 'Mon', leaves: 1 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">{item.date.split(' ')[1]}</p>
                      <p className="text-xs text-muted-foreground">{item.day}</p>
                    </div>
                    <div>
                      <p className="font-medium">{item.leaves} employees</p>
                      <p className="text-xs text-muted-foreground">On leave</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Recent leave applications</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded shimmer" />)}
            </div>
          ) : (
            <div className="divide-y">
              {displayRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{(req.employee_name || 'U').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{req.employee_name || 'Employee'}</p>
                      <p className="text-sm text-muted-foreground">{req.leave_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{req.from_date} - {req.to_date}</p>
                    <p className="text-xs text-muted-foreground">{req.days} day(s)</p>
                  </div>
                  <Badge className={statusConfig[req.status]?.color}>{req.status}</Badge>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRejectLeave(req)}>Reject</Button>
                      <Button size="sm" onClick={() => handleApproveLeave(req)}>Approve</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
