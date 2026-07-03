'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Star,
  Download,
  Copy,
  Eye,
  Share2,
  Filter,
  File,
  Mail,
  MessageSquare,
  BarChart3,
  FileBarChart,
  LayoutDashboard,
  Workflow,
  Users,
  DollarSign,
  FileCheck,
  Globe,
  CheckCircle,
  Sparkles,
  Crown,
  Edit,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  template_type: string;
  content: any;
  variables: string[];
  preview_data: any;
  is_public: boolean;
  is_premium: boolean;
  price: number;
  creator_id: string;
  icon_url: string;
  use_count: number;
  rating_average: number;
  rating_count: number;
  tags: string[];
  created_at: string;
};

const templateTypeIcons: Record<string, typeof File> = {
  invoice: DollarSign,
  quotation: FileText,
  email: Mail,
  whatsapp: MessageSquare,
  report: FileBarChart,
  landing_page: Globe,
  dashboard: LayoutDashboard,
  form: FileCheck,
  workflow: Workflow,
  automation: Workflow,
  knowledge: FileText,
  contract: FileCheck,
  letter: FileText,
};

const templateTypeLabels: Record<string, string> = {
  invoice: 'Invoices',
  quotation: 'Quotations',
  email: 'Emails',
  whatsapp: 'WhatsApp',
  report: 'Reports',
  landing_page: 'Landing Pages',
  dashboard: 'Dashboards',
  form: 'Forms',
  workflow: 'Workflows',
  automation: 'Automations',
  knowledge: 'Knowledge Base',
  contract: 'Contracts',
  letter: 'Letters',
};

export default function TemplateLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('template_listings')
      .select('*')
      .eq('is_public', true)
      .order('use_count', { ascending: false })
      .limit(50);

    if (data) setTemplates(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const useTemplate = async (template: Template) => {
    const { error } = await supabase.from('cloned_templates').insert({
      template_id: template.id,
      name: `My ${template.name}`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.from('template_listings').update({
      use_count: (template.use_count || 0) + 1,
    }).eq('id', template.id);

    toast.success(`Template added to your library!`);
    loadData();
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                          template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || template.template_type === selectedType;
    return matchesSearch && matchesType;
  });

  const templateTypes = Array.from(new Set(templates.map(t => t.template_type).filter(Boolean)));

  return (
    <AppShell>
      <PageHeader
        title="Template Library"
        description="Reusable templates for your business operations"
        action={
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Create Template
          </Button>
        }
      />

      {/* Type Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              selectedType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            )}
          >
            <FileText className="h-4 w-4" />
            All Templates
          </button>
          {templateTypes.map((type) => {
            const Icon = templateTypeIcons[type] || FileText;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  selectedType === type ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
              >
                <Icon className="h-4 w-4" />
                {templateTypeLabels[type] || type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="pl-9"
        />
      </div>

      {/* Premium Banner */}
      <div className="glass-card p-6 mb-6 premium-shadow bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Crown className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Premium Templates</h3>
            <p className="text-sm text-muted-foreground">Access 500+ professional templates with pro subscription</p>
          </div>
          <Button>Upgrade to Pro</Button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template, i) => {
            const Icon = templateTypeIcons[template.template_type] || FileText;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card overflow-hidden premium-shadow group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => { setSelectedTemplate(template); setPreviewDialog(true); }}
              >
                <div className="h-28 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center relative">
                  <Icon className="h-10 w-10 text-cyan-500/50" />
                  {template.is_premium && template.price > 0 ? (
                    <Badge className="absolute top-2 right-2 bg-purple-500/90">${template.price}</Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-success/90">Free</Badge>
                  )}
                  <Badge variant="outline" className="absolute bottom-2 left-2 text-[10px] capitalize">
                    {template.template_type}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.variables?.slice(0, 3).map((v: string) => (
                      <Badge key={v} variant="outline" className="text-[9px]">{'{{' + v + '}}'}</Badge>
                    ))}
                    {template.variables?.length > 3 && (
                      <Badge variant="outline" className="text-[9px]">+{template.variables.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium">{template.rating_average?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{template.use_count || 0} uses</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              <Badge variant="outline" className="capitalize">{selectedTemplate?.template_type}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>

              {/* Template Variables */}
              <div>
                <p className="text-sm font-medium mb-2">Variables</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables?.map((v: string) => (
                    <Badge key={v} variant="secondary">{'{{' + v + '}}'}</Badge>
                  ))}
                </div>
              </div>

              {/* Template Content Preview */}
              <div>
                <p className="text-sm font-medium mb-2">Content Structure</p>
                <pre className="p-4 rounded-lg bg-muted text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedTemplate.content, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                  <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                  <p className="font-bold">{selectedTemplate.rating_average?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <Download className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold">{selectedTemplate.use_count || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">
                    {selectedTemplate.is_premium && selectedTemplate.price > 0 ? `$${selectedTemplate.price}` : 'Free'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => { useTemplate(selectedTemplate); setPreviewDialog(false); }}
                >
                  <Copy className="h-4 w-4" />
                  Use Template
                </Button>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Customize
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
