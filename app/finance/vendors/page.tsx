'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Vendor {
  id: string;
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  email: string;
  phone: string;
  city: string;
  gst_number: string;
  rating: number;
  total_orders: number;
  total_value: number;
  is_active: boolean;
  is_preferred: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700',
  inactive: 'bg-gray-500/10 text-gray-700',
  preferred: 'bg-blue-500/10 text-blue-700',
};

export default function VendorsPage() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
        .from('vendors')
        .select('*')
        .order('vendor_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendor_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'preferred' && vendor.is_preferred) ||
      (filterStatus === 'active' && vendor.is_active && !vendor.is_preferred);
    return matchesSearch && matchesStatus;
  });

  const mockVendors: Vendor[] = vendors.length > 0 ? vendors : [
    { id: '1', vendor_code: 'V001', vendor_name: 'Tech Solutions Ltd', vendor_type: 'supplier', email: 'contact@techsol.com', phone: '+91-9876543210', city: 'Mumbai', gst_number: '27AABC1234A1Z5', rating: 4.5, total_orders: 45, total_value: 2500000, is_active: true, is_preferred: true },
    { id: '2', vendor_code: 'V002', vendor_name: 'Office Supplies Co', vendor_type: 'supplier', email: 'sales@officesup.com', phone: '+91-9876543211', city: 'Delhi', gst_number: '07AABC5678B2Z6', rating: 4.2, total_orders: 120, total_value: 850000, is_active: true, is_preferred: false },
    { id: '3', vendor_code: 'V003', vendor_name: 'Cloud Services Inc', vendor_type: 'service', email: 'info@cloudsvc.com', phone: '+91-9876543212', city: 'Bangalore', gst_number: '29AABC9012C3Z7', rating: 4.8, total_orders: 28, total_value: 4500000, is_active: true, is_preferred: true },
    { id: '4', vendor_code: 'V004', vendor_name: 'Hardware Distributors', vendor_type: 'supplier', email: 'orders@harddist.com', phone: '+91-9876543213', city: 'Chennai', gst_number: '33AABC3456D4Z8', rating: 3.9, total_orders: 67, total_value: 1200000, is_active: true, is_preferred: false },
    { id: '5', vendor_code: 'V005', vendor_name: 'Marketing Agency Pro', vendor_type: 'service', email: 'hello@markagency.com', phone: '+91-9876543214', city: 'Pune', gst_number: '27AABC7890E5Z9', rating: 4.6, total_orders: 15, total_value: 980000, is_active: true, is_preferred: false },
  ];

  const stats = {
    total: mockVendors.length,
    preferred: mockVendors.filter(v => v.is_preferred).length,
    active: mockVendors.filter(v => v.is_active).length,
    totalOrders: mockVendors.reduce((sum, v) => sum + v.total_orders, 0),
    totalValue: mockVendors.reduce((sum, v) => sum + v.total_value, 0),
    avgRating: mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length,
  };

  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {Array(5).fill(0).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < fullStars ? 'fill-yellow-400 text-yellow-400' :
              i === fullStars && hasHalfStar ? 'fill-yellow-400/50 text-yellow-400' :
              'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Vendor Management"
        description="Manage vendor profiles, contracts, performance, and payments"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Register a new vendor in your system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vendor Name</Label>
                    <Input className="mt-1.5" placeholder="Enter vendor name" />
                  </div>
                  <div>
                    <Label>Vendor Code</Label>
                    <Input className="mt-1.5" placeholder="Auto-generated" disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input className="mt-1.5" type="email" placeholder="vendor@email.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1.5" placeholder="+91-9876543210" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vendor Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="service">Service Provider</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <Input className="mt-1.5" placeholder="27AABC1234A1Z5" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea className="mt-1.5" placeholder="Full address..." rows={2} />
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
                    <Label>Payment Terms (Days)</Label>
                    <Input className="mt-1.5" type="number" placeholder="30" />
                  </div>
                  <div>
                    <Label>Credit Limit</Label>
                    <Input className="mt-1.5" type="number" placeholder="100000" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Add Vendor</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Vendors', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Preferred', value: stats.preferred, icon: Star, color: 'text-yellow-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Total Orders', value: stats.totalOrders, icon: FileText, color: 'text-purple-600' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(0)}L`, icon: DollarSign, color: 'text-orange-600' },
          { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-cyan-600' },
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
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="preferred">Preferred</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Vendor Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-xl shimmer" />
          ))
        ) : mockVendors.map((vendor, idx) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {vendor.vendor_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{vendor.vendor_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{vendor.vendor_code}</Badge>
                        {vendor.is_preferred && (
                          <Badge className="bg-yellow-500/10 text-yellow-700 text-xs">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                            Preferred
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
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
                        <FileText className="h-4 w-4 mr-2" /> Contracts
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="h-4 w-4 mr-2" /> Performance
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.city}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  {renderRating(vendor.rating)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-semibold">{vendor.total_orders}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="font-semibold">₹{(vendor.total_value / 100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">GST: {vendor.gst_number.slice(0, 8)}...</span>
                  <Badge className={vendor.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
