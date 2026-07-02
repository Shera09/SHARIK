'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FormInput,
  Wand2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  CheckSquare,
  Mail,
  Phone,
  User,
  FileText,
  List,
  Calendar,
  Clock,
  ToggleLeft,
  Hash,
  DollarSign,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type FormBuilder = {
  id: string;
  name: string;
  slug: string;
  fields: FormField[];
  submissions_count: number;
  is_active: boolean;
  created_at: string;
};

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
};

const fieldTypeConfig: Record<string, { label: string; icon: typeof User; color: string }> = {
  text: { label: 'Text', icon: FileText, color: 'text-blue-500' },
  email: { label: 'Email', icon: Mail, color: 'text-emerald-500' },
  phone: { label: 'Phone', icon: Phone, color: 'text-purple-500' },
  number: { label: 'Number', icon: Hash, color: 'text-orange-500' },
  textarea: { label: 'Textarea', icon: FileText, color: 'text-cyan-500' },
  select: { label: 'Dropdown', icon: List, color: 'text-pink-500' },
  checkbox: { label: 'Checkbox', icon: CheckSquare, color: 'text-success' },
  date: { label: 'Date', icon: Calendar, color: 'text-yellow-500' },
  time: { label: 'Time', icon: Clock, color: 'text-red-500' },
  currency: { label: 'Currency', icon: DollarSign, color: 'text-green-500' },
};

const examplePrompts = [
  'GST Registration Form with PAN, Aadhaar, and business details',
  'Customer feedback form with rating and comments',
  'Job application form with resume upload',
  'Loan application with income and employment details',
  'Event registration with ticket selection',
  'Support ticket form with priority',
];

export default function FormBuilderPage() {
  const [forms, setForms] = useState<FormBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiDialog, setAiDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<FormBuilder | null>(null);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('builder_forms').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setForms(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateForm = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your form');
      return;
    }

    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));

    const generatedFields: FormField[] = [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', required: true },
    ];

    const name = prompt.split(' ').slice(0, 4).join(' ');
    setFormName(name);
    setFields(generatedFields);
    setAiDialog(false);
    setDialogOpen(true);
    setGenerating(false);
  };

  const saveForm = async () => {
    if (!formName.trim()) {
      toast.error('Form name is required');
      return;
    }
    if (fields.length === 0) {
      toast.error('Add at least one field');
      return;
    }

    setSaving(true);
    const slug = formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { error } = await supabase.from('builder_forms').insert({
      name: formName,
      slug,
      fields,
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Form created');
      setDialogOpen(false);
      setFormName('');
      setFields([]);
      loadData();
    }
    setSaving(false);
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Delete this form?')) return;
    const { error } = await supabase.from('builder_forms').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setForms(forms.filter(f => f.id !== id));
    }
  };

  const toggleActive = async (form: FormBuilder) => {
    const { error } = await supabase.from('builder_forms').update({ is_active: !form.is_active }).eq('id', form.id);
    if (error) toast.error(error.message);
    else {
      toast.success(form.is_active ? 'Form deactivated' : 'Form activated');
      loadData();
    }
  };

  const filtered = forms.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageHeader
        title="AI Form Builder"
        description="Create forms with AI assistance - no coding required"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setAiDialog(true)} variant="outline" className="gap-2 rounded-xl">
              <Wand2 className="h-4 w-4" />
              Generate with AI
            </Button>
            <Button onClick={() => { setEditing(null); setFields([]); setFormName(''); setDialogOpen(true); }} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              New Form
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Forms', value: forms.length, icon: FormInput, color: 'text-blue-500' },
          { label: 'Active', value: forms.filter(f => f.is_active).length, icon: CheckSquare, color: 'text-success' },
          { label: 'Total Submissions', value: forms.reduce((sum, f) => sum + f.submissions_count, 0), icon: Mail, color: 'text-purple-500' },
          { label: 'Avg Fields', value: forms.length > 0 ? Math.round(forms.reduce((sum, f) => sum + f.fields.length, 0) / forms.length) : 0, icon: List, color: 'text-orange-500' },
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

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search forms..." className="pl-9 rounded-xl" />
        </div>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No forms yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first form with AI</p>
          <Button onClick={() => setAiDialog(true)} className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Form
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((form, i) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card overflow-hidden premium-shadow group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FormInput className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_active} onCheckedChange={() => toggleActive(form)} className="scale-75" />
                    <Badge variant="outline" className="text-[10px]">{form.submissions_count} submissions</Badge>
                  </div>
                </div>

                <h3 className="font-semibold line-clamp-1">{form.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{form.fields?.length || 0} fields</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {(form.fields || []).slice(0, 4).map((field: FormField) => {
                    const config = fieldTypeConfig[field.type] || fieldTypeConfig.text;
                    const IconComponent = config.icon;
                    return (
                      <Badge key={field.id} variant="secondary" className="text-[9px] gap-1">
                        <IconComponent className="h-2.5 w-2.5" />
                        {field.label}
                      </Badge>
                    );
                  })}
                  {(form.fields?.length || 0) > 4 && (
                    <Badge variant="secondary" className="text-[9px]">+{form.fields.length - 4} more</Badge>
                  )}
                </div>

                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    <Copy className="h-3 w-3" />
                    Embed
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteForm(form.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Generate Dialog */}
      <Dialog open={aiDialog} onOpenChange={setAiDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Form with AI
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the form you need..."
              rows={4}
              className="rounded-xl"
            />
            <div className="flex flex-wrap gap-2">
              {examplePrompts.slice(0, 4).map((p) => (
                <button key={p} onClick={() => setPrompt(p)} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors truncate max-w-[200px]">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialog(false)}>Cancel</Button>
            <Button onClick={generateForm} disabled={generating} className="gap-2">
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

      {/* Form Builder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Form' : 'Create Form'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Form Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contact Form" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fields ({fields.length})</Label>
                <Button onClick={addField} size="sm" variant="outline" className="gap-1">
                  <Plus className="h-3 w-3" />
                  Add Field
                </Button>
              </div>

              {fields.map((field, i) => {
                const config = fieldTypeConfig[field.type] || fieldTypeConfig.text;
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-border/40 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v })}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(fieldTypeConfig).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <cfg.icon className={cn('h-3.5 w-3.5', cfg.color)} />
                                {cfg.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} placeholder="Label" className="flex-1" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch checked={field.required} onCheckedChange={(v) => updateField(field.id, { required: v })} className="scale-75" />
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeField(field.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input value={field.placeholder} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} placeholder="Placeholder (optional)" className="text-sm" />
                  </motion.div>
                );
              })}

              {fields.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-xl">
                  <p className="text-sm text-muted-foreground">No fields yet. Add your first field or generate with AI.</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveForm} disabled={saving} className="gap-2">
              {saving ? 'Saving...' : 'Save Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
