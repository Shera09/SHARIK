'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  Volume2,
  Sparkles,
  Settings,
  Play,
  Pause,
  MessageSquare,
  Users,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  User,
  Save,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type ReceptionistConfig = {
  id: string;
  name: string;
  greetings: Record<string, string>;
  supported_languages: string[];
  transfer_threshold: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  voicemail_message: string;
  after_hours_message: string;
  is_active: boolean;
};

type ActiveCall = {
  id: string;
  from_number: string;
  status: string;
  duration_seconds: number;
  sentiment: string;
  detected_intent: string;
  created_at: string;
};

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hi-en', label: 'Hinglish' },
];

const weekDays = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export default function AIReceptionistPage() {
  const [config, setConfig] = useState<ReceptionistConfig | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [configRes, callsRes] = await Promise.all([
      supabase.from('ai_receptionist_config').select('*').limit(1).single(),
      supabase.from('voice_calls').select('*').eq('status', 'active').order('created_at', { ascending: false }),
    ]);
    if (configRes.data) setConfig(configRes.data);
    if (callsRes.data) setActiveCalls(callsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_receptionist_config')
        .update({
          name: config.name,
          greetings: config.greetings,
          supported_languages: config.supported_languages,
          transfer_threshold: config.transfer_threshold,
          working_hours_start: config.working_hours_start,
          working_hours_end: config.working_hours_end,
          working_days: config.working_days,
          voicemail_message: config.voicemail_message,
          after_hours_message: config.after_hours_message,
        })
        .eq('id', config.id);
      if (error) throw error;
      toast.success('Configuration saved');
      setSettingsOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const toggleActive = async () => {
    if (!config) return;
    const { error } = await supabase
      .from('ai_receptionist_config')
      .update({ is_active: !config.is_active })
      .eq('id', config.id);
    if (error) toast.error(error.message);
    else {
      setConfig({ ...config, is_active: !config.is_active });
      toast.success(config.is_active ? 'AI Receptionist paused' : 'AI Receptionist activated');
    }
  };

  const simulateIncomingCall = async () => {
    setIsReceiving(true);
    const phrases = ['Hello, I want to register for GST', 'Hi, I need help with my invoice', 'Namaskar, GST registration ke liye call kiya tha'];
    const transcript = phrases[Math.floor(Math.random() * phrases.length)];
    setLiveTranscript(transcript);
    setTimeout(() => setIsReceiving(false), 3000);
  };

  const stats = {
    todayCalls: activeCalls.length,
    answered: activeCalls.filter((c) => c.status !== 'missed').length,
    avgDuration: activeCalls.length > 0 ? Math.round(activeCalls.reduce((a, c) => a + c.duration_seconds, 0) / activeCalls.length) : 0,
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Receptionist"
        description="Configure your AI-powered virtual receptionist"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-2 rounded-xl">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button
              onClick={toggleActive}
              className={cn('gap-2 rounded-xl', config?.is_active && 'bg-red-500 hover:bg-red-600')}
            >
              {config?.is_active ? (
                <>
                  <Pause className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Status Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center premium-shadow"
          >
            <div className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 transition-all',
              config?.is_active
                ? 'bg-success/10 ring-4 ring-success/20 shadow-lg shadow-success/20'
                : 'bg-muted'
            )}>
              {config?.is_active ? (
                <Bot className="h-12 w-12 text-success animate-pulse" />
              ) : (
                <Bot className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <h2 className="font-display text-2xl font-bold">
              {config?.is_active ? 'AI Receptionist Active' : 'AI Receptionist Paused'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {config?.is_active
                ? `Answering calls in ${config.supported_languages?.length || 2} languages`
                : 'Activate to start receiving calls'}
            </p>

            {config?.is_active && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Badge variant="outline" className="gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  {config.working_hours_start} - {config.working_hours_end}
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  {config.supported_languages?.length || 0} Languages
                </Badge>
              </div>
            )}

            {/* Live Call Simulation */}
            {isReceiving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
                  <Phone className="h-5 w-5 animate-bounce" />
                  <span className="font-semibold">Incoming Call</span>
                </div>
                <p className="text-sm italic">{liveTranscript}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Today Calls', value: stats.todayCalls, icon: Phone, color: 'text-purple-500' },
              { label: 'Answered', value: stats.answered, icon: CheckCircle, color: 'text-success' },
              { label: 'Avg Duration', value: `${stats.avgDuration}s`, icon: Clock, color: 'text-blue-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <stat.icon className={cn('h-5 w-5 mx-auto mb-2', stat.color)} />
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Calls */}
          <div className="glass-card overflow-hidden premium-shadow">
            <div className="p-4 border-b border-border/40">
              <h3 className="font-semibold">Recent Calls</h3>
            </div>
            {activeCalls.length === 0 ? (
              <div className="p-8 text-center">
                <Phone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No active calls</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {activeCalls.map((call) => (
                  <div key={call.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{call.from_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {call.detected_intent || 'Unknown intent'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{call.duration_seconds}s</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Capabilities */}
          <div className="glass-card p-6 premium-shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Capabilities
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Answer incoming calls', enabled: true },
                { label: 'Identify customer intent', enabled: true },
                { label: 'Transfer to human agent', enabled: true },
                { label: 'Create CRM leads', enabled: true },
                { label: 'Schedule appointments', enabled: true },
                { label: 'Answer FAQs', enabled: true },
                { label: 'Share payment links', enabled: true },
                { label: 'Multi-language support', enabled: true },
              ].map((cap) => (
                <div key={cap.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cap.label}</span>
                  {cap.enabled ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Greeting Previews */}
          <div className="glass-card p-6 premium-shadow">
            <h3 className="font-semibold mb-4">Greetings</h3>
            <div className="space-y-3">
              {Object.entries(config?.greetings || {}).map(([lang, greeting]) => (
                <div key={lang} className="p-3 rounded-xl bg-muted/30">
                  <Badge variant="outline" className="mb-2 text-[10px]">{lang.toUpperCase()}</Badge>
                  <p className="text-sm">{greeting}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate Call */}
          <Button
            onClick={simulateIncomingCall}
            variant="outline"
            className="w-full gap-2 rounded-xl"
          >
            <Phone className="h-4 w-4" />
            Simulate Incoming Call
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure AI Receptionist</DialogTitle>
          </DialogHeader>
          {config && (
            <Tabs defaultValue="general" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="greetings">Greetings</TabsTrigger>
                <TabsTrigger value="hours">Working Hours</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Receptionist Name</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Supported Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <label key={lang.code} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.supported_languages?.includes(lang.code)}
                          onChange={(e) => {
                            const langs = e.target.checked
                              ? [...(config.supported_languages || []), lang.code]
                              : (config.supported_languages || []).filter((l) => l !== lang.code);
                            setConfig({ ...config, supported_languages: langs });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Transfer Confidence Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.transfer_threshold}
                    onChange={(e) => setConfig({ ...config, transfer_threshold: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Transfer to human if AI confidence falls below this value
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="greetings" className="space-y-4 mt-4">
                {languages.map((lang) => (
                  <div key={lang.code} className="grid gap-2">
                    <Label>{lang.label} Greeting</Label>
                    <Textarea
                      value={config.greetings?.[lang.code] || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          greetings: { ...config.greetings, [lang.code]: e.target.value },
                        })
                      }
                      rows={2}
                      placeholder={`Hello! Welcome to... (in ${lang.label})`}
                    />
                  </div>
                ))}
                <div className="grid gap-2">
                  <Label>After Hours Message</Label>
                  <Textarea
                    value={config.after_hours_message || ''}
                    onChange={(e) => setConfig({ ...config, after_hours_message: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Voicemail Message</Label>
                  <Textarea
                    value={config.voicemail_message || ''}
                    onChange={(e) => setConfig({ ...config, voicemail_message: e.target.value })}
                    rows={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="hours" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={config.working_hours_start}
                      onChange={(e) => setConfig({ ...config, working_hours_start: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={config.working_hours_end}
                      onChange={(e) => setConfig({ ...config, working_hours_end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => {
                          const days = config.working_days?.includes(day.value)
                            ? config.working_days.filter((d) => d !== day.value)
                            : [...(config.working_days || []), day.value];
                          setConfig({ ...config, working_days: days });
                        }}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          config.working_days?.includes(day.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveConfig} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
