'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessagesSquare,
  Send,
  Bot,
  User,
  Clock,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Search,
  Filter,
  Archive,
  Star,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const mockSessions = [
  { id: '1', title: 'Q3 Financial Analysis', agent: 'Finance AI', messages: 12, lastMessage: '2 hours ago', status: 'active' },
  { id: '2', title: 'Customer Support Ticket', agent: 'Support AI', messages: 8, lastMessage: '4 hours ago', status: 'ended' },
  { id: '3', title: 'Lead Qualification', agent: 'Sales AI', messages: 15, lastMessage: '1 day ago', status: 'ended' },
  { id: '4', title: 'Invoice Processing', agent: 'Invoice AI', messages: 5, lastMessage: '2 days ago', status: 'ended' },
];

const mockMessages = [
  { id: '1', role: 'user', content: 'What were our total revenues for Q3 2024?', time: '14:30' },
  { id: '2', role: 'assistant', content: 'Based on the financial data, your total revenue for Q3 2024 was $2.45 million, which represents a 12% increase from Q2. The breakdown by region shows:\n\n- North America: $1.2M (49%)\n- Europe: $820K (33%)\n- APAC: $430K (18%)\n\nWould you like me to provide more detailed analysis on any specific region?', time: '14:30', tokens: 156 },
  { id: '3', role: 'user', content: 'What about APAC? Show me the growth trends', time: '14:32' },
  { id: '4', role: 'assistant', content: 'APAC Performance Analysis:\n\n**Growth Trajectory:**\n- Q1 2024: $280K\n- Q2 2024: $350K (+25%)\n- Q3 2024: $430K (+23%)\n\n**Key Drivers:**\n1. Expansion into Singapore market\n2. New enterprise clients in Japan\n3. Increased SMB adoption in India\n\n**Recommendations:**\n- Consider localizing product for Japanese market\n- Increase marketing spend in growth markets\n- Explore partnership opportunities in Korea', time: '14:32', tokens: 245 },
];

export default function ConversationsPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSession, setSelectedSession] = useState(mockSessions[0]);
  const [sending, setSending] = useState(false);

  const stats = {
    totalSessions: 1250,
    activeSessions: 45,
    avgMessages: 8.3,
    avgDuration: '12m 45s',
    totalTokens: 2450000,
    satisfaction: 94.2,
  };

  function handleSend() {
    if (!inputMessage.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setInputMessage('');
    }, 1000);
  }

  return (
    <AppShell>
      <PageHeader
        title="AI Conversations"
        description="Manage conversation sessions across all AI agents"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Archive className="h-4 w-4" />
              Archive All
            </Button>
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Sessions', value: stats.totalSessions.toLocaleString(), icon: MessagesSquare, color: 'text-blue-500' },
          { label: 'Active Now', value: stats.activeSessions, icon: Sparkles, color: 'text-green-500' },
          { label: 'Avg Messages', value: stats.avgMessages, icon: Send, color: 'text-purple-500' },
          { label: 'Avg Duration', value: stats.avgDuration, icon: Clock, color: 'text-cyan-500' },
          { label: 'Total Tokens', value: `${(stats.totalTokens / 1000000).toFixed(1)}M`, icon: Bot, color: 'text-orange-500' },
          { label: 'Satisfaction', value: `${stats.satisfaction}%`, icon: Star, color: 'text-yellow-500' },
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

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Session List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sessions</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedSession(session)}
                  className={cn(
                    'p-4 cursor-pointer transition-colors',
                    selectedSession?.id === session.id && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate flex-1">{session.title}</p>
                    <Badge variant="outline" className="text-[10px] ml-2">{session.agent}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{session.messages} messages</span>
                    <div className="flex items-center gap-2">
                      <span>{session.lastMessage}</span>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        session.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversation View */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{selectedSession?.title}</CardTitle>
                  <CardDescription className="text-xs">{selectedSession?.agent}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="p-4 space-y-4">
              {mockMessages.map((message, i) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'justify-end'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className={cn(
                      'flex items-center justify-between mt-2 text-xs',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      <span>{message.time}</span>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2">
                          {message.tokens && <span>{message.tokens} tokens</span>}
                          <div className="flex items-center gap-1">
                            <button className="hover:text-foreground transition-colors">
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button className="hover:text-foreground transition-colors">
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={sending} className="gap-2 rounded-xl">
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
