'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Shield,
  Key,
  FileText,
  Settings,
  AlertTriangle,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  actor_email: string | null;
  actor_name: string | null;
  action: string;
  action_category: string;
  action_type: string;
  action_result: string | null;
  target_type: string | null;
  target_name: string | null;
  description: string;
  ip_address: string | null;
  created_at: string;
  is_sensitive: boolean;
}

const categoryIcons: Record<string, typeof Activity> = {
  auth: Key,
  user: User,
  role: Shield,
  permission: Key,
  customer: User,
  invoice: FileText,
  payment: FileText,
  employee: User,
  document: FileText,
  ai: Activity,
  api: Activity,
  workflow: Activity,
  settings: Settings,
  security: Shield,
  export: Download,
  import: Download,
  system: Settings,
};

const categoryColors: Record<string, string> = {
  auth: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  user: 'bg-green-500/10 text-green-600 border-green-500/20',
  role: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  security: 'bg-red-500/10 text-red-600 border-red-500/20',
  invoice: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  payment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  default: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const actionTypeColors: Record<string, string> = {
  create: 'text-green-600',
  read: 'text-blue-600',
  update: 'text-yellow-600',
  delete: 'text-red-600',
  login: 'text-blue-600',
  logout: 'text-gray-600',
  export: 'text-purple-600',
  import: 'text-purple-600',
  execute: 'text-orange-600',
  access: 'text-blue-600',
  share: 'text-cyan-600',
  revoke: 'text-red-600',
  grant: 'text-green-600',
  change: 'text-yellow-600',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [categoryFilter, actionTypeFilter, resultFilter, page]);

  async function loadAuditLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (categoryFilter !== 'all') {
        query = query.eq('action_category', categoryFilter);
      }
      if (actionTypeFilter !== 'all') {
        query = query.eq('action_type', actionTypeFilter);
      }
      if (resultFilter !== 'all') {
        query = query.eq('action_result', resultFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    return (
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const stats = {
    total: totalCount,
    success: logs.filter(l => l.action_result === 'success').length,
    failures: logs.filter(l => l.action_result === 'failure').length,
    sensitive: logs.filter(l => l.is_sensitive).length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Audit Log"
        description="Comprehensive history of all system activities and security events"
        action={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="mt-1 text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
              <Shield className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failures</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.failures}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sensitive Actions</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{stats.sensitive}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
              <Eye className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>

        <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="export">Export</SelectItem>
            <SelectItem value="import">Import</SelectItem>
          </SelectContent>
        </Select>

        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Target</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-4 rounded shimmer w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, i) => {
                      const Icon = categoryIcons[log.action_category] || Activity;
                      const colorClass = categoryColors[log.action_category] || categoryColors.default;

                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-xs">
                                {new Date(log.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{log.actor_name || log.actor_email || 'System'}</p>
                                {log.actor_email && (
                                  <p className="text-xs text-muted-foreground">{log.actor_email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("gap-1", colorClass)}>
                                <Icon className="h-3 w-3" />
                                {log.action_category}
                              </Badge>
                              <span className={cn("text-xs font-medium capitalize", actionTypeColors[log.action_type] || 'text-gray-600')}>
                                {log.action_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-muted-foreground max-w-xs truncate">
                              {log.description}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {log.target_type && (
                              <div className="text-sm">
                                <span className="capitalize text-muted-foreground">{log.target_type}</span>
                                {log.target_name && (
                                  <span className="ml-1 font-medium">{log.target_name}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs text-muted-foreground">{log.ip_address || '—'}</code>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn(
                              log.action_result === 'success' && 'bg-green-500/10 text-green-600 border-green-500/20',
                              log.action_result === 'failure' && 'bg-red-500/10 text-red-600 border-red-500/20',
                              log.action_result === 'blocked' && 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                            )}>
                              {log.action_result || '—'}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
