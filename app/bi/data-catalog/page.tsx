'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Table,
  Columns,
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  BookOpen,
  Tag,
  User,
  Calendar,
  Layers,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table as RTable, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface CatalogEntry {
  catalog_id: string;
  object_type: string;
  object_schema: string;
  object_name: string;
  object_description: string | null;
  column_name: string | null;
  column_description: string | null;
  data_type: string | null;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  data_classification: string | null;
  pii_flag: boolean;
  sensitivity_level: string | null;
  business_owner: string | null;
  technical_owner: string | null;
  steward: string | null;
  source_system: string | null;
  is_active: boolean;
}

interface GlossaryTerm {
  term_id: string;
  term: string;
  definition: string;
  synonyms: string[];
  related_terms: string[];
  category: string;
  business_domain: string;
  status: string;
}

const sensitivityColors: Record<string, string> = {
  public: 'bg-green-500/10 text-green-700 border-green-500/20',
  internal: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  confidential: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  restricted: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const objectTypeIcons: Record<string, typeof Table> = {
  table: Table,
  view: Eye,
  column: Layers,
};

export default function DataCatalogPage() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sensitivityFilter, setSensitivityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [catalogRes, glossaryRes] = await Promise.all([
        supabase.from('data_catalog').select('*').order('object_name'),
        supabase.from('business_glossary').select('*').order('term'),
      ]);

      setCatalog(catalogRes.data || []);
      setGlossary(glossaryRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCatalog = catalog.filter(entry => {
    const matchesSearch = entry.object_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.column_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (entry.object_description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || entry.object_type === typeFilter;
    const matchesSensitivity = sensitivityFilter === 'all' || entry.sensitivity_level === sensitivityFilter;
    return matchesSearch && matchesType && matchesSensitivity;
  });

  const stats = {
    total: catalog.length,
    tables: catalog.filter(c => c.object_type === 'table').length,
    columns: catalog.filter(c => c.column_name).length,
    pii: catalog.filter(c => c.pii_flag).length,
    glossary: glossary.length,
  };

  // Group by table
  const tablesMap = new Map<string, CatalogEntry[]>();
  filteredCatalog.forEach(entry => {
    if (entry.object_type === 'table' || !entry.column_name) {
      if (!tablesMap.has(entry.object_name)) {
        tablesMap.set(entry.object_name, []);
      }
    }
  });
  catalog.forEach(entry => {
    if (entry.column_name) {
      const tableName = entry.object_name;
      if (tablesMap.has(tableName)) {
        tablesMap.get(tableName)!.push(entry);
      }
    }
  });

  return (
    <AppShell>
      <PageHeader
        title="Data Catalog"
        description="Discover, understand, and govern your data assets"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Assets', value: stats.total, icon: Database, color: 'text-blue-600' },
          { label: 'Tables', value: stats.tables, icon: Table, color: 'text-purple-600' },
          { label: 'Columns', value: stats.columns, icon: Layers, color: 'text-green-600' },
          { label: 'PII Fields', value: stats.pii, icon: Shield, color: 'text-orange-600' },
          { label: 'Glossary Terms', value: stats.glossary, icon: BookOpen, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color, "opacity-50")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Data Catalog</TabsTrigger>
          <TabsTrigger value="glossary">Business Glossary</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tables, columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="view">Views</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Tables Accordions */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-xl shimmer" />
              ))}
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No data assets found</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {Array.from(new Set(filteredCatalog.map(c => c.object_name))).slice(0, 10).map((tableName) => {
                const tableEntries = catalog.filter(c => c.object_name === tableName);
                const tableData = tableEntries.find(c => !c.column_name) || tableEntries[0];
                const columns = tableEntries.filter(c => c.column_name);
                const piiColumns = columns.filter(c => c.pii_flag);

                return (
                  <AccordionItem key={tableName} value={tableName} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                          <Table className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{tableName}</p>
                          <p className="text-sm text-muted-foreground">
                            {columns.length} columns
                            {piiColumns.length > 0 && (
                              <span className="text-orange-600 ml-2">
                                ({piiColumns.length} PII)
                              </span>
                            )}
                          </p>
                        </div>
                        {tableData?.sensitivity_level && (
                          <Badge className={cn("ml-2", sensitivityColors[tableData.sensitivity_level] || 'bg-gray-500/10')}>
                            {tableData.sensitivity_level}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {tableData?.object_description && (
                        <p className="text-sm text-muted-foreground mb-4">{tableData.object_description}</p>
                      )}
                      <div className="rounded-lg border">
                        <RTable>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Column Name</TableHead>
                              <TableHead>Data Type</TableHead>
                              <TableHead>Nullable</TableHead>
                              <TableHead>Key</TableHead>
                              <TableHead>Sensitivity</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {columns.map((col) => (
                              <TableRow key={col.catalog_id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {col.column_name}
                                    {col.pii_flag && (
                                      <Shield className="h-4 w-4 text-orange-500" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {col.data_type || 'unknown'}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  {col.is_nullable ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">No</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {col.is_primary_key && <Badge variant="outline" className="text-xs">PK</Badge>}
                                  {col.is_foreign_key && <Badge variant="outline" className="text-xs ml-1">FK</Badge>}
                                </TableCell>
                                <TableCell>
                                  {col.sensitivity_level && (
                                    <Badge className={cn(sensitivityColors[col.sensitivity_level] || '')}>
                                      {col.sensitivity_level}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                  {col.column_description || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </RTable>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="glossary" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {glossary.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No glossary terms defined</p>
              </div>
            ) : (
              glossary.map((term, i) => (
                <motion.div
                  key={term.term_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{term.term}</CardTitle>
                        <Badge variant={term.status === 'approved' ? 'default' : 'outline'}>
                          {term.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        {term.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{term.definition}</p>
                      {term.synonyms && term.synonyms.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {term.synonyms.map((syn, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {syn}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Rules</CardTitle>
              <CardDescription>Automated checks for data integrity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Null Check - Customer Email', table: 'customers', status: 'passed', lastRun: '2 hours ago' },
                  { name: 'Unique Check - Invoice Numbers', table: 'invoices', status: 'passed', lastRun: '1 hour ago' },
                  { name: 'Range Check - Payment Amount', table: 'payments', status: 'failed', lastRun: '30 mins ago' },
                  { name: 'Format Check - Phone Numbers', table: 'customers', status: 'warning', lastRun: '4 hours ago' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        rule.status === 'passed' && "bg-green-500/10",
                        rule.status === 'failed' && "bg-red-500/10",
                        rule.status === 'warning' && "bg-yellow-500/10"
                      )}>
                        {rule.status === 'passed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {rule.status === 'failed' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {rule.status === 'warning' && <Info className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">Table: {rule.table}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        rule.status === 'passed' && "bg-green-500/10 text-green-700",
                        rule.status === 'failed' && "bg-red-500/10 text-red-700",
                        rule.status === 'warning' && "bg-yellow-500/10 text-yellow-700"
                      )}>
                        {rule.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{rule.lastRun}</p>
                    </div>
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
