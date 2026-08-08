'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppWindow,
  Wand2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Layers,
  Settings,
  Database,
  Shield,
  Palette,
  Code,
  Save,
  Globe,
  Zap,
  Users,
  FileCode,
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

type AppProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  screens: any[];
  features: any[];
  tech_stack: string[];
  created_at: string;
};

type AppTemplate = {
  id: string;
  name: string;
  type: string;
  description: string;
  screens: string[];
  features: string[];
};

type ScreenType = {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
};

const screenTypes: ScreenType[] = [
  { id: 'list', name: 'List View', icon: 'Layers', category: 'data', description: 'Display items in a list' },
  { id: 'detail', name: 'Detail View', icon: 'Eye', category: 'data', description: 'Single item details' },
  { id: 'form', name: 'Form Screen', icon: 'FileCode', category: 'input', description: 'Data entry form' },
  { id: 'dashboard', name: 'Dashboard', icon: 'Monitor', category: 'analytics', description: 'Analytics overview' },
  { id: 'auth', name: 'Authentication', icon: 'Shield', category: 'auth', description: 'Login/signup screens' },
  { id: 'settings', name: 'Settings', icon: 'Settings', category: 'system', description: 'App settings' },
  { id: 'profile', name: 'Profile', icon: 'Users', category: 'user', description: 'User profile' },
  { id: 'wizard', name: 'Wizard', icon: 'Zap', category: 'flow', description: 'Multi-step flow' },
];

const appTemplates: AppTemplate[] = [
  { id: 'crm', name: 'CRM App', type: 'business', description: 'Customer relationship management', screens: ['list', 'detail', 'form'], features: ['Contacts', 'Deals', 'Tasks'] },
  { id: 'inventory', name: 'Inventory App', type: 'operations', description: 'Stock and inventory management', screens: ['list', 'detail', 'dashboard'], features: ['Products', 'Stock Levels', 'Alerts'] },
  { id: 'booking', name: 'Booking App', type: 'service', description: 'Appointment booking system', screens: ['list', 'form', 'wizard'], features: ['Calendar', 'Slots', 'Payments'] },
  { id: 'delivery', name: 'Delivery App', type: 'logistics', description: 'Delivery tracking system', screens: ['list', 'detail', 'dashboard'], features: ['Orders', 'Tracking', 'Drivers'] },
];

const techStackOptions = [
  { value: 'react', label: 'React Native', icon: 'Code' },
  { value: 'flutter', label: 'Flutter', icon: 'Smartphone' },
  { value: 'nextjs', label: 'Next.js PWA', icon: 'Globe' },
  { value: 'electron', label: 'Electron', icon: 'Monitor' },
];

