'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Brain,
  User,
  Users,
  Building2,
  Database,
  MessageSquare,
  Clock,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  Trash2,
  Key,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

type MemoryLayer = {
  id: string;
  name: string;
  layer_type: string;
  description: string;
  retention_days: number;
  max_entries: number;
  is_active: boolean;
};

type SessionMemory = {
  id: string;
  session_id: string;
  key: string;
  value: any;
  importance_score: number;
  access_count: number;
  last_accessed_at: string;
  created_at: string;
};

type UserMemory = {
  id: string;
  user_id: string;
  key: string;
  value: any;
  memory_type: string;
  importance_score: number;
  is_confirmed: boolean;
  created_at: string;
};

export default function MemoryEnginePage() {
  const [loading, setLoading] = useState(true);
  const [layers, setLayers] = useState<MemoryLayer[]>([]);
  const [sessionMemories, setSessionMemories] = useState<SessionMemory[]>([]);
  const [userMemories, setUserMemories] = useState<UserMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [layersRes, sessionRes, userRes] = await Promise.all([
      supabase.from('ai_memory_layers').select('*').order('name'),
      supabase.from('session_memories').select('*').limit(20),
      supabase.from('user_memories').select('*').limit(20),
    ]);

    if (layersRes.data) setLayers(layersRes.data);
    if (sessionRes.data) setSessionMemories(sessionRes.data);
    if (userRes.data) setUserMemories(userRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getLayerIcon = (layerType: string) => {
    switch (layerType) {
      case 'session': return Clock;
      case 'user': return User;
      case 'customer': return Users;
      case 'organization': return Building2;
      case 'knowledge': return Database;
      case 'summary': return MessageSquare;
      case 'long_term': return Brain;
      default: return Layers;
    }
  };

  const layerColors: Record<string, string> = {
    session: 'from-orange-500/20 to-amber-500/20',
    user: 'from-blue-500/20 to-cyan-500/20',
    customer: 'from-green-500/20 to-emerald-500/20',
    organization: 'from-purple-500/20 to-pink-500/20',
    knowledge: 'from-emerald-500/20 to-teal-500/20',
    summary: 'from-rose-500/20 to-red-500/20',
    long_term: 'from-indigo-500/20 to-violet-500/20',
  };

  const getUsageStats = () => {
    return {
      totalSessionMemories: sessionMemories.length,
      totalUserMemories: userMemories.length,
      avgImportance: [...sessionMemories, ...userMemories].reduce((acc, m) => acc + (m.importance_score || 0), 0) / (sessionMemories.length + userMemories.length || 1),
    };
  };

  const stats = getUsageStats();

  return (
    <AppShell>
      <PageHeader
        title="Memory Engine"
        description="Multi-layer memory: session, user, customer, organization"
        action={
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        }
      />

      {/* Memory Architecture Diagram */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Memory Architecture</h2>
        <div className="grid sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {['session', 'user', 'customer', 'organization', 'knowledge', 'summary', 'long_term'].map((type, i) => {
            const layer = layers.find(l => l.layer_type === type);
            const LayerIcon = getLayerIcon(type);
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${layerColors[type]} text-center`}
              >
                <LayerIcon className="h-8 w-8 mx-auto mb-2 opacity-70" />
                <p className="text-sm font-medium capitalize">{type.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {layer?.retention_days || 0} days
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Memory Layers', value: layers.length, icon: Layers },
          { label: 'Session Memories', value: stats.totalSessionMemories, icon: Clock },
          { label: 'User Memories', value: stats.totalUserMemories, icon: User },
          { label: 'Avg Importance', value: (stats.avgImportance * 100).toFixed(0), icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Memory Layers */}
      <Tabs defaultValue="layers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="session">Session</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="layers">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Memory Layers Configuration</h2>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(7)].map((_, i) => <div key={i} className="h-40 rounded-xl shimmer" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {layers.map((layer, i) => {
                  const LayerIcon = getLayerIcon(layer.layer_type);
                  return (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-xl bg-muted/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layerColors[layer.layer_type]} flex items-center justify-center`}>
                          <LayerIcon className="h-6 w-6" />
                        </div>
                        <Badge variant={layer.is_active ? 'default' : 'outline'} className={layer.is_active ? 'bg-success/20 text-success' : ''}>
                          {layer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{layer.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{layer.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Retention</p>
                          <p className="font-medium">{layer.retention_days} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max Entries</p>
                          <p className="font-medium">{layer.max_entries.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="session">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Session Memories</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
              </div>
            ) : sessionMemories.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No session memories</p>
                <p className="text-sm text-muted-foreground">Session memories are temporary and expire automatically</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionMemories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelectedMemory(memory); setDetailOpen(true); }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{memory.key}</p>
                        <p className="text-xs text-muted-foreground">Session: {memory.session_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Importance</p>
                        <p className="text-sm font-medium">{(memory.importance_score * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Access</p>
                        <p className="text-sm font-medium">{memory.access_count}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="user">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Memories</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
              </div>
            ) : userMemories.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No user memories</p>
                <p className="text-sm text-muted-foreground">User preferences and settings will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userMemories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelectedMemory(memory); setDetailOpen(true); }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{memory.key}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{memory.memory_type}</Badge>
                          {memory.is_confirmed && <Badge className="bg-success/20 text-success text-[9px]">Confirmed</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Importance</p>
                        <p className="text-sm font-medium">{(memory.importance_score * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="customer">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Memories</h2>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Customer Memory Layer</p>
              <p className="text-sm text-muted-foreground">Customer-specific insights and interaction history</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="organization">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Organization Memories</h2>
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Organization Memory Layer</p>
              <p className="text-sm text-muted-foreground">Company-wide policies and guidelines</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Memory Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Memory Details
            </DialogTitle>
          </DialogHeader>
          {selectedMemory && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Key</p>
                <p className="font-medium">{selectedMemory.key}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(selectedMemory.value, null, 2)}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Importance Score</p>
                  <p className="font-bold">{(selectedMemory.importance_score * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Access Count</p>
                  <p className="font-bold">{selectedMemory.access_count}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
