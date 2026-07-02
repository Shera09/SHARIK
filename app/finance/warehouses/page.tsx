'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Thermometer,
  Grid3X3,
  Layers,
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Warehouse {
  id: string;
  warehouse_code: string;
  warehouse_name: string;
  city: string;
  state: string;
  total_capacity: number;
  used_capacity: number;
  is_active: boolean;
  is_default: boolean;
}

interface StockTransfer {
  id: string;
  transfer_number: string;
  transfer_date: string;
  source_warehouse_id: string;
  destination_warehouse_id: string;
  status: string;
}

export default function WarehousesPage() {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [whRes, transferRes] = await Promise.all([
        supabase.from('warehouses').select('*').order('warehouse_name'),
        supabase.from('stock_transfers').select('*').order('transfer_date', { ascending: false }).limit(10),
      ]);

      if (whRes.data) setWarehouses(whRes.data);
      if (transferRes.data) setTransfers(transferRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockWarehouses: Warehouse[] = warehouses.length > 0 ? warehouses : [
    { id: '1', warehouse_code: 'WH-MUM', warehouse_name: 'Mumbai Main Warehouse', city: 'Mumbai', state: 'Maharashtra', total_capacity: 50000, used_capacity: 35000, is_active: true, is_default: true },
    { id: '2', warehouse_code: 'WH-DEL', warehouse_name: 'Delhi Distribution Center', city: 'Delhi', state: 'Delhi', total_capacity: 35000, used_capacity: 28000, is_active: true, is_default: false },
    { id: '3', warehouse_code: 'WH-BLR', warehouse_name: 'Bangalore Tech Hub', city: 'Bangalore', state: 'Karnataka', total_capacity: 25000, used_capacity: 12000, is_active: true, is_default: false },
    { id: '4', warehouse_code: 'WH-CHN', warehouse_name: 'Chennai Storage', city: 'Chennai', state: 'Tamil Nadu', total_capacity: 20000, used_capacity: 18000, is_active: true, is_default: false },
  ];

  const mockTransfers: (StockTransfer & { source_name: string; dest_name: string })[] = transfers.length > 0 ? transfers.map(t => ({
    ...t,
    source_name: 'Mumbai Main',
    dest_name: 'Delhi DC',
  })) : [
    { id: '1', transfer_number: 'TR-2024-001', transfer_date: '2024-07-01', source_warehouse_id: '1', destination_warehouse_id: '2', status: 'completed', source_name: 'Mumbai Main', dest_name: 'Delhi DC' },
    { id: '2', transfer_number: 'TR-2024-002', transfer_date: '2024-07-02', source_warehouse_id: '2', destination_warehouse_id: '3', status: 'in_transit', source_name: 'Delhi DC', dest_name: 'Bangalore' },
    { id: '3', transfer_number: 'TR-2024-003', transfer_date: '2024-07-03', source_warehouse_id: '1', destination_warehouse_id: '4', status: 'draft', source_name: 'Mumbai Main', dest_name: 'Chennai' },
  ];

  const stats = {
    totalWarehouses: mockWarehouses.length,
    activeWarehouses: mockWarehouses.filter(w => w.is_active).length,
    totalCapacity: mockWarehouses.reduce((sum, w) => sum + (w.total_capacity || 0), 0),
    usedCapacity: mockWarehouses.reduce((sum, w) => sum + (w.used_capacity || 0), 0),
    pendingTransfers: mockTransfers.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
    completedTransfers: mockTransfers.filter(t => t.status === 'completed').length,
  };

  const transferStatusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock },
    in_transit: { color: 'bg-blue-500/10 text-blue-700', icon: Truck },
    completed: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-500/10 text-red-700', icon: AlertTriangle },
  };

  return (
    <AppShell>
      <PageHeader
        title="Warehouse Management"
        description="Manage warehouses, zones, locations, and stock transfers"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Warehouse</DialogTitle>
                <DialogDescription>
                  Add a new warehouse to your network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Warehouse Code</Label>
                    <Input className="mt-1.5" placeholder="e.g., WH-NEW" />
                  </div>
                  <div>
                    <Label>Warehouse Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., Mumbai Main" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input className="mt-1.5" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input className="mt-1.5" placeholder="City" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-1.5" placeholder="State" />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input className="mt-1.5" placeholder="400001" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Capacity</Label>
                    <Input className="mt-1.5" type="number" placeholder="sq ft or units" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input className="mt-1.5" placeholder="Name & Phone" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Warehouse</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Warehouses', value: stats.totalWarehouses, icon: Building2, color: 'text-blue-600' },
          { label: 'Active', value: stats.activeWarehouses, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Total Capacity', value: `${(stats.totalCapacity / 1000).toFixed(0)}k`, icon: Layers, color: 'text-purple-600' },
          { label: 'Utilization', value: `${Math.round((stats.usedCapacity / stats.totalCapacity) * 100)}%`, icon: Grid3X3, color: 'text-orange-600' },
          { label: 'Pending Transfers', value: stats.pendingTransfers, icon: Truck, color: 'text-cyan-600' },
          { label: 'Completed', value: stats.completedTransfers, icon: CheckCircle2, color: 'text-green-600' },
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

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Warehouses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>Your warehouse network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockWarehouses.map((wh, idx) => {
                  const utilization = Math.round(((wh.used_capacity || 0) / (wh.total_capacity || 1)) * 100);
                  return (
                    <motion.div
                      key={wh.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{wh.warehouse_name}</p>
                                <p className="text-sm text-muted-foreground">{wh.warehouse_code}</p>
                              </div>
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
                                <DropdownMenuItem><Grid3X3 className="h-4 w-4 mr-2" /> Zones</DropdownMenuItem>
                                <DropdownMenuItem><Layers className="h-4 w-4 mr-2" /> Locations</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {wh.city}, {wh.state}
                            </div>
                            {wh.is_default && (
                              <Badge className="bg-blue-500/10 text-blue-700 text-xs">Default</Badge>
                            )}
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Capacity</span>
                              <span>{utilization}%</span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Used: {(wh.used_capacity || 0).toLocaleString()}</span>
                              <span>Total: {(wh.total_capacity || 0).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <Badge className={wh.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                              {wh.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transfers */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Stock Transfers
              </CardTitle>
              <CardDescription>Recent transfer activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTransfers.map((transfer) => {
                const status = transferStatusConfig[transfer.status] || transferStatusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <div key={transfer.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', status.color)}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{transfer.transfer_number}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {transfer.source_name} → {transfer.dest_name}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      {transfer.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
              <Button variant="outline" className="w-full mt-2">
                View All Transfers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
