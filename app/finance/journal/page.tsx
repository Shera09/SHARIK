'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock, label: 'Draft' },
  pending: { color: 'bg-yellow-500/10 text-yellow-700', icon: Clock, label: 'Pending' },
  approved: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2, label: 'Approved' },
  rejected: { color: 'bg-red-500/10 text-red-700', icon: XCircle, label: 'Rejected' },
  posted: { color: 'bg-blue-500/10 text-blue-700', icon: CheckCircle2, label: 'Posted' },
};

export default function JournalPage() {
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [entryLines, setEntryLines] = useState([
    { account: '', debit: '', credit: '' },
    { account: '', debit: '', credit: '' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mockEntries: JournalEntry[] = journalEntries.length > 0 ? journalEntries : [
    { id: '1', entry_number: 'JE-2024-001', entry_date: '2024-07-01', description: 'Rent payment for July', total_debit: 50000, total_credit: 50000, status: 'posted', created_at: '2024-07-01' },
    { id: '2', entry_number: 'JE-2024-002', entry_date: '2024-07-02', description: 'Sales revenue entry', total_debit: 120000, total_credit: 120000, status: 'approved', created_at: '2024-07-02' },
    { id: '3', entry_number: 'JE-2024-003', entry_date: '2024-07-03', description: 'Salary disbursement', total_debit: 350000, total_credit: 350000, status: 'pending', created_at: '2024-07-03' },
    { id: '4', entry_number: 'JE-2024-004', entry_date: '2024-07-04', description: 'Equipment purchase', total_debit: 85000, total_credit: 85000, status: 'draft', created_at: '2024-07-04' },
    { id: '5', entry_number: 'JE-2024-005', entry_date: '2024-07-05', description: 'Client advance payment', total_debit: 100000, total_credit: 100000, status: 'posted', created_at: '2024-07-05' },
  ];

  const stats = {
    total: mockEntries.length,
    draft: mockEntries.filter(e => e.status === 'draft').length,
    pending: mockEntries.filter(e => e.status === 'pending').length,
    posted: mockEntries.filter(e => e.status === 'posted').length,
    totalDebit: mockEntries.reduce((sum, e) => sum + Number(e.total_debit || 0), 0),
    totalCredit: mockEntries.reduce((sum, e) => sum + Number(e.total_credit || 0), 0),
  };

  return (
    <AppShell>
      <PageHeader
        title="Journal Entries"
        description="Create, manage, and post journal entries to the general ledger"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
                <DialogDescription>
                  Record a double-entry journal transaction
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Entry Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div className="col-span-2">
                    <Label>Reference</Label>
                    <Input className="mt-1.5" placeholder="Optional reference number" />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" placeholder="Enter journal entry description..." rows={2} />
                </div>

                {/* Entry Lines */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Account</TableHead>
                        <TableHead className="w-[150px]">Debit (₹)</TableHead>
                        <TableHead className="w-[150px]">Credit (₹)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entryLines.map((line, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">1200 - Cash</SelectItem>
                                <SelectItem value="bank">1100 - Bank Account</SelectItem>
                                <SelectItem value="rent">5100 - Rent Expense</SelectItem>
                                <SelectItem value="salary">5200 - Salary Expense</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={line.debit}
                              onChange={(e) => {
                                const newLines = [...entryLines];
                                newLines[idx].debit = e.target.value;
                                newLines[idx].credit = '';
                                setEntryLines(newLines);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={line.credit}
                              onChange={(e) => {
                                const newLines = [...entryLines];
                                newLines[idx].credit = e.target.value;
                                newLines[idx].debit = '';
                                setEntryLines(newLines);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                if (entryLines.length > 2) {
                                  setEntryLines(entryLines.filter((_, i) => i !== idx));
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEntryLines([...entryLines, { account: '', debit: '', credit: '' }])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Line
                </Button>

                {/* Totals */}
                <div className="flex justify-end gap-8 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Debit</p>
                    <p className="text-lg font-semibold">₹{entryLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Credit</p>
                    <p className="text-lg font-semibold">₹{entryLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={entryLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0) === entryLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0) ? 'default' : 'destructive'}>
                      {entryLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0) === entryLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0) ? 'Balanced' : 'Unbalanced'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea className="mt-1.5" placeholder="Additional notes..." rows={2} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button variant="secondary">Save as Draft</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Submit for Approval</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Entries', value: stats.total, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Draft', value: stats.draft, icon: Clock, color: 'text-gray-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Posted', value: stats.posted, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Total Debit', value: `₹${(stats.totalDebit / 1000).toFixed(0)}k`, icon: ArrowRight, color: 'text-orange-600' },
          { label: 'Total Credit', value: `₹${(stats.totalCredit / 1000).toFixed(0)}k`, icon: ArrowRight, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-24 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-16 shimmer rounded ml-auto" /></TableCell>
                        <TableCell><div className="h-4 w-16 shimmer rounded ml-auto" /></TableCell>
                        <TableCell><div className="h-4 w-16 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-8 shimmer rounded" /></TableCell>
                      </TableRow>
                    ))
                  ) : mockEntries.map((entry, idx) => {
                    const status = statusConfig[entry.status] || statusConfig.draft;
                    const StatusIcon = status.icon;

                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{entry.entry_number}</TableCell>
                        <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          ₹{Number(entry.total_debit).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          ₹{Number(entry.total_credit).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" /> View Ledger
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
