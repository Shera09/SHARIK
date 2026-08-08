'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Pencil,
  Trash2,
  Tag,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
};

const categories = ['General', 'Sales', 'Operations', 'Finance', 'HR', 'Technical', 'Policy'];

const categoryColors: Record<string, string> = {
  General: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Sales: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Operations: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Finance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  HR: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Technical: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  Policy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const emptyForm = {
  title: '',
  content: '',
  category: 'General',
  tags: '',
  status: 'published',
};

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewArticle, setViewArticle] = useState<Article | null>(null);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    if (!error) setArticles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      (a.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title,
      category: a.category,
      content: a.content,
      tags: (a.tags || []).join(', '),
      status: a.status || 'published',
    });
    setDialogOpen(true);
  };

  const openView = async (a: Article) => {
    setViewArticle(a);
    await supabase.from('knowledge_base').update({ views: (a.views || 0) + 1 }).eq('id', a.id);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: form.status,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from('knowledge_base').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Article updated');
      } else {
        const { error } = await supabase.from('knowledge_base').insert({ ...payload, views: 0 });
        if (error) throw error;
        toast.success('Article created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (a: Article) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const { error } = await supabase.from('knowledge_base').update({ deleted_at: new Date().toISOString() }).eq('id', a.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Article deleted');
    load();
  };

  const categoryCount = (cat: string) =>
    articles.filter((a) => a.category === cat).length;

  return (
    <AppShell>
      <PageHeader
        title="Knowledge Base"
        description="Company SOPs, guides, and reference articles"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        }
      />

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            categoryFilter === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
          )}
        >
          All ({articles.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? 'all' : cat)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              categoryFilter === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat} ({categoryCount(cat)})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles, tags..."
          className="h-9 rounded-xl pl-9"
        />
      </div>

      {/* Articles grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">
            {search || categoryFilter !== 'all' ? 'No articles match your filters' : 'No articles yet'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {!search && categoryFilter === 'all' ? 'Create your first knowledge base article' : 'Try adjusting your search'}
          </p>
          {!search && categoryFilter === 'all' && (
            <Button onClick={openAdd} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="group glass-card cursor-pointer p-4 premium-shadow transition-shadow hover:shadow-lg"
                onClick={() => openView(a)}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge className={cn('shrink-0 text-[10px]', categoryColors[a.category] || categoryColors.General)}>
                    {a.category}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(a)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => remove(a)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold leading-snug line-clamp-2">{a.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{a.content}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(a.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {a.views || 0} views
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {new Date(a.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Article Modal */}
      <AnimatePresence>
        {viewArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-16"
            onClick={() => setViewArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewArticle(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <Badge className={cn('text-xs', categoryColors[viewArticle.category] || categoryColors.General)}>
                {viewArticle.category}
              </Badge>
              <h2 className="mt-3 font-display text-xl font-bold">{viewArticle.title}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(viewArticle.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {viewArticle.views || 0} views
                </span>
              </div>
              <div className="mt-5 border-t border-border pt-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{viewArticle.content}</p>
              </div>
              {(viewArticle.tags || []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {(viewArticle.tags || []).map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="sop, onboarding, billing" />
            </div>
            <div className="grid gap-2">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the article content here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Publish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
