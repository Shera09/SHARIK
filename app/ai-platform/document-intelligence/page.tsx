'use client';

import { useState } from 'react';
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
  Languages,
  FileSignature,
  Receipt,
  FileSpreadsheet,
  Gavel,
  Zap,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const documentJobs = [
  { id: '1', name: 'Invoice_INV-2024-0892.pdf', type: 'invoice', status: 'completed', confidence: 98.5, pages: 3, time: '2 hours ago', extracted: 24 },
  { id: '2', name: 'Contract_ClientABC_v2.docx', type: 'contract', status: 'completed', confidence: 94.2, pages: 12, time: '4 hours ago', extracted: 45 },
  { id: '3', name: 'Receipt_OfficeSupplies.jpg', type: 'receipt', status: 'completed', confidence: 96.8, pages: 1, time: '5 hours ago', extracted: 8 },
  { id: '4', name: 'Report_Q2_Financials.pdf', type: 'report', status: 'processing', confidence: null, pages: 28, time: 'Now', extracted: 0 },
  { id: '5', name: 'ID_Scan_JohnSmith.png', type: 'identity', status: 'completed', confidence: 99.1, pages: 2, time: '1 day ago', extracted: 12 },
  { id: '6', name: 'Agreement_NDA_ClientX.pdf', type: 'contract', status: 'failed', confidence: null, pages: 5, time: '2 days ago', extracted: 0 },
];

const invoiceExtractions = [
  { field: 'Invoice Number', value: 'INV-2024-0892', confidence: 99 },
  { field: 'Invoice Date', value: '2024-07-03', confidence: 98 },
  { field: 'Due Date', value: '2024-08-02', confidence: 98 },
  { field: 'Vendor Name', value: 'Acme Corporation', confidence: 97 },
  { field: 'Vendor GSTIN', value: 'GSTIN-ABC-123-XYZ', confidence: 96 },
  { field: 'Subtotal', value: '$4,234.56', confidence: 99 },
  { field: 'Tax (18%)', value: '$762.22', confidence: 98 },
  { field: 'Total Amount', value: '$4,996.78', confidence: 99 },
  { field: 'Currency', value: 'USD', confidence: 100 },
  { field: 'Payment Terms', value: 'Net 30', confidence: 95 },
];

const contractAnalysis = [
  { clause: 'Termination Clause', type: 'termination', risk: 'low', summary: 'Either party may terminate with 30 days written notice' },
  { clause: 'Payment Terms', type: 'payment', risk: 'low', summary: 'Payment due within 45 days of invoice date' },
  { clause: 'Liability Cap', type: 'liability', risk: 'medium', summary: 'Liability limited to 12 months of service fees' },
  { clause: 'IP Ownership', type: 'ip', risk: 'low', summary: 'All IP created during engagement belongs to client' },
  { clause: 'Confidentiality', type: 'confidentiality', risk: 'low', summary: 'Standard NDA provisions apply for 5 years' },
  { clause: 'Indemnification', type: 'indemnity', risk: 'high', summary: 'Broad indemnification clause - recommend review' },
];

const extractedEntities = [
  { type: 'Person', value: 'John Smith', context: 'Signatory', document: 'Contract_ClientABC_v2.docx', confidence: 97 },
  { type: 'Organization', value: 'Acme Corporation', context: 'Vendor', document: 'Invoice_INV-2024-0892.pdf', confidence: 99 },
  { type: 'Date', value: '2024-07-03', context: 'Invoice Date', document: 'Invoice_INV-2024-0892.pdf', confidence: 98 },
  { type: 'Money', value: '$4,996.78', context: 'Total Amount', document: 'Invoice_INV-2024-0892.pdf', confidence: 99 },
  { type: 'Location', value: 'San Francisco, CA', context: 'Jurisdiction', document: 'Contract_ClientABC_v2.docx', confidence: 95 },
  { type: 'Email', value: 'billing@acme.com', context: 'Contact', document: 'Invoice_INV-2024-0892.pdf', confidence: 99 },
  { type: 'Phone', value: '+1 (555) 123-4567', context: 'Support Line', document: 'Receipt_OfficeSupplies.jpg', confidence: 94 },
  { type: 'URL', value: 'https://acme.com/pay', context: 'Payment Portal', document: 'Invoice_INV-2024-0892.pdf', confidence: 96 },
];

