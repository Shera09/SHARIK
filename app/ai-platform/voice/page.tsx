'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  FileText,
  Search,
  Globe,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Zap,
  Settings,
  Download,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const voiceSessions = [
  { id: '1', type: 'command', language: 'en', duration: '2m 34s', speakers: 1, status: 'completed', accuracy: 98.5 },
  { id: '2', type: 'dictation', language: 'en', duration: '15m 12s', speakers: 1, status: 'completed', accuracy: 96.2 },
  { id: '3', type: 'meeting', language: 'en', duration: '45m 30s', speakers: 4, status: 'transcribing', accuracy: null },
  { id: '4', type: 'search', language: 'en', duration: '0m 45s', speakers: 1, status: 'completed', accuracy: 99.1 },
  { id: '5', type: 'conversation', language: 'hi', duration: '8m 15s', speakers: 2, status: 'completed', accuracy: 94.8 },
];

const voiceCommands = [
  { command: 'Create invoice for customer ABC Corp', intent: 'create_invoice', resolved: true, time: '2 hours ago' },
  { command: 'Schedule meeting with John tomorrow at 3 PM', intent: 'schedule_meeting', resolved: true, time: '4 hours ago' },
  { command: 'Show me the sales report for last week', intent: 'show_report', resolved: true, time: '5 hours ago' },
  { command: 'Add task to follow up with lead', intent: 'create_task', resolved: true, time: '1 day ago' },
  { command: 'What is the status of invoice 1234?', intent: 'query_status', resolved: false, time: '1 day ago' },
];

const voiceNotes = [
  { id: '1', title: 'Client Requirements', content: 'The client wants to integrate payment processing...', summary: 'Integration requirements discussed', tags: ['client', 'integration'] },
  { id: '2', title: 'Meeting Notes - Q3 Planning', content: 'Q3 focus areas include expansion into APAC...', summary: 'Q3 strategic priorities', tags: ['planning', 'strategy'] },
  { id: '3', title: 'Quick Expense Note', content: 'Flight booking for $450 to Singapore...', summary: 'Travel expense logged', tags: ['expense', 'travel'] },
];

export default function VoiceAIPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionType, setSessionType] = useState('command');

  const stats = {
    totalSessions: 856,
    totalDuration: '45.2 hours',
    avgAccuracy: 96.8,
    commandsProcessed: 2345,
    languages: 12,
    activeSessions: 2,
  };

  function toggleRecording() {
    setIsRecording(!isRecording);
  }

  return (
    <AppShell>
      <PageHeader
        title="Voice AI"
        description="Speech-to-text, voice commands, and meeting transcription"
        action={
          <div className="flex items-center gap-2">
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="command">Voice Command</SelectItem>
                <SelectItem value="dictation">Dictation</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="search">Voice Search</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={toggleRecording} className={cn('gap-2 rounded-xl', isRecording && 'bg-red-600 hover:bg-red-700')}>
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Stop' : 'Start'} Recording
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sessions', value: stats.totalSessions, icon: Mic, color: 'text-blue-500' },
          { label: 'Total Duration', value: stats.totalDuration, icon: Clock, color: 'text-purple-500' },
          { label: 'Avg Accuracy', value: `${stats.avgAccuracy}%`, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Commands', value: stats.commandsProcessed.toLocaleString(), icon: Zap, color: 'text-orange-500' },
          { label: 'Languages', value: stats.languages, icon: Globe, color: 'text-cyan-500' },
          { label: 'Active Now', value: stats.activeSessions, icon: Volume2, color: 'text-pink-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recording Interface */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6"
        >
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                    <Mic className="h-16 w-16 text-red-500" />
                  </div>
                  <div className="absolute -inset-2 rounded-full border-2 border-red-500/30 animate-ping" />
                </div>
                <p className="mt-6 text-lg font-medium">Recording...</p>
                <p className="text-sm text-muted-foreground mt-1">Speak clearly into your microphone</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-mono">00:00:15</span>
                  </div>
                  <Badge variant="outline" className="capitalize">{sessionType}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="sessions" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="sessions" className="rounded-lg gap-1.5">
            <Mic className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="commands" className="rounded-lg gap-1.5">
            <Zap className="h-4 w-4" />
            Commands
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            Voice Notes
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {voiceSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        session.type === 'command' && 'bg-blue-500/10 text-blue-600',
                        session.type === 'dictation' && 'bg-purple-500/10 text-purple-600',
                        session.type === 'meeting' && 'bg-green-500/10 text-green-600',
                        session.type === 'search' && 'bg-orange-500/10 text-orange-600',
                        session.type === 'conversation' && 'bg-cyan-500/10 text-cyan-600'
                      )}>
                        {session.type === 'command' && <Zap className="h-5 w-5" />}
                        {session.type === 'dictation' && <FileText className="h-5 w-5" />}
                        {session.type === 'meeting' && <MessageSquare className="h-5 w-5" />}
                        {session.type === 'search' && <Search className="h-5 w-5" />}
                        {session.type === 'conversation' && <Mic className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{session.type} Session</p>
                          <Badge variant="outline" className="text-[10px]">{session.language}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{session.duration}</span>
                          <span>•</span>
                          <span>{session.speakers} speaker{session.speakers > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.accuracy && (
                        <Badge variant="outline" className={cn(
                          session.accuracy >= 98 && 'text-green-600',
                          session.accuracy < 95 && 'text-yellow-600'
                        )}>
                          {session.accuracy}% accuracy
                        </Badge>
                      )}
                      <Badge className={cn(
                        'text-[10px]',
                        session.status === 'completed' && 'bg-green-500/10 text-green-600',
                        session.status === 'transcribing' && 'bg-blue-500/10 text-blue-600'
                      )}>
                        {session.status === 'transcribing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {session.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Voice Command History</CardTitle>
              <CardDescription>Processed commands and their resolutions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {voiceCommands.map((cmd, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                          cmd.resolved ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                        )}>
                          {cmd.resolved ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">"{cmd.command}"</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">{cmd.intent.replace('_', ' ')}</Badge>
                            <span>{cmd.time}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn(
                        'text-[10px]',
                        cmd.resolved ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                      )}>
                        {cmd.resolved ? 'Resolved' : 'Pending'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <div className="grid gap-4">
            {voiceNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{note.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{note.summary}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voice Recognition</CardTitle>
                <CardDescription>Speech-to-text configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Auto-punctuation', enabled: true },
                    { name: 'Speaker diarization', enabled: true },
                    { name: 'Profanity filter', enabled: false },
                    { name: 'Real-time transcription', enabled: true },
                    { name: 'Multi-language detection', enabled: false },
                  ].map((setting) => (
                    <div key={setting.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{setting.name}</span>
                      <Switch checked={setting.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Language Settings</CardTitle>
                <CardDescription>Supported languages and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Primary Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fallback Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
