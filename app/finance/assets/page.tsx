'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Plus,
  Search,
  Filter,
  Laptop,
  Car,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Grid,
  List,
  MapPin,
  User,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

interface Asset {
  id: string;
  asset_code: string;
  asset_name: string;
  category_id: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  accumulated_depreciation: number;
  status: string;
  location: string;
  assigned_to_id: string | null;
  next_maintenance_date: string;
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  active: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2, label: 'Active' },
  maintenance: { color: 'bg-yellow-500/10 text-yellow-700', icon: Wrench, label: 'Under Maintenance' },
  retired: { color: 'bg-gray-500/10 text-gray-700', icon: Clock, label: 'Retired' },
  disposed: { color: 'bg-red-500/10 text-red-700', icon: Trash2, label: 'Disposed' },
};

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('asset_name');

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockAssets: (Asset & { category_name: string; assigned_name: string })[] = assets.length > 0 ? assets.map(a => ({
    ...a,
    category_name: 'Computers',
    assigned_name: 'John Doe',
  })) : [
    { id: '1', asset_code: 'AST-001', asset_name: 'Dell XPS 15 Laptop', category_id: 'c1', category_name: 'Computers', purchase_date: '2023-06-15', purchase_cost: 150000, current_value: 120000, accumulated_depreciation: 30000, status: 'active', location: 'Mumbai Office', assigned_to_id: 'u1', assigned_name: 'John Doe', next_maintenance_date: '2024-12-01' },
    { id: '2', asset_code: 'AST-002', asset_name: 'Herman Miller Chair', category_id: 'c2', category_name: 'Furniture', purchase_date: '2022-01-10', purchase_cost: 45000, current_value: 36000, accumulated_depreciation: 9000, status: 'active', location: 'Mumbai Office', assigned_to_id: 'u1', assigned_name: 'John Doe', next_maintenance_date: '2025-01-10' },
    { id: '3', asset_code: 'AST-003', asset_name: 'HP Printer Pro', category_id: 'c3', category_name: 'Office Equipment', purchase_date: '2021-03-20', purchase_cost: 35000, current_value: 15000, accumulated_depreciation: 20000, status: 'maintenance', location: 'Delhi Office', assigned_to_id: null, assigned_name: 'Unassigned', next_maintenance_date: '2024-07-15' },
    { id: '4', asset_code: 'AST-004', asset_name: 'Honda City Vehicle', category_id: 'c4', category_name: 'Vehicles', purchase_date: '2020-08-05', purchase_cost: 1200000, current_value: 600000, accumulated_depreciation: 600000, status: 'active', location: 'Bangalore', assigned_to_id: 'u2', assigned_name: 'Jane Smith', next_maintenance_date: '2024-08-05' },
    { id: '5', asset_code: 'AST-005', asset_name: 'Cisco Router', category_id: 'c5', category_name: 'Networking', purchase_date: '2023-02-28', purchase_cost: 85000, current_value: 68000, accumulated_depreciation: 17000, status: 'active', location: 'Server Room', assigned_to_id: null, assigned_name: 'IT Dept', next_maintenance_date: '2024-05-28' },
    { id: '6', asset_code: 'AST-006', asset_name: 'MacBook Pro 16', category_id: 'c1', category_name: 'Computers', purchase_date: '2024-01-10', purchase_cost: 250000, current_value: 230000, accumulated_depreciation: 20000, status: 'active', location: 'Mumbai Office', assigned_to_id: 'u3', assigned_name: 'Mike Johnson', next_maintenance_date: '2025-01-10' },
  ];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockAssets.length,
    active: mockAssets.filter(a => a.status === 'active').length,
    maintenance: mockAssets.filter(a => a.status === 'maintenance').length,
    totalValue: mockAssets.reduce((sum, a) => sum + Number(a.current_value), 0),
    totalCost: mockAssets.reduce((sum, a) => sum + Number(a.purchase_cost), 0),
    depreciation: mockAssets.reduce((sum, a) => sum + Number(a.accumulated_depreciation), 0),
    maintenanceDue: mockAssets.filter(a => new Date(a.next_maintenance_date) < new Date()).length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Asset Management"
        description="Track, manage, and depreciate your company assets"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Register a new fixed asset
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Asset Code</Label>
                    <Input className="mt-1.5" placeholder="Auto-generated" disabled />
                  </div>
                  <div>
                    <Label>Asset Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., Dell Laptop" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computers">Computers</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="vehicles">Vehicles</SelectItem>
                        <SelectItem value="equipment">Office Equipment</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Purchase Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Purchase Cost</Label>
                    <Input className="mt-1.5" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Salvage Value</Label>
                    <Input className="mt-1.5" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Serial Number</Label>
                    <Input className="mt-1.5" placeholder="Optional" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input className="mt-1.5" placeholder="e.g., Mumbai Office" />
                  </div>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Add Asset</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7">
        {[
          { label: 'Total Assets', value: stats.total, icon: Monitor, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Under Maintenance', value: stats.maintenance, icon: Wrench, color: 'text-yellow-600' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-purple-600' },
          { label: 'Total Cost', value: `₹${(stats.totalCost / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-orange-600' },
          { label: 'Depreciation', value: `₹${(stats.depreciation / 100000).toFixed(1)}L`, icon: TrendingDown, color: 'text-red-600' },
          { label: 'Maintenance Due', value: stats.maintenanceDue, icon: AlertTriangle, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
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
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1 border rounded-lg p-1">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assets View */}
      {viewMode === 'grid' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-56 rounded-xl shimmer" />)
          ) : filteredAssets.map((asset, idx) => {
            const status = statusConfig[asset.status] || statusConfig.active;
            const StatusIcon = status.icon;
            const depreciationPercent = Math.round((Number(asset.accumulated_depreciation) / Number(asset.purchase_cost)) * 100);

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-blue-600" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Wrench className="h-4 w-4 mr-2" /> Schedule Maintenance</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Mark as Disposed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                      <p className="font-medium">{asset.asset_name}</p>
                      <p className="text-xs text-muted-foreground">{asset.category_name}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Purchase Cost</p>
                        <p className="font-semibold">₹{Number(asset.purchase_cost).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="font-semibold text-green-600">₹{Number(asset.current_value).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Depreciation</span>
                        <span>{depreciationPercent}%</span>
                      </div>
                      <Progress value={depreciationPercent} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {asset.location}
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Code</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => {
                      const status = statusConfig[asset.status] || statusConfig.active;
                      return (
                        <TableRow key={asset.id} className="group">
                          <TableCell className="font-mono text-sm">{asset.asset_code}</TableCell>
                          <TableCell className="font-medium">{asset.asset_name}</TableCell>
                          <TableCell>{asset.category_name}</TableCell>
                          <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right tabular-nums">₹{Number(asset.purchase_cost).toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-green-600">₹{Number(asset.current_value).toLocaleString()}</TableCell>
                          <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