const translations = [
  { id: '1', source: 'English', target: 'Spanish', document: 'Contract_ClientABC_v2.docx', status: 'completed', time: '1 hour ago', segments: 156 },
  { id: '2', source: 'Spanish', target: 'English', document: 'Acuerdo_NDA_ClienteMX.pdf', status: 'completed', time: '3 hours ago', segments: 89 },
  { id: '3', source: 'English', target: 'French', document: 'Invoice_INV-2024-0892.pdf', status: 'processing', time: 'Now', segments: 45 },
  { id: '4', source: 'German', target: 'English', document: 'Anfrage_Dienstleistung.pdf', status: 'completed', time: '1 day ago', segments: 234 },
];

const summaries = [
  { document: 'Contract_ClientABC_v2.docx', type: 'executive', sentences: 3, time: '2 hours ago', summary: 'Master Services Agreement between Client ABC and Acme Corp for IT consulting services. Valued at $500K over 12 months with standard termination and confidentiality clauses. Key risk: broad indemnification clause requires legal review.' },
  { document: 'Invoice_INV-2024-0892.pdf', type: 'bullet', sentences: 5, time: '4 hours ago', summary: 'Invoice from Acme Corp for consulting services rendered in June 2024. Total amount $4,996.78 due Net 30. Includes itemized breakdown of 40 hours professional services at $125/hr plus applicable taxes.' },
  { document: 'Report_Q2_Financials.pdf', type: 'detailed', sentences: 10, time: 'Processing...', summary: '' },
];

const capabilities = [
  { name: 'OCR & Text Extraction', icon: Type, description: 'Extract text from images, PDFs, and scanned documents', count: 2345, success: 98.5 },
  { name: 'Table Extraction', icon: Table, description: 'Extract tables with structure and formatting preserved', count: 567, success: 96.2 },
  { name: 'Invoice Parsing', icon: Receipt, description: 'Extract invoice fields: vendor, amounts, dates, line items', count: 890, success: 99.1 },
  { name: 'Contract Analysis', icon: Gavel, description: 'Clause detection, risk assessment, key term extraction', count: 123, success: 94.5 },
  { name: 'Entity Extraction', icon: FileSearch, description: 'Named entity recognition: people, orgs, dates, amounts', count: 12567, success: 97.8 },
  { name: 'Translation', icon: Languages, description: 'Translate documents between 25+ languages', count: 456, success: 95.5 },
  { name: 'Summarization', icon: FileText, description: 'Generate executive, bullet, or detailed summaries', count: 234, success: 94.2 },
  { name: 'Classification', icon: FileSpreadsheet, description: 'Auto-categorize documents by type and priority', count: 1890, success: 98.1 },
];

