'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  Database,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  FileText,
  HardDrive,
  Globe,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Eye,
  Trash2,
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

const knowledgeSources = [
  { id: '1', name: 'Product Documentation', type: 'upload', documents: 45, chunks: 12450, status: 'indexed', lastSync: '5 min ago' },
  { id: '2', name: 'Company Policies', type: 'integration', documents: 12, chunks: 3450, status: 'indexed', lastSync: '1 hour ago' },
  { id: '3', name: 'Customer Emails', type: 'api', documents: 892, chunks: 45200, status: 'syncing', lastSync: 'Now' },
  { id: '4', name: 'Support Tickets', type: 'database', documents: 1250, chunks: 89000, status: 'indexed', lastSync: '30 min ago' },
  { id: '5', name: 'Meeting Notes', type: 'webhook', documents: 234, chunks: 12000, status: 'indexed', lastSync: '2 hours ago' },
];

const ragQueries = [
  { id: '1', query: 'How do I configure SSO authentication?', latency: 245, confidence: 0.94, documents: 3, chunks: 8, feedback: 'helpful' },
  { id: '2', query: 'What is the refund policy for annual subscriptions?', latency: 189, confidence: 0.97, documents: 2, chunks: 4, feedback: 'helpful' },
  { id: '3', query: 'Show me Q3 sales performance by region', latency: 312, confidence: 0.91, documents: 4, chunks: 12, feedback: null },
  { id: '4', query: 'How to integrate with Stripe?', latency: 198, confidence: 0.96, documents: 2, chunks: 5, feedback: 'helpful' },
  { id: '5', query: 'Employee onboarding checklist', latency: 156, confidence: 0.89, documents: 3, chunks: 7, feedback: 'not_helpful' },
];

const documents = [
  { id: '1', name: 'Employee Handbook 2024.pdf', type: 'pdf', size: '2.4 MB', chunks: 156, status: 'ready', freshness: 0.95 },
  { id: '2', name: 'Q2 Financial Report.xlsx', type: 'excel', size: '890 KB', chunks: 45, status: 'ready', freshness: 0.98 },
  { id: '3', name: 'Product Roadcard.pptx', type: 'powerpoint', size: '3.2 MB', chunks: 89, status: 'processing', freshness: 0.75 },
  { id: '4', name: 'Customer Contract ABC.docx', type: 'word', size: '156 KB', chunks: 34, status: 'ready', freshness: 0.92 },
  { id: '5', name: 'Meeting Notes - July 3.txt', type: 'text', size: '45 KB', chunks: 12, status: 'ready', freshness: 1.0 },
];

