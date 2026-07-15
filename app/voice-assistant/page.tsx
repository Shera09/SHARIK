'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  MessageSquare,
  Zap,
  Send,
  Clock,
  FileText,
  Users,
  Phone,
  Calendar,
  Search,
  Bot,
  Play,
  Square,
  CheckCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type VoiceCommand = {
  id: string;
  command: string;
  detected_intent: string;
  parameters: Record<string, any>;
  confidence_score: number;
  executed: boolean;
  response_text: string;
  created_at: string;
};

const voiceCommands = [
  { command: 'Create GST invoice', icon: FileText, category: 'Invoice' },
  { command: 'Show pending payments', icon: Zap, category: 'Payment' },
  { command: 'Search customer [name]', icon: Search, category: 'CRM' },
  { command: 'Book appointment for [date]', icon: Calendar, category: 'Appointment' },
  { command: 'Send quotation on WhatsApp', icon: MessageSquare, category: 'Communication' },
  { command: 'Create new lead', icon: Users, category: 'CRM' },
  { command: 'What is the GST rate for [service]', icon: Zap, category: 'GST' },
  { command: 'Send payment reminder to [customer]', icon: Phone, category: 'Communication' },
];

const simulatedResponses: Record<string, string> = {
  'create gst invoice': 'Opening invoice creation form. Please provide customer name.',
  'show pending payments': 'You have 12 pending payments totaling ₹2,45,000.',
  'search customer': 'Found 3 customers matching your search.',
  'book appointment': 'Checking availability... Tomorrow at 2 PM is available. Shall I book it?',
  'send quotation': 'Opening quotation builder. Ready to create.',
  'create new lead': 'New lead form opened. Please provide lead details.',
  'gst rate': 'GST rate for web hosting is 18% under SAC code 998311.',
  'payment reminder': 'Payment reminder sent via WhatsApp.',
};

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<VoiceCommand[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Simulate voice recognition
  useEffect(() => {
    if (!isListening) return;
    const phrases = ['create', 'invoice', 'show', 'payments', 'search', 'customer'];
    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length && Math.random() > 0.5) {
        setLiveTranscript((prev) => (prev ? prev + ' ' : '') + phrases[index]);
        index++;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    setLiveTranscript('');
    toast.success('Listening... Speak your command');
  };

  const stopListening = async () => {
    setIsListening(false);
    const finalTranscript = liveTranscript || 'create gst invoice';
    setTranscript(finalTranscript);
    await processCommand(finalTranscript);
  };

  const processCommand = async (cmd: string) => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));

    const lowerCmd = cmd.toLowerCase();
    let detectedIntent = 'unknown';
    let responseText = 'I did not understand that command. Please try again.';
    let confidence = 0.5;

    for (const [key, val] of Object.entries(simulatedResponses)) {
      if (lowerCmd.includes(key)) {
        detectedIntent = key;
        responseText = val;
        confidence = 0.9;
        break;
      }
    }

    setResponse(responseText);
    setHistory((prev) => [{
      id: Date.now().toString(),
      command: cmd,
      detected_intent: detectedIntent,
      parameters: {},
      confidence_score: confidence,
      executed: true,
      response_text: responseText,
      created_at: new Date().toISOString(),
    }, ...prev.slice(0, 9)]);

    setIsProcessing(false);
  };

  const handleTextCommand = async () => {
    if (!textInput.trim()) return;
    await processCommand(textInput);
    setTextInput('');
  };

  return (
    <AppShell>
      <PageHeader
        title="Voice Assistant"
        description="Control your business with voice commands"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Voice Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center premium-shadow"
          >
            {/* Animated Mic Button */}
            <div className="relative inline-block mb-6">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  'relative w-24 h-24 rounded-full flex items-center justify-center transition-all',
                  isListening
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-muted hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {isListening ? (
                  <MicOff className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </button>
            </div>

            <h2 className="font-display text-2xl font-bold mb-2">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to Listen'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isListening
                ? 'Speak your command now'
                : 'Click the microphone to start'}
            </p>

            {/* Live Transcript */}
            {(liveTranscript || transcript) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-muted/30 mb-4"
              >
                <p className="text-sm text-muted-foreground mb-1">You said:</p>
                <p className="font-medium">{liveTranscript || transcript}</p>
              </motion.div>
            )}

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary">AI Response</p>
                </div>
                <p>{response}</p>
              </motion.div>
            )}

            {/* Text Input Alternative */}
            <div className="mt-6 flex items-center gap-2 max-w-md mx-auto">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type your command..."
                onKeyDown={(e) => e.key === 'Enter' && handleTextCommand()}
                className="rounded-xl"
              />
              <Button onClick={handleTextCommand} className="rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Command History */}
          <div className="glass-card overflow-hidden premium-shadow">
            <div className="p-4 border-b border-border/40">
              <h3 className="font-semibold">Recent Commands</h3>
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center">
                <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No commands yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                {history.map((cmd) => (
                  <div key={cmd.id} className="p-4 flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      cmd.executed ? 'bg-success/10' : 'bg-muted'
                    )}>
                      <Mic className={cn('h-4 w-4', cmd.executed ? 'text-success' : 'text-muted-foreground')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cmd.command}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cmd.response_text}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[9px]">{cmd.detected_intent}</Badge>
                        <span>{Math.round(cmd.confidence_score * 100)}% confidence</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Available Commands */}
          <div className="glass-card p-6 premium-shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Voice Commands
            </h3>
            <div className="space-y-2">
              {voiceCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => processCommand(cmd.command)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <cmd.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cmd.command}</p>
                    <p className="text-[10px] text-muted-foreground">{cmd.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="glass-card p-6 premium-shadow">
            <h3 className="font-semibold mb-4">Features</h3>
            <div className="space-y-3 text-sm">
              {[
                'Speech-to-Text recognition',
                'Natural language understanding',
                'Context-aware responses',
                'Action execution',
                'Multi-language support',
                'Hands-free operation',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium mb-2">Pro Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Speak clearly and naturally</li>
              <li>Use specific customer names</li>
              <li>Mention dates in DD/MM format</li>
              <li>Say &quot;cancel&quot; to stop any action</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
