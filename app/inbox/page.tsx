'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Mail,
  Bell,
  Search,
  Plus,
  Send,
  MoreHorizontal,
  User,
  Clock,
  CheckCheck,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Zap,
  GitBranch,
  ArrowRight,
  Volume2,
  Mic,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  PhoneOff,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  subject: string;
  status: string;
  primary_channel: string;
  sentiment: string;
  detected_intent: string;
  is_ai_handled: boolean;
  message_count: number;
  last_message_at: string;
  created_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  channel: string;
  direction: string;
  sender_type: string;
  sender_name: string;
  content: string;
  is_ai_generated: boolean;
  transcription: string;
  audio_url: string;
  sentiment: string;
  created_at: string;
};

const channelConfig = (channel: string) => {
  switch (channel) {
    case 'voice': return { icon: Phone, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Voice' };
    case 'whatsapp': return { icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10', label: 'WhatsApp' };
    case 'email': return { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Email' };
    case 'chat': return { icon: MessageSquare, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Chat' };
    case 'sms': return { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'SMS' };
    default: return { icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Other' };
  }
};

const sentimentConfig = (sentiment: string) => {
  switch (sentiment) {
    case 'happy':
    case 'positive': return { icon: Smile, color: 'text-green-500', label: 'Happy' };
    case 'frustrated':
    case 'angry': return { icon: Frown, color: 'text-red-500', label: 'Frustrated' };
    case 'confused':
    case 'urgent': return { icon: AlertCircle, color: 'text-orange-500', label: 'Needs Attention' };
    default: return { icon: Meh, color: 'text-muted-foreground', label: 'Neutral' };
  }
};

export default function UnifedInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    if (channelFilter !== 'all') query = query.eq('primary_channel', channelFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (!error) setConversations(data || []);
    setLoading(false);
  }, [channelFilter, statusFilter]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversation) return;
    setMessagesLoading(true);
    supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setMessagesLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
  }, [selectedConversation]);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return c.customer_name?.toLowerCase().includes(q) || c.customer_phone?.includes(q) || c.subject?.toLowerCase().includes(q);
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter((c) => c.status === 'active').length,
    pending: conversations.filter((c) => c.status === 'pending').length,
    aiHandled: conversations.filter((c) => c.is_ai_handled).length,
    needsAttention: conversations.filter((c) => ['frustrated', 'angry', 'urgent'].includes(c.sentiment)).length,
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const { error } = await supabase.from('conversation_messages').insert({
        conversation_id: selectedConversation.id,
        channel: selectedConversation.primary_channel,
        direction: 'outbound',
        sender_type: 'employee',
        content: newMessage,
        is_ai_generated: false,
      });
      if (error) throw error;
      setNewMessage('');
      const { data } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      toast.success('Message sent');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    }
    setSending(false);
  };

  const transferToHuman = async () => {
    if (!selectedConversation) return;
    const { error } = await supabase
      .from('conversations')
      .update({ is_ai_handled: false, status: 'transferred' })
      .eq('id', selectedConversation.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Transferred to human agent');
      setSelectedConversation({ ...selectedConversation, is_ai_handled: false, status: 'transferred' });
      loadConversations();
    }
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'completed' })
      .eq('id', selectedConversation.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Conversation closed');
      loadConversations();
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Unified Inbox"
        description="Manage all customer communications from one dashboard"
        action={
          <Button
            onClick={() => setSelectedConversation(null)}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'All', value: stats.total, icon: MessageSquare, color: 'text-primary' },
          { label: 'Active', value: stats.active, icon: Zap, color: 'text-green-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'AI Handled', value: stats.aiHandled, icon: Sparkles, color: 'text-purple-500' },
          { label: 'Escalated', value: stats.needsAttention, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Channels', value: 5, icon: GitBranch, color: 'text-blue-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 rounded-xl pl-9"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'voice', 'whatsapp', 'chat', 'email'].map((c) => (
                <button
                  key={c}
                  onClick={() => setChannelFilter(c)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
                    channelFilter === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="glass-card overflow-hidden premium-shadow max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="space-y-0">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-border/40">
                    <div className="h-10 w-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/3 rounded shimmer" />
                      <div className="h-2.5 w-1/2 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No conversations</p>
                <p className="text-xs text-muted-foreground mt-1">All conversations will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filtered.map((conv) => {
                  const chan = channelConfig(conv.primary_channel);
                  const sent = sentimentConfig(conv.sentiment);
                  const Icon = chan.icon;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        'p-3 cursor-pointer transition-colors hover:bg-muted/30',
                        selectedConversation?.id === conv.id && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', chan.bg)}>
                          <Icon className={cn('h-5 w-5', chan.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">{conv.customer_name || 'Unknown'}</p>
                            {conv.sentiment && ['frustrated', 'angry', 'urgent'].includes(conv.sentiment) && (
                              <sent.icon className={cn('h-4 w-4 shrink-0', sent.color)} />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.subject || conv.customer_phone || 'No subject'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{chan.label}</Badge>
                            {conv.is_ai_handled && (
                              <span className="flex items-center gap-0.5 text-purple-500">
                                <Sparkles className="h-2.5 w-2.5" />
                                AI
                              </span>
                            )}
                            <span className="ml-auto">{new Date(conv.last_message_at || conv.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="glass-card overflow-hidden premium-shadow flex flex-col h-[600px]">
              {/* Header */}
              <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', channelConfig(selectedConversation.primary_channel).bg)}>
                    {(() => {
                      const Icon = channelConfig(selectedConversation.primary_channel).icon;
                      return <Icon className={cn('h-5 w-5', channelConfig(selectedConversation.primary_channel).color)} />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedConversation.customer_name || 'Unknown Customer'}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.customer_phone || selectedConversation.customer_email || 'No contact'}
                    </p>
                  </div>
                  {selectedConversation.is_ai_handled && (
                    <Badge className="bg-purple-500/10 text-purple-500 text-[10px] gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Handling
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!selectedConversation.is_ai_handled && (
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Transfer
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {selectedConversation.is_ai_handled && (
                        <DropdownMenuItem onClick={transferToHuman}>
                          <User className="mr-2 h-3.5 w-3.5" />
                          Transfer to Human
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={closeConversation}>
                        <CheckCheck className="mr-2 h-3.5 w-3.5" />
                        Close Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Volume2 className="mr-2 h-3.5 w-3.5" />
                        View Call Recording
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isInbound = msg.direction === 'inbound';
                      const isVoice = msg.channel === 'voice';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={cn('flex gap-2', isInbound ? 'justify-start' : 'justify-end')}
                        >
                          {isInbound && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs">{(selectedConversation.customer_name || 'C')[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn('max-w-[70%]', isInbound ? 'bg-card border border-border/50' : 'bg-primary text-primary-foreground', 'rounded-2xl px-4 py-2.5')}>
                            {msg.is_ai_generated && (
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="h-3 w-3" />
                                <span className="text-[10px] opacity-70">AI Response</span>
                              </div>
                            )}
                            {isVoice && msg.transcription && (
                              <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
                                <Mic className="h-3 w-3" />
                                Voice message
                              </div>
                            )}
                            <p className="text-sm">{msg.transcription || msg.content}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] opacity-60">
                              <span>{new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              {!isInbound && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                          {!isInbound && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {msg.is_ai_generated ? 'AI' : 'E'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/40">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={1}
                      placeholder="Type your message..."
                      className="min-h-[40px] max-h-[100px] rounded-xl resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="rounded-xl h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <Select defaultValue="chat">
                    <SelectTrigger className="h-6 w-20 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Select a Conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
