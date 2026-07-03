'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Calendar,
  Briefcase,
  UserCheck,
  UserX,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  designation_id: string;
  date_of_joining: string;
  employment_status: string;
  work_location: string;
  photograph_url?: string;
}

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('hr_employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }

  const mockEmployees: Employee[] = employees.length > 0 ? employees : [
    { id: '1', employee_code: 'EMP001', first_name: 'Arjun', last_name: 'Sharma', email: 'arjun.sharma@webhoster.ai', phone: '+91 98765 43210', department_id: 'Engineering', designation_id: 'Senior Engineer', date_of_joining: '2023-04-15', employment_status: 'active', work_location: 'Bangalore' },
    { id: '2', employee_code: 'EMP002', first_name: 'Priya', last_name: 'Patel', email: 'priya.patel@webhoster.ai', phone: '+91 98765 43211', department_id: 'Sales', designation_id: 'Sales Manager', date_of_joining: '2022-08-20', employment_status: 'active', work_location: 'Mumbai' },
    { id: '3', employee_code: 'EMP003', first_name: 'Rahul', last_name: 'Kumar', email: 'rahul.kumar@webhoster.ai', phone: '+91 98765 43212', department_id: 'Engineering', designation_id: 'Tech Lead', date_of_joining: '2021-03-10', employment_status: 'active', work_location: 'Delhi' },
    { id: '4', employee_code: 'EMP004', first_name: 'Anjali', last_name: 'Singh', email: 'anjali.singh@webhoster.ai', phone: '+91 98765 43213', department_id: 'HR', designation_id: 'HR Manager', date_of_joining: '2022-01-05', employment_status: 'active', work_location: 'Mumbai' },
    { id: '5', employee_code: 'EMP005', first_name: 'Vikram', last_name: 'Reddy', email: 'vikram.reddy@webhoster.ai', phone: '+91 98765 43214', department_id: 'Finance', designation_id: 'Accountant', date_of_joining: '2023-06-01', employment_status: 'probation', work_location: 'Bangalore' },
    { id: '6', employee_code: 'EMP006', first_name: 'Neha', last_name: 'Gupta', email: 'neha.gupta@webhoster.ai', phone: '+91 98765 43215', department_id: 'Marketing', designation_id: 'Marketing Lead', date_of_joining: '2022-11-15', employment_status: 'active', work_location: 'Mumbai' },
    { id: '7', employee_code: 'EMP007', first_name: 'Sanjay', last_name: 'Verma', email: 'sanjay.verma@webhoster.ai', phone: '+91 98765 43216', department_id: 'Engineering', designation_id: 'Junior Engineer', date_of_joining: '2024-01-15', employment_status: 'probation', work_location: 'Chennai' },
    { id: '8', employee_code: 'EMP008', first_name: 'Meera', last_name: 'Nair', email: 'meera.nair@webhoster.ai', phone: '+91 98765 43217', department_id: 'Operations', designation_id: 'Operations Manager', date_of_joining: '2020-05-10', employment_status: 'active', work_location: 'Hyderabad' },
  ];

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name} ${emp.employee_code} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.employment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockEmployees.length,
    active: mockEmployees.filter(e => e.employment_status === 'active').length,
    onProbation: mockEmployees.filter(e => e.employment_status === 'probation').length,
    departments: new Set(mockEmployees.map(e => e.department_id)).size,
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    active: { color: 'bg-green-500/10 text-green-700', label: 'Active' },
    probation: { color: 'bg-yellow-500/10 text-yellow-700', label: 'Probation' },
    resigned: { color: 'bg-red-500/10 text-red-700', label: 'Resigned' },
    terminated: { color: 'bg-gray-500/10 text-gray-700', label: 'Terminated' },
  };

  return (
    <AppShell>
      <PageHeader
        title="Employee Directory"
        description="Manage employee information and records"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter employee details to create a new record
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label>First Name</Label>
                    <Input className="mt-1.5" placeholder="First name" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input className="mt-1.5" placeholder="Last name" />
                  </div>
                  <div>
                    <Label>Employee Code</Label>
                    <Input className="mt-1.5" placeholder="EMP001" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input className="mt-1.5" type="email" placeholder="email@webhoster.ai" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1.5" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label>Date of Joining</Label>
                    <Input className="mt-1.5" type="date" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sde">Senior Engineer</SelectItem>
                        <SelectItem value="tl">Tech Lead</SelectItem>
                        <SelectItem value="mgr">Manager</SelectItem>
                        <SelectItem value="arch">Architect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Work Location</Label>
                    <Input className="mt-1.5" placeholder="Office location" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setCreateDialogOpen(false)}>Create Employee</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-600' },
          { label: 'On Probation', value: stats.onProbation, icon: Calendar, color: 'text-yellow-600' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
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
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
            <SelectItem value="resigned">Resigned</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg p-1">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
            Grid
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
            List
          </Button>
        </div>
      </div>

      {/* Employee List */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl shimmer" />)}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.employee_code}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Profile</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Send Email</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{emp.designation_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{emp.department_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{emp.work_location}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={statusConfig[emp.employment_status]?.color || 'bg-gray-500/10'}>
                        {statusConfig[emp.employment_status]?.label || emp.employment_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Since {new Date(emp.date_of_joining).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredEmployees.map((emp, i) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                        <p className="text-sm text-muted-foreground">{emp.employee_code} | {emp.department_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{emp.designation_id}</p>
                        <p className="text-xs text-muted-foreground">{emp.work_location}</p>
                      </div>
                      <Badge className={statusConfig[emp.employment_status]?.color}>
                        {statusConfig[emp.employment_status]?.label}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
