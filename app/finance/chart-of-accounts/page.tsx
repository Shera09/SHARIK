'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  current_balance: number;
  is_active: boolean;
  parent_account_id: string | null;
  children?: Account[];
}

interface AccountGroup {
  id: string;
  code: string;
  name: string;
  account_type: string;
  children: Account[];
}

const accountTypeConfig: Record<string, { color: string; icon: typeof DollarSign; label: string }> = {
  asset: { color: 'text-blue-600 bg-blue-500/10', icon: TrendingUp, label: 'Assets' },
  liability: { color: 'text-red-600 bg-red-500/10', icon: TrendingDown, label: 'Liabilities' },
  equity: { color: 'text-purple-600 bg-purple-500/10', icon: PiggyBank, label: 'Equity' },
  income: { color: 'text-green-600 bg-green-500/10', icon: DollarSign, label: 'Income' },
  expense: { color: 'text-orange-600 bg-orange-500/10', icon: Receipt, label: 'Expenses' },
  bank: { color: 'text-cyan-600 bg-cyan-500/10', icon: Building2, label: 'Bank' },
  cash: { color: 'text-yellow-600 bg-yellow-500/10', icon: Wallet, label: 'Cash' },
  tax: { color: 'text-pink-600 bg-pink-500/10', icon: CreditCard, label: 'Tax' },
};

const typeOrder = ['asset', 'liability', 'equity', 'income', 'expense', 'bank', 'cash', 'tax'];

export default function ChartOfAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accountsRes, groupsRes] = await Promise.all([
        supabase.from('accounts').select('*').order('code'),
        supabase.from('account_groups').select('*').order('display_order'),
      ]);

      if (accountsRes.data) setAccounts(accountsRes.data);
      if (groupsRes.data) {
        const groupedData = groupsRes.data.map(group => ({
          ...group,
          children: accountsRes.data?.filter(a => a.account_type === group.account_type) || [],
        }));
        setGroups(groupedData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.account_type === filterType;
    return matchesSearch && matchesType;
  });

  // Group accounts by type for hierarchical display
  const accountsByType = typeOrder.reduce((acc, type) => {
    acc[type] = filteredAccounts.filter(a => a.account_type === type);
    return acc;
  }, {} as Record<string, Account[]>);

  const totalByType = typeOrder.reduce((acc, type) => {
    acc[type] = accounts.filter(a => a.account_type === type)
      .reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  // Mock data for display
  const mockAccounts = accounts.length > 0 ? accounts : [
    { id: '1', code: '1000', name: 'Cash', account_type: 'asset', current_balance: 50000, is_active: true, parent_account_id: null },
    { id: '2', code: '1100', name: 'Bank Accounts', account_type: 'asset', current_balance: 850000, is_active: true, parent_account_id: null },
    { id: '3', code: '1200', name: 'Accounts Receivable', account_type: 'asset', current_balance: 450000, is_active: true, parent_account_id: null },
    { id: '4', code: '1300', name: 'Inventory', account_type: 'asset', current_balance: 320000, is_active: true, parent_account_id: null },
    { id: '5', code: '2000', name: 'Accounts Payable', account_type: 'liability', current_balance: 280000, is_active: true, parent_account_id: null },
    { id: '6', code: '2100', name: 'GST Payable', account_type: 'liability', current_balance: 145000, is_active: true, parent_account_id: null },
    { id: '7', code: '3000', name: 'Owners Equity', account_type: 'equity', current_balance: 1500000, is_active: true, parent_account_id: null },
    { id: '8', code: '3100', name: 'Retained Earnings', account_type: 'equity', current_balance: 850000, is_active: true, parent_account_id: null },
    { id: '9', code: '4000', name: 'Sales Revenue', account_type: 'income', current_balance: 2500000, is_active: true, parent_account_id: null },
    { id: '10', code: '4100', name: 'Service Revenue', account_type: 'income', current_balance: 1200000, is_active: true, parent_account_id: null },
    { id: '11', code: '5000', name: 'Cost of Goods Sold', account_type: 'expense', current_balance: 980000, is_active: true, parent_account_id: null },
    { id: '12', code: '5100', name: 'Operating Expenses', account_type: 'expense', current_balance: 450000, is_active: true, parent_account_id: null },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your complete accounting structure with hierarchical accounts"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
                <DialogDescription>
                  Add a new account to the chart of accounts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Code</Label>
                    <Input className="mt-1.5" placeholder="e.g., 1200" />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="tax">Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input className="mt-1.5" placeholder="Enter account name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input className="mt-1.5" placeholder="Optional description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Opening Balance</Label>
                    <Input className="mt-1.5" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Parent Account</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Account</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Type Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {typeOrder.map((type, i) => {
          const config = accountTypeConfig[type];
          const Icon = config.icon;
          const count = mockAccounts.filter(a => a.account_type === type).length;
          const total = totalByType[type] || 0;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={cn(
                  'cursor-pointer hover:shadow-md transition-shadow',
                  filterType === type && 'ring-2 ring-primary'
                )}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
              >
                <CardContent className="p-3">
                  <div className={cn('rounded-lg p-2 w-fit', config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{config.label}</p>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{(total / 1000).toFixed(0)}k
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOrder.map(type => (
              <SelectItem key={type} value={type}>
                {accountTypeConfig[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Account Tree */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-lg shimmer" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {typeOrder.map(type => {
                    const config = accountTypeConfig[type];
                    const Icon = config.icon;
                    const typeAccounts = mockAccounts.filter(a => a.account_type === type);
                    if (typeAccounts.length === 0) return null;

                    const isExpanded = expandedGroups.has(type);
                    const typeTotal = typeAccounts.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0);

                    return (
                      <div key={type}>
                        {/* Type Header */}
                        <div
                          className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleGroup(type)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className={cn('rounded-lg p-1.5', config.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{config.label}</span>
                            <Badge variant="secondary">{typeAccounts.length}</Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              'font-semibold',
                              ['income', 'liability', 'equity'].includes(type) ? 'text-green-600' : 'text-red-600'
                            )}>
                              {['income', 'liability', 'equity'].includes(type) ? '+' : '-'}
                              ₹{typeTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Accounts under this type */}
                        {isExpanded && (
                          <div className="bg-muted/30">
                            {typeAccounts.map((account, idx) => (
                              <motion.div
                                key={account.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="flex items-center justify-between pl-16 pr-4 py-2.5 border-l-2 ml-6 hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <code className="text-sm text-muted-foreground font-mono">
                                    {account.code}
                                  </code>
                                  <span>{account.name}</span>
                                  {account.is_active ? (
                                    <Badge variant="outline" className="text-xs">Active</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-medium tabular-nums">
                                    ₹{Number(account.current_balance || 0).toLocaleString()}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Plus className="h-4 w-4 mr-2" /> Add Sub Account
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
