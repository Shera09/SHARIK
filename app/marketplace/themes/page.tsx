'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Search,
  Star,
  Download,
  CheckCircle,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Eye,
  RotateCcw,
  Settings,
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

type Theme = {
  id: string;
  name: string;
  slug: string;
  description: string;
  developer_id: string;
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
  };
  typography: any;
  icons: any;
  layout_config: any;
  preview_url: string;
  thumbnail_url: string;
  price: number;
  is_free: boolean;
  is_verified: boolean;
  is_published: boolean;
  rating_average: number;
  rating_count: number;
  install_count: number;
  version: string;
  created_at: string;
};

type InstalledTheme = {
  id: string;
  theme_id: string;
  theme_name: string;
  is_active: boolean;
  installed_at: string;
};

export default function ThemeStorePage() {
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [installedThemes, setInstalledThemes] = useState<InstalledTheme[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [themesRes, installedRes] = await Promise.all([
      supabase.from('theme_listings').select('*').eq('is_published', true).order('install_count', { ascending: false }),
      supabase.from('installed_themes').select('id, theme_id, is_active, installed_at'),
    ]);

    if (themesRes.data) setThemes(themesRes.data);
    if (installedRes.data) {
      setInstalledThemes(installedRes.data.map(t => ({
        ...t,
        theme_name: themes.find(th => th.id === t.theme_id)?.name || 'Unknown',
      })));
      const active = installedRes.data.find(t => t.is_active);
      if (active) setActiveThemeId(active.theme_id);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const installTheme = async (theme: Theme) => {
    const { error } = await supabase.from('installed_themes').insert({
      theme_id: theme.id,
      is_active: false,
    });

    if (error) {
      if (error.code === '23505') {
        toast.info('Theme already installed');
      } else {
        toast.error(error.message);
      }
      return;
    }

    await supabase.from('theme_listings').update({
      install_count: (theme.install_count || 0) + 1,
    }).eq('id', theme.id);

    toast.success(`${theme.name} installed!`);
    loadData();
  };

  const activateTheme = async (theme: Theme) => {
    // Deactivate all themes first
    await supabase.from('installed_themes').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    // Activate selected theme
    const installed = installedThemes.find(t => t.theme_id === theme.id);
    if (installed) {
      await supabase.from('installed_themes').update({ is_active: true }).eq('id', installed.id);
    }

    setActiveThemeId(theme.id);
    toast.success(`${theme.name} activated!`);
    loadData();
  };

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(search.toLowerCase()) ||
    theme.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getThemePreviewStyle = (colors: Theme['colors']) => ({
    '--preview-primary': colors?.primary || '#10b981',
    '--preview-secondary': colors?.secondary || '#6366f1',
    '--preview-accent': colors?.accent || '#f59e0b',
    '--preview-bg': colors?.background || '#ffffff',
    '--preview-surface': colors?.surface || '#f8fafc',
  } as React.CSSProperties);

  return (
    <AppShell>
      <PageHeader
        title="Theme Store"
        description="Customize the look and feel of your platform"
      />

      {/* Current Theme */}
      {activeThemeId && (
        <div className="glass-card p-4 mb-6 premium-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(() => {
                const activeTheme = themes.find(t => t.id === activeThemeId);
                if (!activeTheme) return null;
                return (
                  <>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: activeTheme.colors?.primary || '#10b981' }}
                    >
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Theme</p>
                      <h3 className="font-semibold">{activeTheme.name}</h3>
                    </div>
                  </>
                );
              })()}
            </div>
            <Button variant="outline">Manage Themes</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search themes..."
          className="pl-9"
        />
      </div>

      {/* Theme Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Light
        </button>
        <button className="px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Dark
        </button>
        <button className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          All
        </button>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No themes found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredThemes.map((theme, i) => {
            const isInstalled = installedThemes.some(t => t.theme_id === theme.id);
            const isActive = activeThemeId === theme.id;

            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card overflow-hidden premium-shadow group hover:shadow-lg transition-all"
              >
                {/* Theme Preview */}
                <div
                  className="h-32 relative overflow-hidden"
                  style={{ backgroundColor: theme.colors?.background || '#ffffff' }}
                >
                  {/* Simulated UI elements */}
                  <div className="absolute inset-0 p-3">
                    <div
                      className="h-4 w-24 rounded mb-2"
                      style={{ backgroundColor: theme.colors?.primary || '#10b981' }}
                    />
                    <div className="flex gap-2 mb-2">
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: theme.colors?.surface || '#f8fafc' }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: theme.colors?.surface || '#f8fafc' }}
                      />
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: theme.colors?.surface || '#f8fafc' }}
                      />
                    </div>
                    <div
                      className="h-16 rounded-lg"
                      style={{ backgroundColor: theme.colors?.surface || '#f8fafc' }}
                    />
                  </div>

                  {/* Badges */}
                  {theme.is_free ? (
                    <Badge className="absolute top-2 right-2 bg-success/90">Free</Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-purple-500/90">${theme.price}</Badge>
                  )}
                  {isActive && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{theme.name}</h3>
                    {theme.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  </div>

                  {/* Color Palette Preview */}
                  <div className="flex gap-1.5 mb-3">
                    {theme.colors?.primary && (
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                    )}
                    {theme.colors?.secondary && (
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                    )}
                    {theme.colors?.accent && (
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    )}
                    {theme.colors?.background && (
                      <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.colors.background }} />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium">{theme.rating_average?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{theme.install_count || 0} installs</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setSelectedTheme(theme); setPreviewDialog(true); }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    {isInstalled ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={isActive}
                        onClick={() => activateTheme(theme)}
                      >
                        {isActive ? 'Active' : 'Activate'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => installTheme(theme)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Theme Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTheme?.name}
              {selectedTheme?.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
            </DialogTitle>
          </DialogHeader>
          {selectedTheme && (
            <div className="space-y-4">
              {/* Full Preview */}
              <div
                className="h-64 rounded-xl overflow-hidden relative"
                style={{ backgroundColor: selectedTheme.colors?.background || '#ffffff' }}
              >
                {/* Simulated full UI */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedTheme.colors?.primary || '#10b981' }}
                    >
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div
                        className="h-8 px-4 rounded-lg flex items-center"
                        style={{ backgroundColor: selectedTheme.colors?.surface || '#f8fafc' }}
                      >
                        <span style={{ color: selectedTheme.colors?.primary }} className="text-sm font-medium">Dashboard</span>
                      </div>
                      <div
                        className="h-8 px-4 rounded-lg flex items-center"
                        style={{ backgroundColor: selectedTheme.colors?.surface || '#f8fafc' }}
                      >
                        <span className="text-sm text-gray-500">Customers</span>
                      </div>
                      <div
                        className="h-8 px-4 rounded-lg flex items-center"
                        style={{ backgroundColor: selectedTheme.colors?.surface || '#f8fafc' }}
                      >
                        <span className="text-sm text-gray-500">Invoices</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-24 rounded-xl p-4"
                        style={{ backgroundColor: selectedTheme.colors?.surface || '#f8fafc' }}
                      >
                        <div
                          className="h-6 w-12 rounded mb-2"
                          style={{ backgroundColor: selectedTheme.colors?.primary || '#10b981' }}
                        />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>

                  <div
                    className="h-32 rounded-xl"
                    style={{ backgroundColor: selectedTheme.colors?.surface || '#f8fafc' }}
                  />
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <p className="text-sm font-medium mb-2">Color Palette</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(selectedTheme.colors || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: value as string }}
                      />
                      <div>
                        <p className="text-xs font-medium capitalize">{key}</p>
                        <p className="text-[10px] text-muted-foreground">{value as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                  <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                  <p className="font-bold">{selectedTheme.rating_average?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <Download className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold">{selectedTheme.install_count || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">
                    {selectedTheme.is_free ? 'Free' : `$${selectedTheme.price}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {installedThemes.some(t => t.theme_id === selectedTheme.id) ? (
                  <>
                    <Button
                      className="flex-1"
                      disabled={activeThemeId === selectedTheme.id}
                      onClick={() => activateTheme(selectedTheme)}
                    >
                      {activeThemeId === selectedTheme.id ? 'Currently Active' : 'Activate Theme'}
                    </Button>
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => { installTheme(selectedTheme); setPreviewDialog(false); }}
                  >
                    <Download className="h-4 w-4" />
                    {selectedTheme.is_free ? 'Install Free' : `Install $${selectedTheme.price}`}
                  </Button>
                )}
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
