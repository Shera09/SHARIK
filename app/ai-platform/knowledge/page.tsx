'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Upload,
  Search,
  FileText,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Settings,
  File,
  FileImage,
  FileSpreadsheet,
  HardDrive,
  Layers,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type KnowledgeSource = {
  id: string;
  name: string;
  source_type: string;
  description: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_status: string;
  document_count: number;
  chunk_count: number;
  created_at: string;
};

type KnowledgeDocument = {
  id: string;
  source_id: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  status: string;
  chunk_count: number;
  confidence_score: number;
  created_at: string;
};

export default function RAGKnowledgePage() {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [docDetailOpen, setDocDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [sourcesRes, docsRes] = await Promise.all([
      supabase.from('knowledge_sources').select('*').order('created_at', { ascending: false }),
      supabase.from('knowledge_documents').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (sourcesRes.data) setSources(sourcesRes.data);
    if (docsRes.data) setDocuments(docsRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return FileText;
      case 'docx':
      case 'doc': return FileText;
      case 'xlsx':
      case 'xls': return FileSpreadsheet;
      case 'png':
      case 'jpg':
      case 'jpeg': return FileImage;
      default: return File;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/20 text-success"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSourceStats = () => {
    const totalDocs = documents.length;
    const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);
    const avgConfidence = documents.reduce((acc, d) => acc + (d.confidence_score || 0), 0) / (documents.length || 1);
    return { totalDocs, totalChunks, avgConfidence: avgConfidence.toFixed(2) };
  };

  const stats = getSourceStats();

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = () => {
    // Simulate search results
    if (searchQuery.trim()) {
      setSearchResults([
        { chunk_id: '1', content: `Results for "${searchQuery}" from document 1...`, score: 0.92, document_id: documents[0]?.id },
        { chunk_id: '2', content: `Another match for "${searchQuery}" from document 2...`, score: 0.87, document_id: documents[1]?.id },
        { chunk_id: '3', content: `Related content about "${searchQuery}"...`, score: 0.81, document_id: documents[2]?.id },
      ]);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="RAG Knowledge System"
        description="Document upload, chunking, embeddings, and semantic retrieval"
        action={
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        }
      />

      {/* Pipeline Visualization */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">RAG Pipeline</h2>
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
          {[
            { label: 'Upload', icon: Upload, status: 'complete' },
            { label: 'Extract', icon: FileText, status: 'complete' },
            { label: 'Chunk', icon: Layers, status: 'processing' },
            { label: 'Embed', icon: Zap, status: 'pending' },
            { label: 'Store', icon: Database, status: 'pending' },
            { label: 'Index', icon: Search, status: 'pending' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  step.status === 'complete' ? 'bg-success/20' :
                  step.status === 'processing' ? 'bg-blue-500/20' :
                  'bg-muted'
                )}>
                  <step.icon className={cn(
                    'h-5 w-5',
                    step.status === 'complete' ? 'text-success' :
                    step.status === 'processing' ? 'text-blue-500 animate-pulse' :
                    'text-muted-foreground'
                  )} />
                </div>
                <span className="text-xs font-medium mt-2">{step.label}</span>
              </motion.div>
              {i < 5 && (
                <div className={cn(
                  'w-8 h-0.5 mx-2',
                  i < 2 ? 'bg-success' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sources', value: sources.length, icon: FolderOpen },
          { label: 'Documents', value: stats.totalDocs, icon: FileText },
          { label: 'Chunks', value: stats.totalChunks.toLocaleString(), icon: Layers },
          { label: 'Avg Confidence', value: `${(parseFloat(stats.avgConfidence) * 100).toFixed(0)}%`, icon: CheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Semantic Search */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Semantic Search</h2>
        <div className="flex gap-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all knowledge documents..."
            className="flex-1"
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {searchResults.map((result, i) => (
              <motion.div
                key={result.chunk_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-muted/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm">{result.content}</p>
                  <Badge variant="outline">{(result.score * 100).toFixed(0)}% match</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="chunks">Chunks</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          {/* Knowledge Sources */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Knowledge Sources</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}
              </div>
            ) : sources.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No knowledge sources configured</p>
                <p className="text-sm text-muted-foreground">Add a source to start ingesting documents</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((source, i) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{source.source_type}</p>
                      </div>
                      <Switch checked={source.is_active} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="font-medium">{source.document_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Chunks</p>
                        <p className="font-medium">{source.chunk_count || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Last synced: {source.last_synced_at ? new Date(source.last_synced_at).toLocaleDateString() : 'Never'}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Sync
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          {/* Documents */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter documents..."
                className="w-64"
              />
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No documents found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc, i) => {
                  const FileIcon = getFileIcon(doc.file_type);
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { setSelectedDocument(doc); setDocDetailOpen(true); }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.original_filename}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatBytes(doc.file_size_bytes)}</span>
                            <span>{doc.chunk_count || 0} chunks</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {doc.confidence_score && (
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className="text-sm font-medium">{(doc.confidence_score * 100).toFixed(0)}%</p>
                          </div>
                        )}
                        {getStatusBadge(doc.status)}
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chunks">
          {/* Chunks Overview */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Chunk Statistics</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-muted/30">
                <p className="text-4xl font-bold">{stats.totalChunks.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Chunks</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-muted/30">
                <p className="text-4xl font-bold">1536</p>
                <p className="text-sm text-muted-foreground">Embedding Dimension</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-muted/30">
                <p className="text-4xl font-bold">~500</p>
                <p className="text-sm text-muted-foreground">Avg Tokens/Chunk</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
