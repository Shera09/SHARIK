'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  Clock,
  Server,
  Globe,
  Database,
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

const logLevels = ['all', 'debug', 'info', 'warn', 'error', 'fatal'];

const mockLogs = [
  { id: '1', timestamp: '2024-07-03 14:32:15', service: 'api-gateway', level: 'info', message: 'Request processed successfully', env: 'production', requestId: 'req_abc123' },
  { id: '2', timestamp: '2024-07-03 14:32:14', service: 'ai-engine', level: 'warn', message: 'High latency detected for model inference: 1.2s', env: 'production', requestId: 'req_abc124' },
  { id: '3', timestamp: '2024-07-03 14:32:13', service: 'database', level: 'error', message: 'Connection pool exhausted, waiting for available connection', env: 'production', requestId: null },
  { id: '4', timestamp: '2024-07-03 14:32:12', service: 'webhook-worker', level: 'info', message: 'Webhook delivered to https://api.example.com', env: 'production', requestId: 'req_abc125' },
  { id: '5', timestamp: '2024-07-03 14:32:11', service: 'api-gateway', level: 'error', message: 'Failed to authenticate request: invalid token', env: 'production', requestId: 'req_abc126' },
  { id: '6', timestamp: '2024-07-03 14:32:10', service: 'cache', level: 'debug', message: 'Cache hit for key: customer_12345', env: 'production', requestId: 'req_abc127' },
];

const logLevelColors: Record<string, string> = {
  debug: 'bg-gray-500/10 text-gray-600',
  info: 'bg-blue-500/10 text-blue-600',
  warn: 'bg-yellow-500/10 text-yellow-600',
  error: 'bg-red-500/10 text-red-600',
  fatal: 'bg-red-700/10 text-red-700',
};

const serviceIcons: Record<string, typeof Server> = {
  'api-gateway': Globe,
  'ai-engine': Server,
  'database': Database,
  'webhook-worker': Server,
  'cache': Database,
};

export default function ObservabilityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesService = serviceFilter === 'all' || log.service === serviceFilter;
    return matchesSearch && matchesLevel && matchesService;
  });

  const stats = {
    totalLogs: 125000,
    errors: 234,
    warnings: 1890,
    info: 122000,
  };

  return (
    <AppShell>
      <PageHeader
        title="Observability"
        description="Centralized logging, tracing, and system visibility"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs (24h)', value: stats.totalLogs.toLocaleString(), icon: Eye, color: 'text-blue-500' },
          { label: 'Errors', value: stats.errors, icon: XCircle, color: 'text-red-500' },
          { label: 'Warnings', value: stats.warnings, icon: AlertTriangle, color: 'text-yellow-500' },
          { label: 'Info', value: stats.info.toLocaleString(), icon: Info, color: 'text-cyan-500' },
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

      <Tabs defaultValue="logs" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="logs" className="rounded-lg gap-1.5">
            <Eye className="h-4 w-4" />
            Log Stream
          </TabsTrigger>
          <TabsTrigger value="search" className="rounded-lg gap-1.5">
            <Search className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg gap-1.5">
            <Server className="h-4 w-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {Array.from(new Set(mockLogs.map(l => l.service))).map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y font-mono text-sm">
                {filteredLogs.map((log) => {
                  const ServiceIcon = serviceIcons[log.service] || Server;
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{log.timestamp}</span>
                      </div>
                      <Badge className={cn('text-[10px] shrink-0', logLevelColors[log.level])}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{log.service}</span>
                      </div>
                      <div className="flex-1 truncate">
                        <span className={cn(log.level === 'error' || log.level === 'fatal' ? 'text-red-600' : '')}>
                          {log.message}
                        </span>
                      </div>
                      {log.requestId && (
                        <code className="text-xs text-muted-foreground shrink-0">{log.requestId}</code>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Log Search</CardTitle>
              <CardDescription>Query logs with complex filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium mb-2">Time Range</p>
                  <Select defaultValue="1h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">Last 15 minutes</SelectItem>
                      <SelectItem value="1h">Last hour</SelectItem>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Environment</p>
                  <Select defaultValue="production">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Log Level</p>
                  <Select defaultValue="error">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.slice(1).map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Service</p>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="api-gateway">API Gateway</SelectItem>
                      <SelectItem value="ai-engine">AI Engine</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gap-2">
                <Search className="h-4 w-4" />
                Search Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['api-gateway', 'ai-engine', 'database', 'cache', 'webhook-worker', 'email-service', 'sms-service', 'worker-queue'].map((service) => (
              <Card key={service}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium capitalize">{service.replace('-', ' ')}</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 text-[10px]">Healthy</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Logs/min</p>
                      <p className="font-medium">{Math.floor(Math.random() * 1000 + 500)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Error Rate</p>
                      <p className={cn('font-medium', Math.random() > 0.8 ? 'text-red-600' : 'text-green-600')}>{(Math.random() * 0.5).toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
