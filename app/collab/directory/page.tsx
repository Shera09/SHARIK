'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Contact,
  Search,
  Filter,
  Grid,
  List,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Twitter,
  MessageSquare,
  Video,
  MoreHorizontal,
  Users,
  ChevronDown,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Employee {
  profile_id: string;
  user_id: string;
  display_name: string;
  title: string;
  department: string;
  branch_id: string;
  manager_id: string;
  email: string;
  phone: string;
  location: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  status: string;
  status_message: string;
  is_online: boolean;
  last_seen_at: string;
}

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('status', 'active')
        .order('display_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Mock employees
  const mockEmployees = employees.length > 0 ? employees : [
    { profile_id: '1', user_id: 'u1', display_name: 'Sarah Johnson', title: 'CEO & Founder', department: 'Executive', branch_id: 'hq', manager_id: '', email: 'sarah@company.com', phone: '+1-555-0100', location: 'New York, NY', avatar_url: '', bio: 'Visionary leader with 15+ years of experience', skills: ['Leadership', 'Strategy', 'Business Development'], status: 'active', status_message: 'In office', is_online: true, last_seen_at: new Date().toISOString() },
    { profile_id: '2', user_id: 'u2', display_name: 'Michael Chen', title: 'CTO', department: 'Technology', branch_id: 'hq', manager_id: 'u1', email: 'michael@company.com', phone: '+1-555-0101', location: 'San Francisco, CA', avatar_url: '', bio: 'Technology strategist and innovation driver', skills: ['Architecture', 'AI/ML', 'Cloud'], status: 'active', status_message: 'Working from home', is_online: true, last_seen_at: new Date().toISOString() },
    { profile_id: '3', user_id: 'u3', display_name: 'Emily Davis', title: 'VP of Sales', department: 'Sales', branch_id: 'east', manager_id: 'u1', email: 'emily@company.com', phone: '+1-555-0102', location: 'Boston, MA', avatar_url: '', bio: 'Sales leader driving revenue growth', skills: ['Enterprise Sales', 'Negotiation', 'CRM'], status: 'active', status_message: '', is_online: false, last_seen_at: new Date(Date.now() - 3600000).toISOString() },
    { profile_id: '4', user_id: 'u4', display_name: 'Alex Thompson', title: 'Product Manager', department: 'Product', branch_id: 'hq', manager_id: 'u2', email: 'alex@company.com', phone: '+1-555-0103', location: 'Austin, TX', avatar_url: '', bio: 'Product enthusiast building great experiences', skills: ['Product Strategy', 'UX', 'Agile'], status: 'active', status_message: 'In a meeting', is_online: true, last_seen_at: new Date().toISOString() },
    { profile_id: '5', user_id: 'u5', display_name: 'Jessica Williams', title: 'HR Director', department: 'Human Resources', branch_id: 'hq', manager_id: 'u1', email: 'jessica@company.com', phone: '+1-555-0104', location: 'Chicago, IL', avatar_url: '', bio: 'People-first HR professional', skills: ['Talent Acquisition', 'Employee Relations', 'L&D'], status: 'active', status_message: '', is_online: true, last_seen_at: new Date().toISOString() },
    { profile_id: '6', user_id: 'u6', display_name: 'David Kim', title: 'Senior Developer', department: 'Technology', branch_id: 'west', manager_id: 'u2', email: 'david@company.com', phone: '+1-555-0105', location: 'Seattle, WA', avatar_url: '', bio: 'Full-stack developer passionate about clean code', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], status: 'active', status_message: 'Deep work mode', is_online: true, last_seen_at: new Date().toISOString() },
    { profile_id: '7', user_id: 'u7', display_name: 'Lisa Martinez', title: 'Marketing Lead', department: 'Marketing', branch_id: 'hq', manager_id: 'u1', email: 'lisa@company.com', phone: '+1-555-0106', location: 'Los Angeles, CA', avatar_url: '', bio: 'Creative marketer driving brand growth', skills: ['Brand Strategy', 'Digital Marketing', 'Content'], status: 'active', status_message: '', is_online: false, last_seen_at: new Date(Date.now() - 86400000).toISOString() },
    { profile_id: '8', user_id: 'u8', display_name: 'James Wilson', title: 'Finance Controller', department: 'Finance', branch_id: 'hq', manager_id: 'u1', email: 'james@company.com', phone: '+1-555-0107', location: 'New York, NY', avatar_url: '', bio: 'Financial strategist ensuring fiscal health', skills: ['Financial Planning', 'Budgeting', 'Compliance'], status: 'active', status_message: '', is_online: true, last_seen_at: new Date().toISOString() },
  ];

  const departments = Array.from(new Set(mockEmployees.map(e => e.department)));

  const stats = {
    total: mockEmployees.length,
    online: mockEmployees.filter(e => e.is_online).length,
    departments: departments.length,
    locations: Array.from(new Set(mockEmployees.map(e => e.location))).length,
  };

  const viewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailDialogOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="Employee Directory"
        description="Find and connect with colleagues across the organization"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Online Now', value: stats.online, icon: Contact, color: 'text-green-600' },
          { label: 'Departments', value: stats.departments, icon: Briefcase, color: 'text-purple-600' },
          { label: 'Locations', value: stats.locations, icon: MapPin, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color, "opacity-50")} />
                </div>
              </CardContent>
            </Card>
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

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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

      {/* Employees */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-xl shimmer" />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockEmployees.map((employee, i) => (
            <motion.div
              key={employee.profile_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewEmployee(employee)}>
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl">{employee.display_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background",
                      employee.is_online ? "bg-green-500" : "bg-gray-400"
                    )} />
                  </div>
                  <h3 className="mt-3 font-semibold">{employee.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.title}</p>
                  <Badge variant="outline" className="mt-2">{employee.department}</Badge>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {employee.location}
                  </div>
                  {employee.status_message && (
                    <p className="mt-2 text-xs text-muted-foreground italic">"{employee.status_message}"</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="divide-y">
              {mockEmployees.map((employee, i) => (
                <motion.div
                  key={employee.profile_id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer"
                  onClick={() => viewEmployee(employee)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{employee.display_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                        employee.is_online ? "bg-green-500" : "bg-gray-400"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{employee.display_name}</p>
                      <p className="text-sm text-muted-foreground">{employee.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge variant="outline">{employee.department}</Badge>
                    <span className="text-sm text-muted-foreground">{employee.location}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Employee Profile</DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarFallback className="text-2xl">
                      {selectedEmployee.display_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 text-xl font-semibold">{selectedEmployee.display_name}</h2>
                  <p className="text-muted-foreground">{selectedEmployee.title}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline">{selectedEmployee.department}</Badge>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      selectedEmployee.is_online ? "text-green-600" : "text-gray-500"
                    )}>
                      <div className={cn("h-2 w-2 rounded-full", selectedEmployee.is_online ? "bg-green-500" : "bg-gray-400")} />
                      {selectedEmployee.is_online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedEmployee.email}`} className="text-sm text-blue-600 hover:underline">
                      {selectedEmployee.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.department}</span>
                  </div>
                </div>

                {selectedEmployee.bio && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">{selectedEmployee.bio}</p>
                  </>
                )}

                {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Video className="h-4 w-4" />
                    Video Call
                  </Button>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
