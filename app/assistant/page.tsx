'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Database,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { answerBusinessQuestion, type AIResult, type ResponseBlock } from '@/lib/ai-query';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: AIResult;
  timestamp: Date;
  loading?: boolean;
};

const SUGGESTIONS = [
  'Summarize my sales pipeline value',
  'Which invoices are overdue?',
  "What's my revenue this quarter?",
  'Show me leads that need follow-up',
  'What are the top pending tasks?',
  'Break down my expenses by category',
];

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content: "I'm your Business OS AI Assistant. I pull live data from your CRM, invoices, payments, tasks, team, and expenses — then separate verified facts from my recommendations. Ask me anything about your business.",
  timestamp: new Date(),
};

function blockIcon(kind: ResponseBlock['kind']) {
  if (kind === 'data') return Database;
  if (kind === 'recommendation') return Lightbulb;
  return HelpCircle;
}

function blockStyles(kind: ResponseBlock['kind']) {
  if (kind === 'data') return 'border-primary/20 bg-primary/5';
  if (kind === 'recommendation') return 'border-warning/20 bg-warning/5';
  return 'border-accent/20 bg-accent/5';
}

function blockLabel(kind: ResponseBlock['kind']) {
  if (kind === 'data') return 'Verified Data';
  if (kind === 'recommendation') return 'Recommendation';
  return 'Clarifying Question';
}

function blockLabelColor(kind: ResponseBlock['kind']) {
  if (kind === 'data') return 'text-primary';
  if (kind === 'recommendation') return 'text-warning';
  return 'text-accent';
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const placeholderId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'assistant', content: '', timestamp: new Date(), loading: true },
    ]);

    try {
      const result = await answerBusinessQuestion(content);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, loading: false, result, content: result.blocks.map((b) => b.lines.join('\n')).join('\n\n') }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, loading: false, content: `I ran into a problem retrieving your data: ${err.message || 'Unknown error'}. Please try again.` }
            : m
        )
      );
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
  };

  const renderResult = (result: AIResult) => (
    <div className="space-y-3">
      {result.blocks.map((block, i) => {
        const Icon = blockIcon(block.kind);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn('rounded-xl border p-3', blockStyles(block.kind))}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Icon className={cn('h-3.5 w-3.5', blockLabelColor(block.kind))} />
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider', blockLabelColor(block.kind))}>
                {blockLabel(block.kind)}
              </span>
              {block.kind === 'data' && (block as any).title && (
                <span className="text-[10px] text-muted-foreground">— {(block as any).title.replace(' (verified)', '').replace(' from * table', '')}</span>
              )}
            </div>
            <div className="space-y-0.5">
              {block.lines.map((line, j) => (
                <p key={j} className="text-sm leading-relaxed text-foreground/90">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        );
      })}
      {result.sources.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Source{result.sources.length === 1 ? '' : 's'}: {result.sources.join(', ')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        title="AI Assistant"
        description="Ask anything about your business — answers are grounded in your live data"
        action={
          <Button variant="outline" onClick={clearChat} className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            New Chat
          </Button>
        }
      />

      <div className="flex h-[calc(100vh-200px)] min-h-[500px] flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card premium-shadow">
        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Business AI</p>
            <p className="text-xs text-muted-foreground">Grounded in your live data</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Live</Badge>
          <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 shrink-0 rounded-lg">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-primary/20 to-accent/20'
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={cn(
                  'group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted/60 text-foreground rounded-tl-sm'
                )}>
                  {msg.loading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="h-2 w-2 rounded-full bg-muted-foreground/50"
                        />
                      ))}
                    </div>
                  ) : msg.result ? (
                    renderResult(msg.result)
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                          {formatContent(line)}
                        </p>
                      ))}
                    </div>
                  )}
                  {!msg.loading && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn(
                        'text-[10px]',
                        msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      )}>
                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.content && (
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="ml-auto opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="border-t border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your business data... (Enter to send, Shift+Enter for newline)"
              className="max-h-32 min-h-[40px] flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Responses show verified data separately from AI recommendations. Always verify critical decisions.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function formatContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
