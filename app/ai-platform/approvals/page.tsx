'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  DollarSign,
  Shield,
  User,
  Calendar,
  Eye,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type ApprovalWorkflow = {
  id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: any;
  approver_roles: string[];
  is_active: boolean;
};

type ApprovalRequest = {
  id: string;
  request_type: string;
  draft_content: string;
  context: any;
  impact_level: string;
  status: string;
  requested_by: string;
  created_at: string;
};

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [workflowsRes, requestsRes] = await Promise.all([
      supabase.from('ai_approval_workflows').select('*').order('name'),
      supabase.from('ai_approval_requests').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    if (workflowsRes.data) setWorkflows(workflowsRes.data);
    if (requestsRes.data) setRequests(requestsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge className="bg-green-500/20 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-500/20 text-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-red-500/20 text-red-500">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500/20 text-orange-500">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/20 text-yellow-600">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500/20 text-green-600">Low</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'legal_notice': return FileText;
      case 'bulk_message': return MessageSquare;
      case 'financial': return DollarSign;
      case 'policy_update': return Shield;
      default: return FileText;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const handleApprove = (request: ApprovalRequest) => {
    toast.success('Request approved successfully');
    setDetailOpen(false);
    loadData();
  };

  const handleReject = (request: ApprovalRequest) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }
    toast.success('Request rejected');
    setDetailOpen(false);
    loadData();
  };

  return (
    <AppShell>
      <PageHeader
        title="Human-in-the-Loop Approvals"
        description="Approval workflows for high-impact AI actions"
        action={
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            My Queue
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending', value: pendingRequests.length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Approved Today', value: 8, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Active Workflows', value: workflows.filter(w => w.is_active).length, icon: Shield, color: 'text-blue-500' },
          { label: 'Avg Response', value: '23m', icon: Calendar, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Approval Workflows */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Approval Workflows</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflows.map((workflow, i) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-muted/20"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{workflow.name}</h3>
                <Badge variant={workflow.is_active ? 'default' : 'outline'} className={workflow.is_active ? 'bg-success/20 text-success' : ''}>
                  {workflow.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{workflow.trigger_type}</p>
              <div className="flex flex-wrap gap-1">
                {workflow.approver_roles?.map((role: string) => (
                  <Badge key={role} variant="secondary" className="text-[9px]">{role}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Approval Requests</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No pending approvals</p>
                <p className="text-sm text-muted-foreground">All requests have been processed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request, i) => {
                  const TypeIcon = getTypeIcon(request.request_type);
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setSelectedRequest(request); setDetailOpen(true); }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{request.request_type}</h3>
                          <p className="text-xs text-muted-foreground">{request.draft_content?.slice(0, 50)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getImpactBadge(request.impact_level)}
                        {getStatusBadge(request.status)}
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Processed Requests</h2>
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Processed requests</p>
              <p className="text-sm text-muted-foreground">Previously approved or rejected requests</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">All Approval Requests</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request, i) => {
                  const TypeIcon = getTypeIcon(request.request_type);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20"
                    >
                      <div className="flex items-center gap-4">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{request.request_type}</p>
                          <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(request.impact_level)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Review Request
              {selectedRequest && getStatusBadge(selectedRequest.status)}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Request Type</p>
                  <p className="font-medium">{selectedRequest.request_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Impact Level</p>
                  {getImpactBadge(selectedRequest.impact_level)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Draft Content</p>
                <pre className="text-sm whitespace-pre-wrap">{selectedRequest.draft_content}</pre>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Context</p>
                <pre className="text-sm font-mono">{JSON.stringify(selectedRequest.context, null, 2)}</pre>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Review Notes</p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleReject(selectedRequest)} className="gap-2">
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedRequest)} className="gap-2">
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
