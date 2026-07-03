'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Plus,
  Search,
  Users,
  Calendar,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function ShiftsPage() {
  const [createShiftOpen, setCreateShiftOpen] = useState(false);

  const shifts = [
    { id: '1', code: 'GEN', name: 'General Shift', start: '09:00', end: '18:00', grace: 15, break: 60, employees: 120, isNight: false, weekOff: ['Sat', 'Sun'] },
    { id: '2', code: 'MORN', name: 'Morning Shift', start: '06:00', end: '14:00', grace: 10, break: 30, employees: 25, isNight: false, weekOff: ['Sun'] },
    { id: '3', code: 'EVE', name: 'Evening Shift', start: '14:00', end: '22:00', grace: 10, break: 30, employees: 20, isNight: false, weekOff: ['Sun'] },
    { id: '4', code: 'NIGHT', name: 'Night Shift', start: '22:00', end: '06:00', grace: 10, break: 30, employees: 15, isNight: true, weekOff: ['Mon'] },
    { id: '5', code: 'FLEX', name: 'Flexible Shift', start: '10:00', end: '19:00', grace: 30, break: 60, employees: 45, isNight: false, weekOff: ['Sat', 'Sun'] },
  ];

  const employeeShifts = [
    { id: '1', employee: 'Arjun Sharma', code: 'EMP001', shift: 'General Shift', effectiveFrom: '2024-01-01', isCurrent: true },
    { id: '2', employee: 'Priya Patel', code: 'EMP002', shift: 'General Shift', effectiveFrom: '2024-03-15', isCurrent: true },
    { id: '3', employee: 'Rahul Kumar', code: 'EMP003', shift: 'Morning Shift', effectiveFrom: '2024-06-01', isCurrent: true },
    { id: '4', employee: 'Anjali Singh', code: 'EMP004', shift: 'General Shift', effectiveFrom: '2024-02-01', isCurrent: true },
    { id: '5', employee: 'Vikram Reddy', code: 'EMP005', shift: 'Night Shift', effectiveFrom: '2024-07-01', isCurrent: true },
  ];

  const roster = [
    { employee: 'Rahul Kumar', mon: 'MORN', tue: 'MORN', wed: 'MORN', thu: 'MORN', fri: 'OFF', sat: 'OFF', sun: 'OFF' },
    { employee: 'Vikram Reddy', mon: 'NIGHT', tue: 'NIGHT', wed: 'NIGHT', thu: 'NIGHT', fri: 'NIGHT', sat: 'OFF', sun: 'OFF' },
    { employee: 'Amit Kumar', mon: 'EVE', tue: 'EVE', wed: 'EVE', thu: 'EVE', fri: 'OFF', sat: 'EVE', sun: 'EVE' },
  ];

  const shiftColors: Record<string, string> = {
    GEN: 'bg-blue-500/10 text-blue-700',
    MORN: 'bg-yellow-500/10 text-yellow-700',
    EVE: 'bg-orange-500/10 text-orange-700',
    NIGHT: 'bg-purple-500/10 text-purple-700',
    FLEX: 'bg-green-500/10 text-green-700',
    OFF: 'bg-gray-500/10 text-gray-700',
  };

  return (
    <AppShell>
      <PageHeader
        title="Shift Management"
        description="Configure shifts, assign employees, and manage rotations"
        action={
          <Dialog open={createShiftOpen} onOpenChange={setCreateShiftOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>
                  Define a new shift timing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shift Code</Label>
                    <Input className="mt-1.5" placeholder="e.g., SHIFT1" />
                  </div>
                  <div>
                    <Label>Shift Name</Label>
                    <Input className="mt-1.5" placeholder="e.g., Morning Shift" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input className="mt-1.5" type="time" />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input className="mt-1.5" type="time" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grace Period (min)</Label>
                    <Input className="mt-1.5" type="number" placeholder="15" />
                  </div>
                  <div>
                    <Label>Break Duration (min)</Label>
                    <Input className="mt-1.5" type="number" placeholder="60" />
                  </div>
                </div>
                <div>
                  <Label>Week Off Days</Label>
                  <div className="flex gap-2 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <Button key={day} variant="outline" size="sm" className="px-2">{day}</Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="nightShift" className="rounded" />
                  <Label htmlFor="nightShift" className="cursor-pointer">Is Night Shift</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateShiftOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateShiftOpen(false)}>Create Shift</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Shifts', value: shifts.length, icon: Clock, color: 'text-blue-600' },
          { label: 'Shift Employees', value: shifts.reduce((a, s) => a + s.employees, 0), icon: Users, color: 'text-purple-600' },
          { label: 'Night Shifts', value: shifts.filter(s => s.isNight).length, icon: Moon, color: 'text-indigo-600' },
          { label: 'Rotational', value: 3, icon: RefreshCw, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs className="mt-6" defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Shift Definitions</TabsTrigger>
          <TabsTrigger value="employees">Employee Assignments</TabsTrigger>
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift, i) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {shift.isNight ? <Moon className="h-5 w-5 text-purple-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                        <div>
                          <p className="font-medium">{shift.name}</p>
                          <p className="text-xs text-muted-foreground">{shift.code}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex items-center gap-4 text-2xl font-bold mb-4">
                      <span>{shift.start}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.end}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grace Period</span>
                        <span>{shift.grace} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Break Duration</span>
                        <span>{shift.break} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Week Off</span>
                        <span>{shift.weekOff.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <Badge>{shift.employees}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {employeeShifts.map((emp, i) => (
                  <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{emp.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.employee}</p>
                        <p className="text-sm text-muted-foreground">{emp.code}</p>
                      </div>
                    </div>
                    <Badge>{emp.shift}</Badge>
                    <span className="text-sm text-muted-foreground">Since {emp.effectiveFrom}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster" className="mt-4">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-center p-3 font-medium">Mon</th>
                      <th className="text-center p-3 font-medium">Tue</th>
                      <th className="text-center p-3 font-medium">Wed</th>
                      <th className="text-center p-3 font-medium">Thu</th>
                      <th className="text-center p-3 font-medium">Fri</th>
                      <th className="text-center p-3 font-medium">Sat</th>
                      <th className="text-center p-3 font-medium">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 font-medium">{row.employee}</td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.mon]}>{row.mon}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.tue]}>{row.tue}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.wed]}>{row.wed}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.thu]}>{row.thu}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.fri]}>{row.fri}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.sat]}>{row.sat}</Badge></td>
                        <td className="text-center p-3"><Badge className={shiftColors[row.sun]}>{row.sun}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return <span className={className}>→</span>;
}
