'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Filter,
  Barcode,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  Layers,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Grid,
  List,
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

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_id: string;
  sale_price: number;
  cost_price: number;
  current_stock?: number;
  reorder_level: number;
  is_active: boolean;
  product_type: string;
}

interface StockAlert {
  id: string;
  product_id: string;
  alert_type: string;
  current_quantity: number;
  threshold_quantity: number;
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, alertsRes] = await Promise.all([
        supabase.from('products').select('*').order('product_name'),
        supabase.from('stock_alerts').select('*').eq('is_active', true).limit(10),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockProducts: (Product & { current_stock: number; category_name: string })[] = products.length > 0 ? products.map(p => ({
    ...p,
    current_stock: Math.floor(Math.random() * 500),
    category_name: 'Electronics',
  })) : [
    { id: '1', product_code: 'PROD-001', product_name: 'Dell Latitude 5540', category_id: 'c1', category_name: 'Laptops', sale_price: 85000, cost_price: 68000, current_stock: 45, reorder_level: 10, is_active: true, product_type: 'product' },
    { id: '2', product_code: 'PROD-002', product_name: 'HP Monitor 24"', category_id: 'c2', category_name: 'Monitors', sale_price: 18000, cost_price: 14000, current_stock: 120, reorder_level: 20, is_active: true, product_type: 'product' },
    { id: '3', product_code: 'PROD-003', product_name: 'Logitech Keyboard', category_id: 'c3', category_name: 'Accessories', sale_price: 2500, cost_price: 1800, current_stock: 8, reorder_level: 25, is_active: true, product_type: 'product' },
    { id: '4', product_code: 'PROD-004', product_name: 'Mouse Wireless', category_id: 'c3', category_name: 'Accessories', sale_price: 1200, cost_price: 800, current_stock: 250, reorder_level: 50, is_active: true, product_type: 'product' },
    { id: '5', product_code: 'SERV-001', product_name: 'IT Support Package', category_id: 'c4', category_name: 'Services', sale_price: 15000, cost_price: 0, current_stock: 999, reorder_level: 0, is_active: true, product_type: 'service' },
    { id: '6', product_code: 'PROD-005', product_name: 'USB-C Hub', category_id: 'c3', category_name: 'Accessories', sale_price: 3500, cost_price: 2500, current_stock: 5, reorder_level: 15, is_active: true, product_type: 'product' },
  ];

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category_name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(mockProducts.map(p => p.category_name))];

  const stats = {
    total: mockProducts.length,
    products: mockProducts.filter(p => p.product_type === 'product').length,
    services: mockProducts.filter(p => p.product_type === 'service').length,
    lowStock: mockProducts.filter(p => p.current_stock <= p.reorder_level).length,
    totalValue: mockProducts.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0),
    totalStock: mockProducts.reduce((sum, p) => sum + p.current_stock, 0),
  };

  const getStockStatus = (product: typeof mockProducts[0]) => {
    if (product.product_type === 'service') return { label: 'N/A', color: 'bg-gray-500/10 text-gray-700' };
    if (product.current_stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-700' };
    if (product.current_stock <= product.reorder_level) return { label: 'Low Stock', color: 'bg-orange-500/10 text-orange-700' };
    return { label: 'In Stock', color: 'bg-green-500/10 text-green-700' };
  };

  return (
    <AppShell>
      <PageHeader
        title="Inventory Management"
        description="Manage products, track stock levels, and handle inventory operations"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product or service in your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Code</Label>
                    <Input className="mt-1.5" placeholder="Auto-generated" disabled />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input className="mt-1.5" placeholder="Optional barcode" />
                  </div>
                </div>
                <div>
                  <Label>Product Name</Label>
                  <Input className="mt-1.5" placeholder="Enter product name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost Price</Label>
                    <Input className="mt-1.5" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Sale Price</Label>
                    <Input className="mt-1.5" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Unit</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="PCS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">PCS</SelectItem>
                        <SelectItem value="box">BOX</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reorder Level</Label>
                    <Input className="mt-1.5" type="number" placeholder="10" />
                  </div>
                  <div>
                    <Label>Safety Stock</Label>
                    <Input className="mt-1.5" type="number" placeholder="5" />
                  </div>
                </div>
                <div>
                  <Label>HSN Code</Label>
                  <Input className="mt-1.5" placeholder="e.g., 8471" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" placeholder="Product description..." rows={2} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Items', value: stats.total, icon: Package, color: 'text-blue-600' },
          { label: 'Products', value: stats.products, icon: Box, color: 'text-green-600' },
          { label: 'Services', value: stats.services, icon: Layers, color: 'text-purple-600' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Total Stock', value: stats.totalStock, icon: Layers, color: 'text-cyan-600' },
          { label: 'Stock Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStock > 0 && (
        <div className="mt-6">
          <Card className="border-orange-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>{stats.lowStock} items need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockProducts.filter(p => p.current_stock <= p.reorder_level && p.product_type === 'product').slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">{product.product_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{product.current_stock}</p>
                      <p className="text-xs text-muted-foreground">Min: {product.reorder_level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

      {/* Products View */}
      {viewMode === 'grid' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="h-48 rounded-xl shimmer" />)
          ) : filteredProducts.map((product, idx) => {
            const stockStatus = getStockStatus(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {product.product_type === 'service' ? (
                          <Layers className="h-6 w-6 text-primary" />
                        ) : (
                          <Package className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Barcode className="h-4 w-4 mr-2" /> Print Barcode</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">{product.product_code}</p>
                      <p className="font-medium line-clamp-1">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.category_name}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Sale Price</p>
                        <p className="font-semibold">₹{Number(product.sale_price).toLocaleString()}</p>
                      </div>
                      {product.product_type === 'product' && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p className={cn(
                            'font-semibold',
                            product.current_stock <= product.reorder_level ? 'text-red-600' : 'text-green-600'
                          )}>
                            {product.current_stock}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{product.product_type}</Badge>
                      <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
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
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product, idx) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <TableRow key={product.id} className="group">
                          <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.category_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.product_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {product.product_type === 'product' ? product.current_stock : '-'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">₹{Number(product.cost_price).toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">₹{Number(product.sale_price).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                          </TableCell>
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
