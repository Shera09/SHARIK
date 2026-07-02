'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessagesSquare,
  Send,
  Hash,
  Lock,
  Plus,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image,
  Mic,
  Pin,
  Users,
  ChevronDown,
  Circle,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Reply,
  Forward,
  Trash2,
  Edit,
  Copy,
  Star,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Channel {
  channel_id: string;
  name: string;
  channel_type: string;
  is_private: boolean;
  topic: string | null;
  member_count: number;
  last_message_at: string | null;
}

interface Message {
  message_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  sent_at: string;
  is_edited: boolean;
  reply_count: number;
  reactions: Record<string, string[]>;
}

export default function TeamChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.channel_id);
    }
  }, [selectedChannel]);

  async function loadChannels() {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
      if (data && data.length > 0) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return;
    // Would insert to DB
    const newMessage: Message = {
      message_id: Date.now().toString(),
      sender_id: 'current-user',
      content: messageInput,
      message_type: 'text',
      sent_at: new Date().toISOString(),
      is_edited: false,
      reply_count: 0,
      reactions: {},
    };
    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const onlineUsers = [
    { id: '1', name: 'Sarah Johnson', avatar: '', status: 'online' },
    { id: '2', name: 'Mike Chen', avatar: '', status: 'online' },
    { id: '3', name: 'Emily Davis', avatar: '', status: 'away' },
    { id: '4', name: 'Alex Thompson', avatar: '', status: 'offline' },
  ];

  // Mock messages if none loaded
  const displayMessages = messages.length > 0 ? messages : [
    { message_id: '1', sender_id: '1', content: 'Hey team! Quick update on the project status.', message_type: 'text', sent_at: new Date(Date.now() - 3600000).toISOString(), is_edited: false, reply_count: 2, reactions: { '👋': ['u1', 'u2'] } },
    { message_id: '2', sender_id: '2', content: 'Thanks for the update! The new features look great.', message_type: 'text', sent_at: new Date(Date.now() - 3000000).toISOString(), is_edited: false, reply_count: 0, reactions: {} },
    { message_id: '3', sender_id: '3', content: 'I have some questions about the implementation timeline. Can we schedule a quick call?', message_type: 'text', sent_at: new Date(Date.now() - 2400000).toISOString(), is_edited: false, reply_count: 1, reactions: { '👍': ['u1'] } },
    { message_id: '4', sender_id: '1', content: 'Sure, let me check my calendar and get back to you.', message_type: 'text', sent_at: new Date(Date.now() - 1800000).toISOString(), is_edited: true, reply_count: 0, reactions: {} },
  ];

  const getSenderName = (senderId: string) => {
    const user = onlineUsers.find(u => u.id === senderId);
    return user?.name || 'User';
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-120px)] gap-0">
        {/* Channel Sidebar */}
        <div className="w-72 border-r bg-muted/30 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {/* Public Channels */}
              <div className="mb-4">
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50 rounded">
                  <span>Channels</span>
                  <Plus className="h-4 w-4" />
                </button>
                {filteredChannels.filter(c => !c.is_private && c.channel_type !== 'direct').map((channel) => (
                  <motion.button
                    key={channel.channel_id}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors",
                      selectedChannel?.channel_id === channel.channel_id && "bg-primary/10 text-primary"
                    )}
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{channel.name}</span>
                    {channel.member_count > 0 && (
                      <Badge variant="outline" className="ml-auto text-xs">{channel.member_count}</Badge>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Private Channels */}
              <div className="mb-4">
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50 rounded">
                  <span>Private</span>
                  <Lock className="h-3 w-3" />
                </button>
                {filteredChannels.filter(c => c.is_private).map((channel) => (
                  <motion.button
                    key={channel.channel_id}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors",
                      selectedChannel?.channel_id === channel.channel_id && "bg-primary/10 text-primary"
                    )}
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{channel.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Direct Messages */}
              <div>
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50 rounded">
                  <span>Direct Messages</span>
                  <Plus className="h-4 w-4" />
                </button>
                {onlineUsers.slice(0, 4).map((user) => (
                  <motion.button
                    key={user.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <Circle className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 stroke-[3] fill-current",
                        user.status === 'online' && "text-green-500",
                        user.status === 'away' && "text-yellow-500",
                        user.status === 'offline' && "text-gray-400"
                      )} />
                    </div>
                    <span className="truncate">{user.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {selectedChannel && (
            <div className="h-14 border-b px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{selectedChannel.name}</span>
                {selectedChannel.topic && (
                  <>
                    <Separator orientation="vertical" className="h-5" />
                    <span className="text-sm text-muted-foreground">{selectedChannel.topic}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMembers(!showMembers)}>
                  <Users className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pin className="h-4 w-4 mr-2" /> Pinned Messages</DropdownMenuItem>
                    <DropdownMenuItem><Star className="h-4 w-4 mr-2" /> Starred Items</DropdownMenuItem>
                    <DropdownMenuItem><Search className="h-4 w-4 mr-2" /> Search History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {displayMessages.map((message, i) => (
                <motion.div
                  key={message.message_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex gap-3 hover:bg-muted/30 -mx-4 px-4 py-2 rounded-lg"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>{getSenderName(message.sender_id)[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{getSenderName(message.sender_id)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {message.is_edited && ' (edited)'}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{message.content}</p>
                    {Object.keys(message.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                          <Badge key={emoji} variant="outline" className="text-xs gap-1">
                            {emoji} {users.length}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Reply className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Forward className="h-4 w-4" /></Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Copy</DropdownMenuItem>
                        <DropdownMenuItem><Pin className="h-4 w-4 mr-2" /> Pin</DropdownMenuItem>
                        <DropdownMenuItem><Star className="h-4 w-4 mr-2" /> Bookmark</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-muted/50 rounded-lg p-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={`Message #${selectedChannel?.name || 'general'}`}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Image className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              <Button onClick={sendMessage} className="rounded-lg h-11 w-11" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <div className="w-64 border-l bg-muted/30 p-4">
            <h4 className="font-semibold mb-3">Members — {onlineUsers.length}</h4>
            <div className="space-y-1">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <Circle className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 stroke-[3] fill-current",
                      user.status === 'online' && "text-green-500",
                      user.status === 'away' && "text-yellow-500",
                      user.status === 'offline' && "text-gray-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
