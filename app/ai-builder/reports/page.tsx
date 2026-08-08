'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart,
  Wand2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  Table,
  PieChart,
  BarChart3,
  LineChart,
  Calendar,
  Download,
  Printer,
  Mail,
  Settings,
  Save,
  LayoutGrid,
  Clock,
  Filter,
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

type ReportProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  sections: any[];
  schedule: any;
  created_at: string;
};

type ReportSection = {
  id: string;
  name: string;
  type: string;
  data_source: string;
  chart_type?: string;
};

type ReportTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: string[];
};

const sectionTypes = [
  { id: 'header', name: 'Header', icon: 'FileText', description: 'Title and date range' },
  { id: 'summary', name: 'Executive Summary', icon: 'FileBarChart', description: 'Key metrics overview' },
  { id: 'table', name: 'Data Table', icon: 'Table', description: 'Tabular data display' },
  { id: 'bar-chart', name: 'Bar Chart', icon: 'BarChart3', description: 'Comparative analysis' },
  { id: 'line-chart', name: 'Line Chart', icon: 'LineChart', description: 'Trend analysis' },
  { id: 'pie-chart', name: 'Pie Chart', icon: 'PieChart', description: 'Distribution view' },
  { id: 'kpi', name: 'KPI Cards', icon: 'LayoutGrid', description: 'Key performance indicators' },
  { id: 'text', name: 'Text Block', icon: 'FileText', description: 'Custom text content' },
];

const scheduleOptions = [
  { value: 'none', label: 'No Schedule', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Clock },
  { value: 'weekly', label: 'Weekly', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: Calendar },
];

const dataSourceOptions = [
  { value: 'sales', label: 'Sales Data' },
  { value: 'finance', label: 'Financial Data' },
  { value: 'customers', label: 'Customer Data' },
  { value: 'inventory', label: 'Inventory Data' },
  { value: 'employees', label: 'HR Data' },
  { value: 'marketing', label: 'Marketing Data' },
];

const reportTemplates: ReportTemplate[] = [
  { id: 'sales', name: 'Sales Report', category: 'sales', description: 'Revenue and sales performance', sections: ['header', 'summary', 'kpi', 'line-chart', 'table'] },
  { id: 'financial', name: 'Financial Statement', category: 'finance', description: 'P&L and balance sheet', sections: ['header', 'summary', 'table', 'bar-chart', 'table'] },
  { id: 'customer', name: 'Customer Report', category: 'crm', description: 'Customer analytics and insights', sections: ['header', 'kpi', 'pie-chart', 'table'] },
  { id: 'inventory', name: 'Inventory Report', category: 'operations', description: 'Stock levels and movements', sections: ['header', 'table', 'bar-chart', 'kpi'] },
];

export default function ReportBuilderPage() {
  const [projects, setProjects] = useState<ReportProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [reportType, setReportType] = useState('operational');
  const [dataSource, setDataSource] = useState('sales');
  const [schedule, setSchedule] = useState('none');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<ReportProject | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('project_type', 'report')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReport = async () => {
    if (!projectName.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }

    setGenerating(true);

    await new Promise(r => setTimeout(r, 2500));

    const defaultSections = [
      { id: 'header', name: 'Report Header', type: 'header', data_source: null },
      { id: 'summary', name: 'Executive Summary', type: 'summary', data_source: dataSource },
      { id: 'kpi', name: 'Key Metrics', type: 'kpi', data_source: dataSource },
      { id: 'chart', name: 'Trend Analysis', type: 'line-chart', data_source: dataSource },
      { id: 'table', name: 'Detailed Data', type: 'table', data_source: dataSource },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: projectName,
      description: prompt,
      project_type: 'report',
      prompt,
      ai_generated: true,
      status: 'generated',
      sections: defaultSections,
      schedule: { frequency: schedule, lastRun: null, nextRun: null },
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Report template generated!');
      setProjects([data as ReportProject, ...projects]);
      setGenerateDialog(false);
      setPrompt('');
      setProjectName('');
    }

    setGenerating(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    const { error } = await supabase.from('builder_projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const installTemplate = async (template: ReportTemplate) => {
    const sections = template.sections.map((type, i) => ({
      id: `section-${i}`,
      name: sectionTypes.find(s => s.id === type)?.name || type,
      type,
      data_source: dataSource,
    }));

    const { error } = await supabase.from('builder_projects').insert({
      name: `${template.name} Template`,
      description: template.description,
      project_type: 'report',
      ai_generated: false,
      status: 'draft',
      sections,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Template installed');
      loadData();
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const renderSectionIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      FileText: <FileText className="h-5 w-5" />,
      FileBarChart: <FileBarChart className="h-5 w-5" />,
      Table: <Table className="h-5 w-5" />,
      BarChart3: <BarChart3 className="h-5 w-5" />,
      LineChart: <LineChart className="h-5 w-5" />,
      PieChart: <PieChart className="h-5 w-5" />,
      LayoutGrid: <LayoutGrid className="h-5 w-5" />,
    };
    return icons[iconName] || <FileText className="h-5 w-5" />;
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Report Builder"
        description="Create professional reports with AI-powered design"
        action={
          <Button onClick={() => setGenerateDialog(true)} className="gap-2 rounded-xl">
            <Wand2 className="h-4 w-4" />
            Generate Report
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="projects" className="rounded-lg">My Reports</TabsTrigger>
          <TabsTrigger value="sections" className="rounded-lg">Sections</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-0">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="pl-9 rounded-xl" />
            </div>
            <div className="flex gap-1.5">
              {['all', 'generated', 'scheduled', 'draft'].map((status) => (
                <button
                  key={status}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize bg-muted hover:bg-muted/80"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No reports yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Generate your first report with AI</p>
              <Button onClick={() => setGenerateDialog(true)} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Report
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
                  <div className="h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                    <FileBarChart className="h-12 w-12 text-cyan-500/50" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{project.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedProject(project); setPreviewDialog(true); }}>
                          <Eye className="h-3.5 w-3.5" />
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
                        {project.sections?.length || 0} sections
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectionTypes.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 transition-colors">
                  {renderSectionIcon(section.icon)}
                </div>
                <h3 className="font-medium text-sm">{section.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card overflow-hidden premium-shadow group"
              >
                <div className="h-24 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 flex items-center justify-center">
                  <FileBarChart className="h-8 w-8 text-cyan-500/50" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">{template.category}</Badge>
                    <Button size="sm" onClick={() => installTemplate(template)}>
                      Use
                    </Button>
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
              <Sparkles className="h-5 w-5 text-cyan-500" />
              Generate Report
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Report Name</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Monthly Sales Report" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="operational">Operational Report</option>
                <option value="financial">Financial Report</option>
                <option value="analytical">Analytical Report</option>
                <option value="compliance">Compliance Report</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data Source</label>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {dataSourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Schedule</label>
              <div className="grid grid-cols-4 gap-2">
                {scheduleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSchedule(opt.value)}
                    className={cn(
                      'p-2 rounded-lg border text-xs font-medium transition-all',
                      schedule === opt.value ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Describe your report</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A monthly sales report showing revenue trends, top products, regional performance, and customer acquisition metrics..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateReport} disabled={generating} className="gap-2">
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

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Sections</p>
                  <p className="font-medium mt-1">{selectedProject.sections?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Schedule</p>
                  <p className="font-medium mt-1 capitalize">{selectedProject.schedule?.frequency || 'None'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium mt-1 capitalize">{selectedProject.status}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium">Report Structure</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProject.sections?.map((section: any, i: number) => (
                    <div key={section.id || i} className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium truncate">{section.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
