'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Landmark,
  Home,
  GitBranch,
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
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
  state: string;
  is_head_office: boolean;
  is_active: boolean;
}

interface Department {
  id: string;
  dept_code: string;
  dept_name: string;
  parent_dept_id: string | null;
  description: string;
  is_active: boolean;
  children?: Department[];
}

interface Designation {
  id: string;
  designation_code: string;
  designation_name: string;
  level: number;
  min_salary: number;
  max_salary: number;
  is_active: boolean;
}

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'branch' | 'department' | 'designation'>('branch');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [branchRes, deptRes, desRes] = await Promise.all([
        supabase.from('branches').select('*').order('branch_name'),
        supabase.from('departments').select('*').order('dept_name'),
        supabase.from('designations').select('*').order('level'),
      ]);

      if (branchRes.data) setBranches(branchRes.data);
      if (deptRes.data) setDepartments(buildDeptTree(deptRes.data));
      if (desRes.data) setDesignations(desRes.data);
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  }

  function buildDeptTree(depts: Department[]): Department[] {
    const map = new Map<string, Department>();
    const roots: Department[] = [];

    depts.forEach(d => map.set(d.id, { ...d, children: [] }));
    depts.forEach(d => {
      const node = map.get(d.id)!;
      if (d.parent_dept_id && map.has(d.parent_dept_id)) {
        map.get(d.parent_dept_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  const mockBranches: Branch[] = branches.length > 0 ? branches : [
    { id: '1', branch_code: 'HO', branch_name: 'Head Office - Mumbai', branch_type: 'corporate', city: 'Mumbai', state: 'Maharashtra', is_head_office: true, is_active: true },
    { id: '2', branch_code: 'DEL', branch_name: 'Delhi Branch', branch_type: 'regional', city: 'Delhi', state: 'Delhi', is_head_office: false, is_active: true },
    { id: '3', branch_code: 'BLR', branch_name: 'Bangalore Tech Center', branch_type: 'regional', city: 'Bangalore', state: 'Karnataka', is_head_office: false, is_active: true },
    { id: '4', branch_code: 'CHN', branch_name: 'Chennai Office', branch_type: 'branch', city: 'Chennai', state: 'Tamil Nadu', is_head_office: false, is_active: true },
    { id: '5', branch_code: 'HYD', branch_name: 'Hyderabad Center', branch_type: 'branch', city: 'Hyderabad', state: 'Telangana', is_head_office: false, is_active: true },
  ];

  const mockDepartments: Department[] = departments.length > 0 ? departments : [
    { id: '1', dept_code: 'ENG', dept_name: 'Engineering', parent_dept_id: null, description: 'Software Development', is_active: true, children: [
      { id: '11', dept_code: 'FE', dept_name: 'Frontend', parent_dept_id: '1', description: 'Frontend Development', is_active: true, children: [] },
      { id: '12', dept_code: 'BE', dept_name: 'Backend', parent_dept_id: '1', description: 'Backend Development', is_active: true, children: [] },
      { id: '13', dept_code: 'QA', dept_name: 'Quality Assurance', parent_dept_id: '1', description: 'Testing & QA', is_active: true, children: [] },
    ]},
    { id: '2', dept_code: 'SALES', dept_name: 'Sales', parent_dept_id: null, description: 'Sales & Business Development', is_active: true, children: [
      { id: '21', dept_code: 'IS', dept_name: 'Inside Sales', parent_dept_id: '2', description: 'Inside Sales Team', is_active: true, children: [] },
      { id: '22', dept_code: 'FS', dept_name: 'Field Sales', parent_dept_id: '2', description: 'Field Sales Team', is_active: true, children: [] },
    ]},
    { id: '3', dept_code: 'HR', dept_name: 'Human Resources', parent_dept_id: null, description: 'HR & People Operations', is_active: true, children: [] },
    { id: '4', dept_code: 'FIN', dept_name: 'Finance', parent_dept_id: null, description: 'Finance & Accounting', is_active: true, children: [] },
    { id: '5', dept_code: 'MKT', dept_name: 'Marketing', parent_dept_id: null, description: 'Marketing & Communications', is_active: true, children: [] },
    { id: '6', dept_code: 'OPS', dept_name: 'Operations', parent_dept_id: null, description: 'Operations & Support', is_active: true, children: [] },
  ];

  const mockDesignations: Designation[] = designations.length > 0 ? designations : [
    { id: '1', designation_code: 'JSE', designation_name: 'Junior Software Engineer', level: 1, min_salary: 300000, max_salary: 600000, is_active: true },
    { id: '2', designation_code: 'SSE', designation_name: 'Senior Software Engineer', level: 2, min_salary: 600000, max_salary: 1200000, is_active: true },
    { id: '3', designation_code: 'TL', designation_name: 'Tech Lead', level: 3, min_salary: 1200000, max_salary: 1800000, is_active: true },
    { id: '4', designation_code: 'ARCH', designation_name: 'Architect', level: 4, min_salary: 1800000, max_salary: 2500000, is_active: true },
    { id: '5', designation_code: 'MGR', designation_name: 'Manager', level: 4, min_salary: 1500000, max_salary: 2500000, is_active: true },
    { id: '6', designation_code: 'SRMGR', designation_name: 'Senior Manager', level: 5, min_salary: 2500000, max_salary: 3500000, is_active: true },
    { id: '7', designation_code: 'DIR', designation_name: 'Director', level: 6, min_salary: 3500000, max_salary: 5000000, is_active: true },
    { id: '8', designation_code: 'AVP', designation_name: 'Assistant Vice President', level: 6, min_salary: 4000000, max_salary: 6000000, is_active: true },
    { id: '9', designation_code: 'VP', designation_name: 'Vice President', level: 7, min_salary: 5000000, max_salary: 8000000, is_active: true },
  ];

  const stats = {
    totalBranches: mockBranches.length,
    activeBranches: mockBranches.filter(b => b.is_active).length,
    totalDepartments: flattenDepartments(mockDepartments).length,
    totalDesignations: mockDesignations.length,
    headCount: 180,
    managers: 25,
  };

  function flattenDepartments(depts: Department[]): Department[] {
    const result: Department[] = [];
    function flatten(list: Department[]) {
      list.forEach(d => {
        result.push(d);
        if (d.children?.length) flatten(d.children);
      });
    }
    flatten(depts);
    return result;
  }

  function toggleDept(deptId: string) {
    setExpandedDepts(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  }

  function renderDepartmentTree(depts: Department[], depth = 0) {
    return depts.map(dept => (
      <div key={dept.id}>
        <Collapsible open={expandedDepts.includes(dept.id)} onOpenChange={() => toggleDept(dept.id)}>
          <div className={cn(
            'flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer',
            depth > 0 && 'ml-6'
          )}>
            {(dept.children?.length ?? 0) > 0 ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {expandedDepts.includes(dept.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6" />
            )}
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{dept.dept_name}</p>
              <p className="text-xs text-muted-foreground">{dept.dept_code}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {dept.children?.length || 0} sub-depts
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem><Plus className="h-4 w-4 mr-2" /> Add Sub-Department</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {(dept.children?.length ?? 0) > 0 && (
            <CollapsibleContent>
              <div className="border-l ml-4 pl-2">
                {renderDepartmentTree(dept.children!, depth + 1)}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    ));
  }

  return (
    <AppShell>
      <PageHeader
        title="Organization Management"
        description="Manage company structure, branches, departments, and designations"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl" onClick={() => setCreateType('branch')}>
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Organization Entity</DialogTitle>
                <DialogDescription>
                  Add a new branch, department, or designation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Tabs value={createType} onValueChange={(v) => setCreateType(v as typeof createType)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="branch" className="flex-1">Branch</TabsTrigger>
                    <TabsTrigger value="department" className="flex-1">Department</TabsTrigger>
                    <TabsTrigger value="designation" className="flex-1">Designation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="branch" className="space-y-4">
                    <div>
                      <Label>Branch Code</Label>
                      <Input className="mt-1.5" placeholder="e.g., MUM" />
                    </div>
                    <div>
                      <Label>Branch Name</Label>
                      <Input className="mt-1.5" placeholder="e.g., Mumbai Branch" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input className="mt-1.5" placeholder="City" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input className="mt-1.5" placeholder="State" />
                      </div>
                    </div>
                    <div>
                      <Label>Branch Type</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="branch">Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  <TabsContent value="department" className="space-y-4">
                    <div>
                      <Label>Department Code</Label>
                      <Input className="mt-1.5" placeholder="e.g., ENG" />
                    </div>
                    <div>
                      <Label>Department Name</Label>
                      <Input className="mt-1.5" placeholder="e.g., Engineering" />
                    </div>
                    <div>
                      <Label>Parent Department</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="None (Root Level)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {flattenDepartments(mockDepartments).map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.dept_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input className="mt-1.5" placeholder="Department description" />
                    </div>
                  </TabsContent>
                  <TabsContent value="designation" className="space-y-4">
                    <div>
                      <Label>Designation Code</Label>
                      <Input className="mt-1.5" placeholder="e.g., TL" />
                    </div>
                    <div>
                      <Label>Designation Name</Label>
                      <Input className="mt-1.5" placeholder="e.g., Tech Lead" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Level</Label>
                        <Input className="mt-1.5" type="number" placeholder="1-10" />
                      </div>
                      <div>
                        <Label>Reports To</Label>
                        <Select>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockDesignations.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.designation_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Salary (Annual)</Label>
                        <Input className="mt-1.5" type="number" placeholder="300000" />
                      </div>
                      <div>
                        <Label>Max Salary (Annual)</Label>
                        <Input className="mt-1.5" type="number" placeholder="600000" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Branches', value: stats.totalBranches, icon: Landmark, color: 'text-blue-600' },
          { label: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'text-purple-600' },
          { label: 'Designations', value: stats.totalDesignations, icon: Users, color: 'text-cyan-600' },
          { label: 'Headcount', value: stats.headCount, icon: Users, color: 'text-green-600' },
          { label: 'Managers', value: stats.managers, icon: Users, color: 'text-orange-600' },
          { label: 'Active Branches', value: stats.activeBranches, icon: Home, color: 'text-emerald-600' },
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
      <Tabs className="mt-6" defaultValue="branches">
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
          <TabsTrigger value="hierarchy">Org Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBranches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center',
                          branch.is_head_office ? 'bg-primary/10' : 'bg-muted'
                        )}>
                          <Building2 className={cn('h-5 w-5', branch.is_head_office ? 'text-primary' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <p className="font-medium">{branch.branch_name}</p>
                          <p className="text-sm text-muted-foreground">{branch.branch_code}</p>
                        </div>
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
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {branch.city}, {branch.state}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={branch.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {branch.is_head_office && (
                        <Badge className="bg-primary/10 text-primary">Head Office</Badge>
                      )}
                      <Badge variant="outline" className="ml-auto capitalize">{branch.branch_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Structure</CardTitle>
              <CardDescription>Organization hierarchy with departments and sub-departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {renderDepartmentTree(mockDepartments)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designations" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockDesignations.map((des, i) => (
                  <motion.div
                    key={des.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                        L{des.level}
                      </div>
                      <div>
                        <p className="font-medium">{des.designation_name}</p>
                        <p className="text-sm text-muted-foreground">{des.designation_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {(des.min_salary / 100000).toFixed(1)}L - {(des.max_salary / 100000).toFixed(1)}L
                      </p>
                      <p className="text-xs text-muted-foreground">Annual CTC Range</p>
                    </div>
                    <Badge className={des.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                      {des.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
              <CardDescription>Reporting structure and chain of command</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-8">
                {[
                  { level: 7, title: 'Executive', roles: ['CEO', 'VP'], color: 'bg-purple-500' },
                  { level: 6, title: 'Leadership', roles: ['Director', 'AVP'], color: 'bg-blue-500' },
                  { level: 5, title: 'Senior Management', roles: ['Sr. Manager'], color: 'bg-cyan-500' },
                  { level: 4, title: 'Middle Management', roles: ['Manager', 'Architect', 'TL'], color: 'bg-green-500' },
                  { level: 2, title: 'Individual Contributors', roles: ['Sr. Engineer', 'Engineer'], color: 'bg-orange-500' },
                  { level: 1, title: 'Entry Level', roles: ['Jr. Engineer', 'Intern'], color: 'bg-gray-400' },
                ].map((tier, i) => (
                  <div key={tier.level} className="w-full max-w-3xl">
                    <div className="text-center mb-3">
                      <p className="text-sm text-muted-foreground">Level {tier.level}</p>
                      <p className="font-medium">{tier.title}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      {tier.roles.map((role, j) => (
                        <div key={j} className={cn(
                          'px-4 py-2 rounded-lg text-white text-sm font-medium',
                          tier.color
                        )}>
                          {role}
                        </div>
                      ))}
                    </div>
                    {i < 5 && <div className="h-8 w-px bg-border mx-auto my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