export default function DocumentIntelligencePage() {
  const [selectedType, setSelectedType] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const stats = {
    totalJobs: documentJobs.length,
    completed: documentJobs.filter(j => j.status === 'completed').length,
    processing: documentJobs.filter(j => j.status === 'processing').length,
    failed: documentJobs.filter(j => j.status === 'failed').length,
    avgConfidence: 97.2,
    totalPages: 51,
  };

  function handleUpload() {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 3000);
  }

  const filteredJobs = selectedType === 'all' ? documentJobs : documentJobs.filter(j => j.type === selectedType);

  return (
    <AppShell>
      <PageHeader
        title="Document Intelligence"
        description="OCR, entity extraction, contract analysis, invoice parsing, translation"
        action={
          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpload} disabled={isUploading} className="gap-2 rounded-xl">
              {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Process Document
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs * 50 + 100, icon: FileText, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed * 50 + 20, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Processing', value: stats.processing * 50 + 5, icon: RefreshCw, color: 'text-cyan-500' },
          { label: 'Failed', value: stats.failed * 50 + 3, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: Eye, color: 'text-purple-500' },
          { label: 'Pages Processed', value: stats.totalPages * 100 + 50, icon: FileText, color: 'text-orange-500' },
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

      {/* Capabilities Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <cap.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cap.name}</p>
                    <p className="text-xs text-muted-foreground">{cap.count.toLocaleString()} processed</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{cap.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Success</span>
                  <span className="text-xs font-medium text-green-600">{cap.success}%</span>
                </div>
                <Progress value={cap.success} className="h-1.5 mt-1" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="jobs" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="jobs" className="rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            Processing Jobs
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg gap-1.5">
            <Receipt className="h-4 w-4" />
            Invoice Parsing
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-lg gap-1.5">
            <Gavel className="h-4 w-4" />
            Contract Analysis
          </TabsTrigger>
          <TabsTrigger value="entities" className="rounded-lg gap-1.5">
            <Type className="h-4 w-4" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="translation" className="rounded-lg gap-1.5">
            <Languages className="h-4 w-4" />
            Translation
          </TabsTrigger>
          <TabsTrigger value="summaries" className="rounded-lg gap-1.5">
            <Zap className="h-4 w-4" />
            Summaries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        job.type === 'invoice' && 'bg-green-500/10 text-green-600',
                        job.type === 'contract' && 'bg-purple-500/10 text-purple-600',
                        job.type === 'receipt' && 'bg-orange-500/10 text-orange-600',
                        job.type === 'report' && 'bg-blue-500/10 text-blue-600',
                        job.type === 'identity' && 'bg-cyan-500/10 text-cyan-600'
                      )}>
                        {job.type === 'invoice' && <Receipt className="h-6 w-6" />}
                        {job.type === 'contract' && <FileSignature className="h-6 w-6" />}
                        {job.type === 'receipt' && <Receipt className="h-6 w-6" />}
                        {job.type === 'report' && <FileText className="h-6 w-6" />}
                        {job.type === 'identity' && <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{job.type}</Badge>
                          <span>{job.pages} pages</span>
                          <span>{job.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {job.confidence && (
                        <Badge variant="outline" className={cn(
                          job.confidence >= 98 && 'text-green-600',
                          job.confidence < 95 && 'text-yellow-600'
                        )}>
                          {job.confidence}% confidence
                        </Badge>
                      )}
                      <Badge className={cn(
                        'text-[10px]',
                        job.status === 'completed' && 'bg-green-500/10 text-green-600',
                        job.status === 'processing' && 'bg-blue-500/10 text-blue-600',
                        job.status === 'failed' && 'bg-red-500/10 text-red-600'
                      )}>
                        {job.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {job.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Invoice Field Extraction</CardTitle>
                  <CardDescription>Structured data extracted from Invoice_INV-2024-0892.pdf</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Field</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Extracted Value</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Confidence</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceExtractions.map((item, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 text-sm font-medium">{item.field}</td>
                        <td className="p-4 text-sm font-mono">{item.value}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            item.confidence >= 98 && 'text-green-600',
                            item.confidence < 95 && 'text-yellow-600'
                          )}>
                            {item.confidence}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Clause Analysis</CardTitle>
              <CardDescription>Clause detection and risk assessment for Contract_ClientABC_v2.docx</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {contractAnalysis.map((clause, i) => (
                  <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          clause.risk === 'low' && 'bg-green-500/10 text-green-600',
                          clause.risk === 'medium' && 'bg-yellow-500/10 text-yellow-600',
                          clause.risk === 'high' && 'bg-red-500/10 text-red-600'
                        )}>
                          <Gavel className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{clause.clause}</p>
                          <Badge variant="outline" className="text-[10px] capitalize">{clause.type}</Badge>
                        </div>
                      </div>
                      <Badge className={cn(
                        'text-[10px]',
                        clause.risk === 'low' && 'bg-green-500/10 text-green-600',
                        clause.risk === 'medium' && 'bg-yellow-500/10 text-yellow-600',
                        clause.risk === 'high' && 'bg-red-500/10 text-red-600'
                      )}>
                        {clause.risk} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">{clause.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extracted Entities</CardTitle>
              <CardDescription>Named entity recognition across all documents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Value</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Context</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Document</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedEntities.map((entity, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px]">{entity.type}</Badge>
                        </td>
                        <td className="p-4 text-sm font-mono">{entity.value}</td>
                        <td className="p-4 text-sm text-muted-foreground">{entity.context}</td>
                        <td className="p-4 text-sm">{entity.document}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            entity.confidence >= 98 && 'text-green-600',
                            entity.confidence < 95 && 'text-yellow-600'
                          )}>
                            {entity.confidence}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document Translations</CardTitle>
              <CardDescription>Multi-language document translation with segment-level tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {translations.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Languages className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium">{t.source} → {t.target}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{t.document}</span>
                          <span>•</span>
                          <span>{t.segments} segments</span>
                          <span>•</span>
                          <span>{t.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-[10px]',
                      t.status === 'completed' && 'bg-green-500/10 text-green-600',
                      t.status === 'processing' && 'bg-blue-500/10 text-blue-600'
                    )}>
                      {t.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                      {t.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries" className="mt-0">
          <div className="grid gap-4">
            {summaries.map((s, i) => (
              <motion.div
                key={s.document}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={s.summary ? '' : 'border-dashed'}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{s.document}</CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-[10px] capitalize">{s.type}</Badge>
                            <span>{s.sentences} sentences</span>
                            <span>•</span>
                            <span>{s.time}</span>
                          </div>
                        </div>
                      </div>
                      {!s.summary && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {s.summary ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.summary}</p>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <p className="text-sm text-muted-foreground">Generating summary...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