export default function RAGPage() {
  const [queryText, setQueryText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  function handleSearch() {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  }

  const stats = {
    totalDocuments: knowledgeSources.reduce((s, src) => s + src.documents, 0),
    totalChunks: knowledgeSources.reduce((s, src) => s + src.chunks, 0),
    avgLatency: 198,
    avgConfidence: 93.4,
    indexSize: '1.2 GB',
    queriesToday: 1456,
  };

  return (
    <AppShell>
      <PageHeader
        title="RAG 2.0 Knowledge Engine"
        description="Retrieval-Augmented Generation with hybrid search"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
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
          { label: 'Documents', value: stats.totalDocuments.toLocaleString(), icon: FileText, color: 'text-blue-500' },
          { label: 'Chunks', value: stats.totalChunks.toLocaleString(), icon: Layers, color: 'text-purple-500' },
          { label: 'Avg Latency', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-green-500' },
          { label: 'Confidence', value: `${stats.avgConfidence}%`, icon: Shield, color: 'text-emerald-500' },
          { label: 'Index Size', value: stats.indexSize, icon: HardDrive, color: 'text-orange-500' },
          { label: 'Queries Today', value: stats.queriesToday.toLocaleString(), icon: Search, color: 'text-cyan-500' },
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

      {/* Search Interface */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Knowledge Query
          </CardTitle>
          <CardDescription>Search across all indexed knowledge with semantic understanding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ask anything about your business knowledge..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Select defaultValue="hybrid">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semantic">Semantic</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6 gap-2 rounded-xl">
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sources" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="sources" className="rounded-lg gap-1.5">
            <Database className="h-4 w-4" />
            Knowledge Sources
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="queries" className="rounded-lg gap-1.5">
            <Search className="h-4 w-4" />
            Query Log
          </TabsTrigger>
          <TabsTrigger value="citations" className="rounded-lg gap-1.5">
            <Eye className="h-4 w-4" />
            Citations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-0">
          <div className="grid gap-4">
            {knowledgeSources.map((source, i) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          source.type === 'upload' && 'bg-blue-500/10',
                          source.type === 'integration' && 'bg-purple-500/10',
                          source.type === 'api' && 'bg-green-500/10',
                          source.type === 'database' && 'bg-orange-500/10',
                          source.type === 'webhook' && 'bg-cyan-500/10'
                        )}>
                          {source.type === 'upload' && <Upload className="h-6 w-6 text-blue-600" />}
                          {source.type === 'integration' && <Zap className="h-6 w-6 text-purple-600" />}
                          {source.type === 'api' && <Globe className="h-6 w-6 text-green-600" />}
                          {source.type === 'database' && <Database className="h-6 w-6 text-orange-600" />}
                          {source.type === 'webhook' && <RefreshCw className="h-6 w-6 text-cyan-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-[10px] capitalize">{source.type}</Badge>
                            <span>{source.documents} docs</span>
                            <span>•</span>
                            <span>{source.chunks.toLocaleString()} chunks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={cn(
                            'text-[10px]',
                            source.status === 'indexed' && 'bg-green-500/10 text-green-600',
                            source.status === 'syncing' && 'bg-blue-500/10 text-blue-600'
                          )}>
                            {source.status === 'syncing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {source.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{source.lastSync}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {documents.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        doc.type === 'pdf' && 'bg-red-500/10',
                        doc.type === 'excel' && 'bg-green-500/10',
                        doc.type === 'powerpoint' && 'bg-orange-500/10',
                        doc.type === 'word' && 'bg-blue-500/10',
                        doc.type === 'text' && 'bg-gray-500/10'
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="uppercase">{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.chunks} chunks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Freshness</span>
                          <span>{Math.round(doc.freshness * 100)}%</span>
                        </div>
                        <Progress value={doc.freshness * 100} className="h-1.5" />
                      </div>
                      <Badge className={cn(
                        'text-[10px]',
                        doc.status === 'ready' && 'bg-green-500/10 text-green-600',
                        doc.status === 'processing' && 'bg-yellow-500/10 text-yellow-600'
                      )}>
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent RAG Queries</CardTitle>
              <CardDescription>Knowledge retrieval performance and feedback</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Query</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Latency</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Confidence</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Sources</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ragQueries.map((query) => (
                      <tr key={query.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 text-sm max-w-md truncate">{query.query}</td>
                        <td className="p-4 text-center text-sm">{query.latency}ms</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            query.confidence >= 0.95 && 'text-green-600',
                            query.confidence < 0.9 && 'text-yellow-600'
                          )}>
                            {(query.confidence * 100).toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center text-sm">{query.documents} docs, {query.chunks} chunks</td>
                        <td className="p-4 text-center">
                          {query.feedback ? (
                            <Badge className={cn(
                              'text-[10px]',
                              query.feedback === 'helpful' && 'bg-green-500/10 text-green-600',
                              query.feedback === 'not_helpful' && 'bg-red-500/10 text-red-600'
                            )}>
                              {query.feedback}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Citation Network</CardTitle>
              <CardDescription>How sources are referenced in responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Citation visualization coming soon</p>
                <p className="text-xs text-muted-foreground mt-1">Track how knowledge sources are linked to AI responses</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
