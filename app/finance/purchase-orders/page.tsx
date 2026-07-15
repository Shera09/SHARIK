'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Package,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Printer,
  Building2,
  ArrowRight,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PurchaseOrder {
  id: string;
  po_number: string;
  po_date: string;
  vendor_id: string;
  vendor_name?: string;
  total_amount: number;
  status: string;
  expected_delivery_date: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  draft: { color: 'bg-gray-500/10 text-gray-700', icon: Clock, label: 'Draft' },
  pending: { color: 'bg-yellow-500/10 text-yellow-700', icon: Clock, label: 'Pending Approval' },
  approved: { color: 'bg-blue-500/10 text-blue-700', icon: CheckCircle2, label: 'Approved' },
  ordered: { color: 'bg-cyan-500/10 text-cyan-700', icon: Send, label: 'Ordered' },
  partial: { color: 'bg-orange-500/10 text-orange-700', icon: AlertTriangle, label: 'Partial' },
  received: { color: 'bg-green-500/10 text-green-700', icon: CheckCircle2, label: 'Received' },
  cancelled: { color: 'bg-red-500/10 text-red-700', icon: XCircle, label: 'Cancelled' },
};

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, vendors(vendor_name)')
        .order('po_date', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data?.map(po => ({
        ...po,
        vendor_name: po.vendors?.vendor_name || 'Unknown',
      })) || []);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mockPOs: PurchaseOrder[] = purchaseOrders.length > 0 ? purchaseOrders : [
    { id: '1', po_number: 'PO-2024-001', po_date: '2024-07-01', vendor_id: 'v1', vendor_name: 'Tech Solutions Ltd', total_amount: 350000, status: 'received', expected_delivery_date: '2024-07-15' },
    { id: '2', po_number: 'PO-2024-002', po_date: '2024-07-02', vendor_id: 'v2', vendor_name: 'Office Supplies Co', total_amount: 85000, status: 'ordered', expected_delivery_date: '2024-07-10' },
    { id: '3', po_number: 'PO-2024-003', po_date: '2024-07-03', vendor_id: 'v3', vendor_name: 'Hardware Distributors', total_amount: 420000, status: 'approved', expected_delivery_date: '2024-07-20' },
    { id: '4', po_number: 'PO-2024-004', po_date: '2024-07-04', vendor_id: 'v1', vendor_name: 'Tech Solutions Ltd', total_amount: 180000, status: 'pending', expected_delivery_date: '2024-07-25' },
    { id: '5', po_number: 'PO-2024-005', po_date: '2024-07-05', vendor_id: 'v4', vendor_name: 'Cloud Services Inc', total_amount: 650000, status: 'draft', expected_delivery_date: '2024-08-01' },
    { id: '6', po_number: 'PO-2024-006', po_date: '2024-06-28', vendor_id: 'v2', vendor_name: 'Office Supplies Co', total_amount: 45000, status: 'partial', expected_delivery_date: '2024-07-08' },
  ];

  const stats = {
    total: mockPOs.length,
    draft: mockPOs.filter(p => p.status === 'draft').length,
    pending: mockPOs.filter(p => p.status === 'pending').length,
    ordered: mockPOs.filter(p => ['ordered', 'partial'].includes(p.status)).length,
    received: mockPOs.filter(p => p.status === 'received').length,
    totalValue: mockPOs.reduce((sum, p) => sum + Number(p.total_amount), 0),
  };

  return (
    <AppShell>
      <PageHeader
        title="Purchase Orders"
        description="Create and manage procurement orders with vendor integration"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Generate a new purchase order for procurement
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Vendor</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">Tech Solutions Ltd</SelectItem>
                        <SelectItem value="v2">Office Supplies Co</SelectItem>
                        <SelectItem value="v3">Hardware Distributors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>PO Date</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Delivery Address</Label>
                    <Input className="mt-1.5" placeholder="Enter delivery address" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input className="mt-1.5" placeholder="Contact name and phone" />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Qty</TableHead>
                        <TableHead className="w-[100px]">Unit</TableHead>
                        <TableHead className="w-[120px]">Price</TableHead>
                        <TableHead className="w-[80px]">Tax%</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="PROD-001" /></TableCell>
                        <TableCell><Input placeholder="Product description" /></TableCell>
                        <TableCell><Input type="number" placeholder="1" /></TableCell>
                        <TableCell>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="PCS" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs">PCS</SelectItem>
                              <SelectItem value="box">BOX</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input type="number" placeholder="0.00" /></TableCell>
                        <TableCell><Input type="number" placeholder="18" /></TableCell>
                        <TableCell className="font-medium">₹0</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Line Item
                </Button>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹0.00</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Terms & Conditions</Label>
                  <Input className="mt-1.5" placeholder="Payment terms, delivery conditions..." />
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {[
          { label: 'Total POs', value: stats.total, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Draft', value: stats.draft, icon: Clock, color: 'text-gray-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Ordered', value: stats.ordered, icon: Send, color: 'text-cyan-600' },
          { label: 'Received', value: stats.received, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-purple-600' },
          { label: 'Avg Value', value: `₹${((stats.totalValue / stats.total) / 1000).toFixed(0)}k`, icon: Package, color: 'text-orange-600' },
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
            placeholder="Search POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
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

        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      {/* PO Table */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-24 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-32 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 shimmer rounded ml-auto" /></TableCell>
                        <TableCell><div className="h-4 w-16 shimmer rounded" /></TableCell>
                        <TableCell><div className="h-4 w-8 shimmer rounded" /></TableCell>
                      </TableRow>
                    ))
                  ) : mockPOs.map((po, idx) => {
                    const status = statusConfig[po.status] || statusConfig.draft;
                    const StatusIcon = status.icon;

                    return (
                      <motion.tr
                        key={po.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell>{new Date(po.po_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {po.vendor_name}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(po.expected_delivery_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          ₹{Number(po.total_amount).toLocaleString()}
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
                                <Printer className="h-4 w-4 mr-2" /> Print PO
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {po.status === 'draft' && (
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" /> Submit for Approval
                                </DropdownMenuItem>
                              )}
                              {po.status === 'approved' && (
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" /> Mark as Ordered
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Cancel PO
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