export default function AppBuilderPage() {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [appType, setAppType] = useState('mobile');
  const [techStack, setTechStack] = useState('react');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<AppProject | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('project_type', 'app')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateApp = async () => {
    if (!projectName.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }

    setGenerating(true);

    await new Promise(r => setTimeout(r, 3500));

    const defaultScreens = [
      { id: 'home', name: 'Home', type: 'dashboard', isRoot: true },
      { id: 'list', name: 'Items List', type: 'list', isRoot: false },
      { id: 'detail', name: 'Item Detail', type: 'detail', isRoot: false },
      { id: 'form', name: 'New Item', type: 'form', isRoot: false },
      { id: 'settings', name: 'Settings', type: 'settings', isRoot: false },
    ];

    const defaultFeatures = [
      { id: 'auth', name: 'Authentication', enabled: true },
      { id: 'offline', name: 'Offline Support', enabled: true },
      { id: 'push', name: 'Push Notifications', enabled: false },
      { id: 'analytics', name: 'Analytics', enabled: true },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: projectName,
      description: prompt,
      project_type: 'app',
      prompt,
      ai_generated: true,
      status: 'generated',
      screens: defaultScreens,
      features: defaultFeatures,
      tech_stack: [techStack],
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('App generated!');
      setProjects([data as AppProject, ...projects]);
      setGenerateDialog(false);
      setPrompt('');
      setProjectName('');
    }

    setGenerating(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this app project?')) return;
    const { error } = await supabase.from('builder_projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const installTemplate = async (template: AppTemplate) => {
    const screens = template.screens.map((type, i) => ({
      id: `screen-${i}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      isRoot: i === 0,
    }));

    const { error } = await supabase.from('builder_projects').insert({
      name: `${template.name} Project`,
      description: template.description,
      project_type: 'app',
      ai_generated: false,
      status: 'draft',
      screens,
      features: template.features.map((f, i) => ({ id: `feat-${i}`, name: f, enabled: true })),
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Template installed');
      loadData();
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const renderScreenIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Layers: <Layers className="h-5 w-5" />,
      Eye: <Eye className="h-5 w-5" />,
      FileCode: <FileCode className="h-5 w-5" />,
      Monitor: <Monitor className="h-5 w-5" />,
      Shield: <Shield className="h-5 w-5" />,
      Settings: <Settings className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
      Zap: <Zap className="h-5 w-5" />,
    };
    return icons[iconName] || <Layers className="h-5 w-5" />;
  };

  return (
    <AppShell>
      <PageHeader
        title="AI App Builder"
        description="Build mobile and web apps with AI assistance"
        action={
          <Button onClick={() => setGenerateDialog(true)} className="gap-2 rounded-xl">
            <Wand2 className="h-4 w-4" />
            Generate App
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="projects" className="rounded-lg">My Apps</TabsTrigger>
          <TabsTrigger value="screens" className="rounded-lg">Screens</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
          <TabsTrigger value="features" className="rounded-lg">Features</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-0">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search apps..." className="pl-9 rounded-xl" />
            </div>
            <div className="flex gap-1.5">
              {['all', 'mobile', 'web', 'desktop'].map((type) => (
                <button
                  key={type}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize bg-muted hover:bg-muted/80"
                >
                  {type}
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
              <AppWindow className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No apps yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Generate your first app with AI</p>
              <Button onClick={() => setGenerateDialog(true)} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate App
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
                  <div className="h-32 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center">
                    <AppWindow className="h-12 w-12 text-emerald-500/50" />
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
                        {project.screens?.length || 0} screens
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Screens Tab */}
        <TabsContent value="screens" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {screenTypes.map((screen, i) => (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  {renderScreenIcon(screen.icon)}
                </div>
                <h3 className="font-medium text-sm">{screen.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{screen.description}</p>
                <Badge variant="outline" className="text-[10px] mt-2 capitalize">{screen.category}</Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {appTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card overflow-hidden premium-shadow group"
              >
                <div className="h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                  <AppWindow className="h-8 w-8 text-emerald-500/50" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.features.slice(0, 3).map((f) => (
                      <Badge key={f} variant="outline" className="text-[9px]">{f}</Badge>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => installTemplate(template)} className="w-full">
                    Use Template
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Authentication', icon: Shield, description: 'Login, signup, password reset' },
              { name: 'Push Notifications', icon: Zap, description: 'Real-time alerts' },
              { name: 'Offline Support', icon: Database, description: 'Work without internet' },
              { name: 'Analytics', icon: Monitor, description: 'Track user behavior' },
              { name: 'File Storage', icon: Database, description: 'Upload and manage files' },
              { name: 'User Profiles', icon: Users, description: 'Account management' },
              { name: 'Payment Integration', icon: Globe, description: 'Accept payments' },
              { name: 'API Integration', icon: Code, description: 'Connect external services' },
            ].map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium text-sm">{feature.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
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
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Generate App
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">App Name</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My CRM App" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">App Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mobile', label: 'Mobile', icon: Smartphone },
                  { value: 'web', label: 'Web App', icon: Globe },
                  { value: 'desktop', label: 'Desktop', icon: Monitor },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAppType(type.value)}
                    className={cn(
                      'p-3 rounded-xl border transition-all flex flex-col items-center gap-2',
                      appType === type.value ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <type.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tech Stack</label>
              <select
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {techStackOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Describe your app</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A customer relationship management app with contact list, deal pipeline, task management, and reporting dashboard..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateApp} disabled={generating} className="gap-2">
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Screens</p>
                  <p className="font-medium mt-1">{selectedProject.screens?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Features</p>
                  <p className="font-medium mt-1">{selectedProject.features?.length || 0}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium">App Screens</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProject.screens?.map((screen: any, i: number) => (
                    <div key={screen.id || i} className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium truncate">{screen.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Export Code
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Edit className="h-4 w-4" />
                  Edit App
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
