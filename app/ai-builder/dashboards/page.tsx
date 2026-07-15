'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wand2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  Sparkles,
  Settings,
  Palette,
  Grid3X3,
  Monitor,
  Save,
  Download,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DashboardProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  widgets: any[];
  data_sources: any[];
  theme: any;
  created_at: string;
};

type WidgetType = {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
};

type DataSource = {
  id: string;
  name: string;
  type: string;
  status: string;
};

const widgetTypes: WidgetType[] = [
  { id: 'metric', name: 'Metric Card', icon: 'BarChart3', category: 'display', description: 'Single KPI display' },
  { id: 'line-chart', name: 'Line Chart', icon: 'LineChart', category: 'charts', description: 'Time series data' },
  { id: 'bar-chart', name: 'Bar Chart', icon: 'BarChart3', category: 'charts', description: 'Comparative data' },
  { id: 'pie-chart', name: 'Pie Chart', icon: 'PieChart', category: 'charts', description: 'Distribution data' },
  { id: 'table', name: 'Data Table', icon: 'Grid3X3', category: 'data', description: 'Tabular data view' },
  { id: 'gauge', name: 'Gauge', icon: 'Activity', category: 'display', description: 'Progress indicator' },
  { id: 'counter', name: 'Counter', icon: 'TrendingUp', category: 'display', description: 'Animated number' },
  { id: 'map', name: 'Geographic Map', icon: 'Globe', category: 'maps', description: 'Location data' },
];

const chartThemeOptions = [
  { value: 'emerald', label: 'Emerald', color: '#10B981' },
  { value: 'blue', label: 'Ocean Blue', color: '#3B82F6' },
  { value: 'purple', label: 'Royal Purple', color: '#8B5CF6' },
  { value: 'orange', label: 'Sunset Orange', color: '#F97316' },
  { value: 'rose', label: 'Rose Pink', color: '#F43F5E' },
  { value: 'cyan', label: 'Cyan', color: '#06B6D4' },
];

export default function DashboardBuilderPage() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [chartTheme, setChartTheme] = useState('emerald');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<DashboardProject | null>(null);
  const [editDialog, setEditDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('project_type', 'dashboard')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateDashboard = async () => {
    if (!projectName.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }

    setGenerating(true);

    await new Promise(r => setTimeout(r, 3000));

    const defaultWidgets = [
      { id: 'revenue', type: 'metric', title: 'Total Revenue', icon: 'DollarSign', position: { x: 0, y: 0, w: 3, h: 2 } },
      { id: 'users', type: 'metric', title: 'Active Users', icon: 'Users', position: { x: 3, y: 0, w: 3, h: 2 } },
      { id: 'orders', type: 'metric', title: 'Orders', icon: 'ShoppingCart', position: { x: 6, y: 0, w: 3, h: 2 } },
      { id: 'trend', type: 'line-chart', title: 'Revenue Trend', position: { x: 0, y: 2, w: 6, h: 4 } },
      { id: 'breakdown', type: 'pie-chart', title: 'Sales Breakdown', position: { x: 6, y: 2, w: 6, h: 4 } },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: projectName,
      description: prompt,
      project_type: 'dashboard',
      prompt,
      ai_generated: true,
      status: 'generated',
      widgets: defaultWidgets,
      theme: { chartTheme, primaryColor: chartThemeOptions.find(t => t.value === chartTheme)?.color },
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Dashboard generated!');
      setProjects([data as DashboardProject, ...projects]);
      setGenerateDialog(false);
      setPrompt('');
      setProjectName('');
    }

    setGenerating(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this dashboard?')) return;
    const { error } = await supabase.from('builder_projects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const renderWidgetIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      BarChart3: <BarChart3 className="h-5 w-5" />,
      LineChart: <LineChart className="h-5 w-5" />,
      PieChart: <PieChart className="h-5 w-5" />,
      Activity: <Activity className="h-5 w-5" />,
      TrendingUp: <TrendingUp className="h-5 w-5" />,
      Grid3X3: <Grid3X3 className="h-5 w-5" />,
      DollarSign: <DollarSign className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
    };
    return icons[iconName] || <BarChart3 className="h-5 w-5" />;
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Dashboard Builder"
        description="Create data dashboards with AI-powered layouts"
        action={
          <Button onClick={() => setGenerateDialog(true)} className="gap-2 rounded-xl">
            <Wand2 className="h-4 w-4" />
            Generate Dashboard
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="projects" className="rounded-lg">My Dashboards</TabsTrigger>
          <TabsTrigger value="widgets" className="rounded-lg">Widgets</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-0">
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dashboards..." className="pl-9 rounded-xl" />
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No dashboards yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Generate your first dashboard with AI</p>
              <Button onClick={() => setGenerateDialog(true)} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card overflow-hidden premium-shadow group"
                >
                  <div className="h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                    <LayoutDashboard className="h-12 w-12 text-purple-500/50" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{project.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedProject(project); setEditDialog(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] capitalize">{project.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {project.widgets?.length || 0} widgets
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="mt-0">
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-3">Available Widgets</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {widgetTypes.map((widget, i) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                  {renderWidgetIcon(widget.icon)}
                </div>
                <h3 className="font-medium text-sm">{widget.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
                <Badge variant="outline" className="text-[10px] mt-2 capitalize">{widget.category}</Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Sales Dashboard', description: 'Track revenue, orders, and customer metrics', widgets: 8 },
              { name: 'Marketing Dashboard', description: 'Monitor campaigns, leads, and conversions', widgets: 6 },
              { name: 'HR Dashboard', description: 'Employee metrics, attendance, and performance', widgets: 7 },
              { name: 'Finance Dashboard', description: 'Cash flow, expenses, and financial KPIs', widgets: 9 },
            ].map((template, i) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card overflow-hidden premium-shadow group"
              >
                <div className="h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <LayoutDashboard className="h-8 w-8 text-purple-500/50" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground">{template.widgets} widgets</span>
                    <Button size="sm">Use Template</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Dashboard
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Dashboard Name</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Sales Analytics Dashboard" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chart Theme</label>
              <div className="grid grid-cols-6 gap-2">
                {chartThemeOptions.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setChartTheme(theme.value)}
                    className={cn(
                      'w-8 h-8 rounded-lg transition-all border-2',
                      chartTheme === theme.value ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: theme.color }}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Describe your dashboard</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A sales analytics dashboard with revenue trends, customer acquisition metrics, top products, and regional breakdown..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateDashboard} disabled={generating} className="gap-2">
              {generating ? (
                <>
                  <Wand2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Dashboard Name</label>
                <Input defaultValue={selectedProject.name} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Widgets</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {selectedProject.widgets?.map((widget: any, i: number) => (
                    <div key={widget.id || i} className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      {renderWidgetIcon(widget.icon)}
                      <span className="text-xs font-medium truncate">{widget.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
