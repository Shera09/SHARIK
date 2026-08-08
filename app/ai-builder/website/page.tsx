'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Wand2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Sparkles,
  LayoutDashboard,
  Image,
  Type,
  Square,
  MousePointer,
  Undo,
  Redo,
  Save,
  Settings,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  Play,
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

type WebsiteProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  pages: any[];
  theme: any;
  created_at: string;
};

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnail_url: string;
  is_free: boolean;
  is_featured: boolean;
};

type ComponentDef = {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
  description: string;
};

const categoryOptions = [
  { value: 'business', label: 'Business' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'agency', label: 'Agency' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'finance', label: 'Finance' },
];

export default function WebsiteBuilderPage() {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [components, setComponents] = useState<ComponentDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('business');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);

    const [projectsRes, templatesRes, componentsRes] = await Promise.all([
      supabase.from('builder_projects').select('*').eq('project_type', 'website').is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
      supabase.from('builder_templates').select('*').eq('project_type', 'website').eq('is_active', true).is('deleted_at', null).limit(12),
      supabase.from('builder_components').select('*').eq('is_active', true).is('deleted_at', null).limit(20),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
    if (componentsRes.data) setComponents(componentsRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateWebsite = async () => {
    if (!projectName.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }

    setGenerating(true);

    // Simulate AI generation
    await new Promise(r => setTimeout(r, 3000));

    const defaultPages = [
      { id: 'home', name: 'Home', sections: ['hero', 'features', 'testimonials', 'cta'] },
      { id: 'about', name: 'About', sections: ['content', 'team'] },
      { id: 'contact', name: 'Contact', sections: ['contact-form', 'map'] },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: projectName,
      description: prompt,
      project_type: 'website',
      prompt,
      ai_generated: true,
      status: 'generated',
      pages: defaultPages,
      theme: { primaryColor: '#10B981', secondaryColor: '#6366F1' },
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Website generated!');
      setProjects([data as WebsiteProject, ...projects]);
      setGenerateDialog(false);
      setPrompt('');
      setProjectName('');
    }

    setGenerating(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this website?')) return;
    const { error } = await supabase.from('builder_projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const installTemplate = async (template: Template) => {
    const { error } = await supabase.from('builder_projects').insert({
      name: `${template.name} Website`,
      description: template.description,
      project_type: 'website',
      ai_generated: false,
      status: 'draft',
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Template installed');
      loadData();
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageHeader
        title="AI Website Builder"
        description="Create responsive websites with AI assistance"
        action={
          <Button onClick={() => setGenerateDialog(true)} className="gap-2 rounded-xl">
            <Wand2 className="h-4 w-4" />
            Generate Website
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="projects" className="rounded-lg">My Websites</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
          <TabsTrigger value="components" className="rounded-lg">Components</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-0">
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search websites..." className="pl-9 rounded-xl" />
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No websites yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Generate your first website with AI</p>
              <Button onClick={() => setGenerateDialog(true)} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Website
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
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-primary/50" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{project.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] capitalize">{project.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {project.pages?.length || 0} pages
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card overflow-hidden premium-shadow group"
              >
                <div className="h-28 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  <LayoutDashboard className="h-10 w-10 text-blue-500/50" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                    {template.is_featured && <Badge className="bg-primary/10 text-primary text-[9px]">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">{template.category}</Badge>
                    <Button size="sm" onClick={() => installTemplate(template)} disabled={loading}>
                      Use Template
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {components.map((comp, i) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <Square className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="font-medium text-sm">{comp.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comp.description}</p>
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
              Generate Website
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Website Name</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Business Website" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Describe your website</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A professional GST consultant website with inquiry form, services section, testimonials, and WhatsApp integration..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateWebsite} disabled={generating} className="gap-2">
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
    </AppShell>
  );
}
