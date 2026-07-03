'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  Upload,
  FileText,
  Table,
  Type,
  Image,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  Download,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DocJob = {
  id: string;
  job_type: string;
  status: string;
  result: any;
  confidence_score: number;
  processing_time_ms: number;
  created_at: string;
};

export default function DocumentIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<DocJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<DocJob | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('document_intelligence_jobs').select('*').limit(20);
    if (data) setJobs(data);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success/20 text-success"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'processing': return <Badge className="bg-blue-500/20 text-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed': return <Badge className="bg-red-500/20 text-red-500"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const capabilities = [
    { name: 'OCR', icon: Type, description: 'Extract text from images and scanned documents' },
    { name: 'Table Extraction', icon: Table, description: 'Extract tables with structure preservation' },
    { name: 'Form Understanding', icon: FileText, description: 'Parse forms and extract fields' },
    { name: 'Classification', icon: FileSearch, description: 'Auto-classify document types' },
    { name: 'Entity Extraction', icon: Type, description: 'Extract named entities (names, dates, amounts)' },
    { name: 'Duplicate Detection', icon: Image, description: 'Identify duplicate or similar documents' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Document Intelligence"
        description="OCR, entity extraction, classification, and form processing"
        action={
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Process Document
          </Button>
        }
      />

      {/* Capabilities */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-muted/20"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <cap.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-medium">{cap.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{cap.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Documents Processed', value: 1234, icon: FileText },
          { label: 'Entities Extracted', value: 8567, icon: Type },
          { label: 'Avg Processing', value: '2.4s', icon: Clock },
          { label: 'Avg Confidence', value: '94.2%', icon: CheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
          <TabsTrigger value="entities">Extracted Entities</TabsTrigger>
          <TabsTrigger value="classifications">Classifications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Processing Jobs</h2>
            <div className="text-center py-12">
              <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No processing jobs</p>
              <p className="text-sm text-muted-foreground">Upload a document to start processing</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entities">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Extracted Entities</h2>
            <div className="text-center py-12">
              <Type className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Entity extraction results</p>
              <p className="text-sm text-muted-foreground">Entities from processed documents appear here</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classifications">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Document Classifications</h2>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Classification results</p>
              <p className="text-sm text-muted-foreground">Document classifications appear here</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
