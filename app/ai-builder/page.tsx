'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  Globe,
  LayoutDashboard,
  FormInput,
  AppWindow,
  FileBarChart,
  GitBranch,
  Store,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Search,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
  description: string;
  project_type: string;
  status: string;
  prompt: string;
  ai_generated: boolean;
  created_at: string;
  published_at: string;
};

const projectTypeConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  website: { label: 'Website', icon: Globe, color: 'text-blue-500' },
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, color: 'text-purple-500' },
  form: { label: 'Form', icon: FormInput, color: 'text-orange-500' },
  app: { label: 'App', icon: AppWindow, color: 'text-emerald-500' },
  report: { label: 'Report', icon: FileBarChart, color: 'text-cyan-500' },
  workflow: { label: 'Workflow', icon: GitBranch, color: 'text-pink-500' },
};

const examplePrompts = [
  "Build a GST Registration website with inquiry form",
  "Create a CRM for Real Estate agents",
  "Make an invoice management dashboard",
  "Create customer onboarding form",
  "Generate employee attendance system",
  "Design restaurant billing system",
  "Build hospital management dashboard",
  "Create loan application wizard",
  "Design school ERP system",
  "Make inventory tracking app",
];

export default function AIBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('builder_projects').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateProject = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGenerating(true);

    // Detect project type from prompt
    let projectType = 'website';
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('crm') || lowerPrompt.includes('erp') || lowerPrompt.includes('management system')) projectType = 'app';
    else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('analytics') || lowerPrompt.includes('reports')) projectType = 'dashboard';
    else if (lowerPrompt.includes('form') || lowerPrompt.includes('registration') || lowerPrompt.includes('application')) projectType = 'form';
    else if (lowerPrompt.includes('report') || lowerPrompt.includes('summary') || lowerPrompt.includes('statement')) projectType = 'report';
    else if (lowerPrompt.includes('workflow') || lowerPrompt.includes('automation') || lowerPrompt.includes('flow')) projectType = 'workflow';

    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2500));

    const { data, error } = await supabase.from('builder_projects').insert({
      name: prompt.split(' ').slice(0, 5).join(' '),
      description: prompt,
      project_type: projectType,
      prompt,
      ai_generated: true,
      status: 'generated',
      generation_status: 'completed',
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else if (data) {
      toast.success('Project generated!');
      setProjects([data as Project, ...projects]);
      setPrompt('');
    }

    setGenerating(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('builder_projects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.project_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: projects.length,
    websites: projects.filter(p => p.project_type === 'website').length,
    dashboards: projects.filter(p => p.project_type === 'dashboard').length,
    apps: projects.filter(p => p.project_type === 'app').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Builder"
        description="Create websites, dashboards, forms, and apps using natural language"
      />

      {/* AI Command Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 premium-shadow mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">AI Command Center</h2>
            <p className="text-sm text-muted-foreground">Describe what you want to build</p>
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Build a GST Registration website with inquiry form..."
            rows={3}
            className="rounded-xl resize-none"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Try:</span>
            {examplePrompts.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors truncate max-w-[200px]"
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={generateProject}
            disabled={generating || !prompt.trim()}
            className="gap-2 rounded-xl"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Projects', value: stats.total, icon: Wand2, color: 'text-primary' },
          { label: 'Websites', value: stats.websites, icon: Globe, color: 'text-blue-500' },
          { label: 'Dashboards', value: stats.dashboards, icon: LayoutDashboard, color: 'text-purple-500' },
          { label: 'Apps', value: stats.apps, icon: AppWindow, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Builder Links */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(projectTypeConfig).map(([key, config], i) => (
          <motion.a
            key={key}
            href={`/ai-builder/${key === 'website' ? 'website' : key === 'dashboard' ? 'dashboards' : key === 'form' ? 'forms' : key === 'app' ? 'apps' : key === 'report' ? 'reports' : 'workflows'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <config.icon className={cn('h-8 w-8 mx-auto mb-2', config.color)} />
            <p className="text-sm font-medium">{config.label} Builder</p>
          </motion.a>
        ))}
      </div>

      {/* Filter/Search */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'website', 'dashboard', 'app', 'form'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">Ask AI to build something for you</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((project, i) => {
              const config = projectTypeConfig[project.project_type] || projectTypeConfig.website;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card overflow-hidden premium-shadow group"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-muted', config.color)}>
                        <config.icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {project.ai_generated && (
                          <Badge className="bg-purple-500/10 text-purple-500 text-[9px]">
                            <Sparkles className="h-3 w-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                        <Badge className={cn(
                          project.status === 'published' ? 'bg-success/10 text-success' :
                          project.status === 'generated' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-muted'
                        )}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold line-clamp-1">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>

                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedProject(project); setPreviewOpen(true); }} className="flex-1 gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Download className="h-3 w-3" />
                        Export
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Original Prompt</p>
                <p className="text-sm">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize mt-1">{selectedProject.project_type}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize mt-1">{selectedProject.status}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p className="font-medium mt-1">
                    {selectedProject.ai_generated ? <CheckCircle className="h-5 w-5 text-success mx-auto" /> : 'Manual'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download Code
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  Open in Editor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
