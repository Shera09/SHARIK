'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Upload,
  Camera,
  FileText,
  QrCode,
  Barcode,
  CreditCard,
  Receipt,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  ZoomIn,
  RotateCw,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const visionJobs = [
  { id: '1', type: 'document_ocr', name: 'Invoice_2024-0892.pdf', status: 'completed', confidence: 98.5, fields: 24, time: '2 hours ago' },
  { id: '2', type: 'business_card', name: 'Card_John_Smith.jpg', status: 'completed', confidence: 96.2, fields: 8, time: '4 hours ago' },
  { id: '3', type: 'qr_code', name: 'Product_QR_Scan.png', status: 'completed', confidence: 99.8, fields: 1, time: '5 hours ago' },
  { id: '4', type: 'receipt', name: 'Receipt_OfficeSupplies.jpg', status: 'processing', confidence: null, fields: 0, time: 'Now' },
  { id: '5', type: 'barcode', name: 'Inventory_Barcode.png', status: 'completed', confidence: 99.5, fields: 3, time: '1 day ago' },
  { id: '6', type: 'document_ocr', name: 'Contract_ClientABC.pdf', status: 'failed', confidence: null, fields: 0, time: '2 days ago' },
];

const extractionTypes = [
  { type: 'Text OCR', icon: FileText, count: 1245, success: 98.2 },
  { type: 'Business Card', icon: CreditCard, count: 345, success: 96.8 },
  { type: 'QR Code', icon: QrCode, count: 890, success: 99.5 },
  { type: 'Barcode', icon: Barcode, count: 567, success: 99.2 },
  { type: 'Receipt', icon: Receipt, count: 234, success: 94.5 },
  { type: 'Document OCR', icon: FileText, count: 678, success: 97.1 },
];

const recentExtractions = [
  { field: 'Invoice Number', value: 'INV-2024-0892', confidence: 99 },
  { field: 'Date', value: '2024-07-03', confidence: 98 },
  { field: 'Total Amount', value: '$4,567.89', confidence: 97 },
  { field: 'Vendor', value: 'Acme Corp', confidence: 96 },
  { field: 'GST Number', value: 'GSTIN-ABC-123', confidence: 95 },
];

export default function VisionAIPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const stats = {
    totalJobs: visionJobs.length,
    completed: visionJobs.filter(j => j.status === 'completed').length,
    processing: visionJobs.filter(j => j.status === 'processing').length,
    failed: visionJobs.filter(j => j.status === 'failed').length,
    avgConfidence: 97.2,
    totalFields: 1245,
  };

  function handleUpload() {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
  }

  const filteredJobs = selectedType === 'all' ? visionJobs : visionJobs.filter(j => j.type === selectedType);

  return (
    <AppShell>
      <PageHeader
        title="Vision AI"
        description="Image processing, OCR, and document extraction"
        action={
          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document_ocr">Document OCR</SelectItem>
                <SelectItem value="business_card">Business Card</SelectItem>
                <SelectItem value="qr_code">QR Code</SelectItem>
                <SelectItem value="barcode">Barcode</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpload} disabled={isUploading} className="gap-2 rounded-xl">
              {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Image
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs * 100 + 50, icon: Eye, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed * 100 + 20, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Processing', value: stats.processing * 100 + 5, icon: RefreshCw, color: 'text-blue-500' },
          { label: 'Failed', value: stats.failed * 100 + 3, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: Eye, color: 'text-purple-500' },
          { label: 'Fields Extracted', value: stats.totalFields.toLocaleString(), icon: FileText, color: 'text-orange-500' },
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

      {/* Upload Interface */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6"
        >
          <Card className="border-dashed border-2 border-primary/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-16 w-16 text-primary mb-4 animate-pulse" />
                <p className="text-lg font-medium">Processing Image...</p>
                <Progress value={45} className="w-64 mt-4" />
                <p className="text-sm text-muted-foreground mt-2">Analyzing document structure</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="jobs" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="jobs" className="rounded-lg gap-1.5">
            <Eye className="h-4 w-4" />
            All Jobs
          </TabsTrigger>
          <TabsTrigger value="types" className="rounded-lg gap-1.5">
            <Filter className="h-4 w-4" />
            By Type
          </TabsTrigger>
          <TabsTrigger value="extractions" className="rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            Extractions
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
                        job.type === 'document_ocr' && 'bg-blue-500/10 text-blue-600',
                        job.type === 'business_card' && 'bg-purple-500/10 text-purple-600',
                        job.type === 'qr_code' && 'bg-green-500/10 text-green-600',
                        job.type === 'barcode' && 'bg-orange-500/10 text-orange-600',
                        job.type === 'receipt' && 'bg-cyan-500/10 text-cyan-600'
                      )}>
                        {job.type === 'document_ocr' && <FileText className="h-6 w-6" />}
                        {job.type === 'business_card' && <CreditCard className="h-6 w-6" />}
                        {job.type === 'qr_code' && <QrCode className="h-6 w-6" />}
                        {job.type === 'barcode' && <Barcode className="h-6 w-6" />}
                        {job.type === 'receipt' && <Receipt className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{job.type.replace('_', ' ')}</Badge>
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
                          <ZoomIn className="h-4 w-4" />
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

        <TabsContent value="types" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {extractionTypes.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{item.type}</CardTitle>
                        <p className="text-xs text-muted-foreground">{item.count.toLocaleString()} processed</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-bold text-green-600">{item.success}%</span>
                    </div>
                    <Progress value={item.success} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="extractions" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Field Extractions</CardTitle>
                  <CardDescription>Extracted data from processed images</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
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
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExtractions.map((item, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 text-sm font-medium">{item.field}</td>
                        <td className="p-4 text-sm">{item.value}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            item.confidence >= 98 && 'text-green-600',
                            item.confidence < 95 && 'text-yellow-600'
                          )}>
                            {item.confidence}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
