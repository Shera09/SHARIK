'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  Filter,
  Clock,
  TrendingUp,
  FileText,
  Database,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Globe,
  Trash2,
  Save,
  Download,
  RefreshCw,
  CheckCircle,
  Star,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const searchSuggestions = [
  'What were total revenues last month?',
  'Show me overdue invoices',
  'Find customers in APAC region',
  'List pending approvals',
  'Generate sales forecast',
];

const recentSearches = [
  { query: 'customers with unpaid invoices over 30 days', results: 23, time: '15 minutes ago', type: 'natural' },
  { query: 'Q2 financial summary', results: 5, time: '1 hour ago', type: 'natural' },
  { query: 'employees with birthdays this month', results: 4, time: '2 hours ago', type: 'keyword' },
  { query: 'pending leave requests', results: 7, time: '3 hours ago', type: 'filter' },
  { query: 'failed webhook deliveries', results: 12, time: '5 hours ago', type: 'semantic' },
];

const searchIndexes = [
  { resource: 'customers', count: 1245, lastSync: '5 min ago', status: 'indexed', coverage: 98 },
  { resource: 'invoices', count: 3456, lastSync: '10 min ago', status: 'indexed', coverage: 99 },
  { resource: 'documents', count: 892, lastSync: '30 min ago', status: 'indexed', coverage: 95 },
  { resource: 'emails', count: 12500, lastSync: '1 hour ago', status: 'indexed', coverage: 97 },
  { resource: 'tasks', count: 456, lastSync: '15 min ago', status: 'indexed', coverage: 100 },
  { resource: 'meetings', count: 234, lastSync: '2 hours ago', status: 'syncing', coverage: 85 },
];

const searchStats = {
  totalQueries: 15678,
  avgLatency: 245,
  avgResults: 15.3,
  satisfactionRate: 94.2,
  topSource: 'customers',
  savedSearches: 45,
};

export default function AISearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('natural');

  function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  }

  return (
    <AppShell>
      <PageHeader
        title="AI Enterprise Search"
        description="Unified search across all business data with natural language"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Saved Searches
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reindex All
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Queries', value: searchStats.totalQueries.toLocaleString(), icon: Search, color: 'text-blue-500' },
          { label: 'Avg Latency', value: `${searchStats.avgLatency}ms`, icon: Clock, color: 'text-green-500' },
          { label: 'Avg Results', value: searchStats.avgResults, icon: BarChart3, color: 'text-purple-500' },
          { label: 'Satisfaction', value: `${searchStats.satisfactionRate}%`, icon: Star, color: 'text-yellow-500' },
          { label: 'Top Source', value: searchStats.topSource, icon: Database, color: 'text-orange-500' },
          { label: 'Saved Searches', value: searchStats.savedSearches, icon: Save, color: 'text-cyan-500' },
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
            <p className="text-2xl font-bold capitalize">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search Interface */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Natural Language Search</CardTitle>
          </div>
          <CardDescription>Search across customers, invoices, documents, emails, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ask anything about your business data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-32 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6 gap-2 rounded-xl">
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {/* Suggestions */}
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground py-1">Try:</span>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="history" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            Recent Searches
          </TabsTrigger>
          <TabsTrigger value="indexes" className="rounded-lg gap-1.5">
            <Database className="h-4 w-4" />
            Search Indexes
          </TabsTrigger>
          <TabsTrigger value="scope" className="rounded-lg gap-1.5">
            <Filter className="h-4 w-4" />
            Search Scope
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentSearches.map((search, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setQuery(search.query)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{search.query}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{search.type}</Badge>
                          <span>{search.results} results</span>
                          <span>•</span>
                          <span>{search.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchIndexes.map((index, i) => (
              <motion.div
                key={index.resource}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Database className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm capitalize">{index.resource}</CardTitle>
                          <p className="text-xs text-muted-foreground">{index.count.toLocaleString()} items</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        'text-[10px]',
                        index.status === 'indexed' && 'bg-green-500/10 text-green-600',
                        index.status === 'syncing' && 'bg-blue-500/10 text-blue-600'
                      )}>
                        {index.status === 'syncing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {index.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className="font-medium">{index.coverage}%</span>
                    </div>
                    <Progress value={index.coverage} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-2">Last synced: {index.lastSync}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scope" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Search Scope</CardTitle>
              <CardDescription>Select which data sources to include in searches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: 'Customers & Leads', enabled: true, count: '1,245 records' },
                  { name: 'Invoices & Payments', enabled: true, count: '3,456 records' },
                  { name: 'Documents & Files', enabled: true, count: '892 records' },
                  { name: 'Emails & Messages', enabled: true, count: '12,500 records' },
                  { name: 'Tasks & Projects', enabled: true, count: '456 records' },
                  { name: 'Calendar Events', enabled: false, count: '234 records' },
                  { name: 'Support Tickets', enabled: true, count: '567 records' },
                  { name: 'Knowledge Base', enabled: true, count: '324 records' },
                  { name: 'Automation Logs', enabled: false, count: '5,678 events' },
                  { name: 'AI Conversations', enabled: true, count: '8,912 messages' },
                ].map((scope) => (
                  <div key={scope.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{scope.name}</p>
                      <p className="text-xs text-muted-foreground">{scope.count}</p>
                    </div>
                    <Switch checked={scope.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <button
      className={cn(
        'w-10 h-6 rounded-full transition-colors relative',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-background transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}
