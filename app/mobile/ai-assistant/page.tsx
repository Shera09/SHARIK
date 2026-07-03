'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MessageSquare,
  Search,
  Phone,
  Calendar,
  FileText,
  Users,
  DollarSign,
  CheckSquare,
  BookOpen,
  Bell,
  Brain,
  Smartphone,
  Play,
  Send,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const aiCapabilities = [
  { label: 'Voice Commands', icon: Mic, description: 'Speak to perform actions', available: true, usage: 4500 },
  { label: 'Natural Language Search', icon: Search, description: 'Search using everyday language', available: true, usage: 8200 },
  { label: 'Business Chat', icon: MessageSquare, description: 'AI-powered business queries', available: true, usage: 6800 },
  { label: 'Dashboard Summary', icon: Brain, description: 'AI-generated insights', available: true, usage: 3400 },
  { label: 'Invoice Generator', icon: FileText, description: 'Create invoices via voice', available: true, usage: 1200 },
  { label: 'Lead Search', icon: Users, description: 'Find leads contextually', available: true, usage: 5600 },
  { label: 'Task Creation', icon: CheckSquare, description: 'Voice-activated task creation', available: true, usage: 2900 },
  { label: 'Calendar Assistant', icon: Calendar, description: 'Smart scheduling', available: true, usage: 4100 },
];

const voiceCommands = [
  { command: 'Show me overdue invoices', result: 'Found 5 overdue invoices', time: '2 min ago' },
  { command: 'Create a lead for Tech Solutions', result: 'Lead created successfully', time: '10 min ago' },
  { command: 'What is my schedule today?', result: 'You have 3 meetings scheduled', time: '25 min ago' },
  { command: 'Mark task #234 as completed', result: 'Task updated', time: '1 hour ago' },
];

export default function AIMobileAssistantPage() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Mobile Assistant. How can I help you today?' },
  ]);

  function sendMessage() {
    if (!message.trim()) return;
    setChatMessages([...chatMessages, { role: 'user', content: message }]);
    setMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you with that. Let me check the relevant information for you.',
      }]);
    }, 500);
  }

  const stats = {
    totalInteractions: 45000,
    voiceCommands: 12500,
    avgResponseTime: '1.2s',
    satisfaction: 4.8,
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Mobile Assistant"
        description="Voice commands and AI-powered productivity on mobile devices"
        action={
          <Badge className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Interactions', value: stats.totalInteractions.toLocaleString(), icon: Sparkles, color: 'text-purple-500' },
          { label: 'Voice Commands', value: stats.voiceCommands.toLocaleString(), icon: Mic, color: 'text-blue-500' },
          { label: 'Avg Response', value: stats.avgResponseTime, icon: Brain, color: 'text-cyan-500' },
          { label: 'Satisfaction', value: stats.satisfaction, icon: MessageSquare, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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

      <Tabs defaultValue="capabilities" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="capabilities" className="rounded-lg gap-1.5">
            <Brain className="h-4 w-4" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="chat" className="rounded-lg gap-1.5">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="voice" className="rounded-lg gap-1.5">
            <Mic className="h-4 w-4" />
            Voice Commands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiCapabilities.map((capability, i) => (
              <motion.div
                key={capability.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <capability.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      {capability.available && <CheckSquare className="h-4 w-4 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{capability.label}</CardTitle>
                    <CardDescription className="text-xs mt-1">{capability.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      {capability.usage.toLocaleString()} uses this month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Mobile Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <div className={cn(
                      'max-w-[70%] p-3 rounded-xl text-sm',
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="h-5 w-5 text-blue-500" />
                  Voice Command Demo
                </CardTitle>
                <CardDescription>Try speaking to the AI assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-8">
                  <Button size="lg" className="w-20 h-20 rounded-full gap-2">
                    <Mic className="h-8 w-8" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">Tap to start speaking</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Voice Commands</CardTitle>
                <CardDescription>Commands processed by the AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {voiceCommands.map((cmd) => (
                    <div key={cmd.command} className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium">"{cmd.command}"</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">{cmd.result}</p>
                      <p className="text-xs text-muted-foreground ml-6 mt-1">{cmd.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
