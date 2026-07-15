'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Play,
  Clock,
  Award,
  Users,
  CheckCircle2,
  BarChart3,
  FileText,
  Video,
  MoreHorizontal,
  Eye,
  Edit,
  Filter,
  Lock,
  Unlock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  'Technical Skills': 'bg-blue-500/10 text-blue-700',
  'Leadership': 'bg-purple-500/10 text-purple-700',
  'Communication': 'bg-green-500/10 text-green-700',
  'Domain Knowledge': 'bg-orange-500/10 text-orange-700',
  'Compliance': 'bg-red-500/10 text-red-700',
  'Onboarding': 'bg-cyan-500/10 text-cyan-700',
};

const difficultyConfig: Record<string, { color: string; label: string }> = {
  beginner: { color: 'bg-green-500/10 text-green-700', label: 'Beginner' },
  intermediate: { color: 'bg-yellow-500/10 text-yellow-700', label: 'Intermediate' },
  advanced: { color: 'bg-orange-500/10 text-orange-700', label: 'Advanced' },
  expert: { color: 'bg-red-500/10 text-red-700', label: 'Expert' },
};

export default function LearningPage() {
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const stats = {
    totalCourses: 85,
    totalEnrollments: 520,
    completionRate: 78,
    totalCertificates: 342,
    avgScore: 82,
    hoursLearned: 1250,
  };

  const courses = [
    { id: '1', title: 'React Fundamentals', category: 'Technical Skills', instructor: 'Rahul Kumar', duration: 8, enrolled: 45, rating: 4.8, difficulty: 'beginner', progress: 100, status: 'published' },
    { id: '2', title: 'Leadership Essentials', category: 'Leadership', instructor: 'Anjali Singh', duration: 6, enrolled: 32, rating: 4.5, difficulty: 'intermediate', progress: 0, status: 'published' },
    { id: '3', title: 'Effective Communication', category: 'Communication', instructor: 'Priya Patel', duration: 4, enrolled: 56, rating: 4.7, difficulty: 'beginner', progress: 60, status: 'published' },
    { id: '4', title: 'Data Analytics Masterclass', category: 'Technical Skills', instructor: 'Vikram Reddy', duration: 12, enrolled: 28, rating: 4.6, difficulty: 'advanced', progress: 25, status: 'published' },
    { id: '5', title: 'Company Onboarding', category: 'Onboarding', instructor: 'HR Team', duration: 2, enrolled: 180, rating: 4.9, difficulty: 'beginner', progress: 100, status: 'mandatory' },
    { id: '6', title: 'Information Security', category: 'Compliance', instructor: 'Security Team', duration: 3, enrolled: 150, rating: 4.4, difficulty: 'intermediate', progress: 80, status: 'mandatory' },
  ];

  const learningPaths = [
    { id: '1', name: 'Full Stack Developer', courses: 8, duration: 40, enrolled: 25, progress: 45 },
    { id: '2', name: 'Sales Excellence', courses: 6, duration: 24, enrolled: 35, progress: 60 },
    { id: '3', name: 'Project Manager', courses: 10, duration: 32, enrolled: 18, progress: 30 },
    { id: '4', name: 'People Manager', courses: 5, duration: 16, enrolled: 42, progress: 80 },
  ];

  const certificates = [
    { id: '1', employee: 'Arjun Sharma', course: 'React Fundamentals', score: 95, date: '2024-06-15', validUntil: '2027-06-15' },
    { id: '2', employee: 'Priya Patel', course: 'Sales Excellence', score: 88, date: '2024-05-20', validUntil: '2027-05-20' },
    { id: '3', employee: 'Rahul Kumar', course: 'Leadership Essentials', score: 92, date: '2024-06-01', validUntil: '2027-06-01' },
  ];

  const skillMatrix = [
    { skill: 'React', current: 4, target: 5, employees: 45, gap: 5 },
    { skill: 'Node.js', current: 3.5, target: 4, employees: 38, gap: 8 },
    { skill: 'Leadership', current: 3, target: 4, employees: 25, gap: 15 },
    { skill: 'Communication', current: 3.8, target: 4, employees: 180, gap: 12 },
    { skill: 'Project Management', current: 3.2, target: 4, employees: 30, gap: 10 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Learning Management System"
        description="Courses, training programs, and skill development"
        action={
          <div className="flex gap-2">
            <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Add a new course to the learning catalog
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Course Title</Label>
                    <Input className="mt-1.5" placeholder="Enter course title" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Skills</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration (hours)</Label>
                      <Input className="mt-1.5" type="number" placeholder="8" />
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Instructor</Label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Assign instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emp1">Rahul Kumar</SelectItem>
                        <SelectItem value="emp2">Anjali Singh</SelectItem>
                        <SelectItem value="emp3">Priya Patel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateCourseOpen(false)}>Cancel</Button>
                  <Button onClick={() => setCreateCourseOpen(false)}>Create Course</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Enrollments', value: stats.totalEnrollments, icon: Users, color: 'text-purple-600' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Certificates', value: stats.totalCertificates, icon: Award, color: 'text-yellow-600' },
          { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: BarChart3, color: 'text-orange-600' },
          { label: 'Hours Learned', value: stats.hoursLearned.toLocaleString(), icon: Clock, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs className="mt-6" defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="skills">Skill Matrix</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={categoryColors[course.category] || 'bg-gray-500/10'}>
                        {course.category}
                      </Badge>
                      <Badge variant="outline" className={difficultyConfig[course.difficulty]?.color}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">By {course.instructor}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}h</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolled}</span>
                    </div>
                    {course.progress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button variant={course.progress > 0 && course.progress < 100 ? 'default' : 'outline'} size="sm" className="flex-1">
                        {course.progress === 0 ? 'Enroll' : course.progress === 100 ? 'Completed' : 'Continue'}
                      </Button>
                      {course.progress === 100 && (
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paths" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map((path, i) => (
              <Card key={path.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{path.name}</CardTitle>
                    <Badge variant="outline">{path.courses} courses</Badge>
                  </div>
                  <CardDescription>{path.duration} hours total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{path.enrolled} enrolled</span>
                    <span className="font-medium">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                  <Button variant="outline" className="w-full mt-4">View Courses</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Skill Matrix</CardTitle>
              <CardDescription>Current skill levels and training needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillMatrix.map((skill, i) => (
                  <div key={skill.skill} className="flex items-center gap-4">
                    <div className="w-48 font-medium">{skill.skill}</div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div key={level} className={cn(
                              'h-4 w-4 rounded-full mr-0.5',
                              level <= skill.current ? 'bg-green-500' : 'bg-muted'
                            )} />
                          ))}
                        </div>
                        <span className="text-sm">{skill.current}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Target:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div key={level} className={cn(
                              'h-4 w-4 rounded-full mr-0.5',
                              level <= skill.target ? 'bg-blue-500' : 'bg-muted'
                            )} />
                          ))}
                        </div>
                        <span className="text-sm">{skill.target}</span>
                      </div>
                    </div>
                    <Badge className={skill.gap > 10 ? 'bg-red-500/10 text-red-700' : 'bg-yellow-500/10 text-yellow-700'}>
                      Gap: {skill.gap}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {certificates.map((cert, i) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{cert.employee}</p>
                        <p className="text-sm text-muted-foreground">{cert.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {cert.score}%</p>
                        <p className="text-xs text-muted-foreground">Valid until {new Date(cert.validUntil).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                      </div>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
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
