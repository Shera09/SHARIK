'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileSearch,
  Database,
  Layers,
  Zap,
  Filter,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function VectorSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState('hybrid');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Mock search results
    setSearchResults([
      { id: '1', type: 'customer', title: 'John Smith - Enterprise Client', score: 0.94, content: `Customer related to "${searchQuery}"...` },
      { id: '2', type: 'invoice', title: 'INV-2024-001 - Software Services', score: 0.89, content: `Invoice mentioning "${searchQuery}"...` },
      { id: '3', type: 'knowledge', title: 'GST Compliance Guide', score: 0.86, content: `Document about "${searchQuery}"...` },
      { id: '4', type: 'task', title: 'Q4 Sales Review', score: 0.81, content: `Task related to "${searchQuery}"...` },
    ]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer': return Users;
      case 'invoice': return FileText;
      case 'knowledge': return Database;
      case 'task': return BarChart3;
      case 'email': return MessageSquare;
      default: return FileSearch;
    }
  };

  const searchableEntities = [
    { name: 'Customers', icon: Users, count: 1245, indexed: true },
    { name: 'Invoices', icon: FileText, count: 3421, indexed: true },
    { name: 'Leads', icon: TrendingUp, count: 876, indexed: true },
    { name: 'Emails', icon: MessageSquare, count: 12543, indexed: true },
    { name: 'Documents', icon: Database, count: 234, indexed: true },
    { name: 'Tasks', icon: BarChart3, count: 987, indexed: true },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Vector Search"
        description="Semantic search across all business entities"
        action={
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Indexes
          </Button>
        }
      />

      {/* Search Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Indexed Entities', value: '6', icon: Database },
          { label: 'Total Vectors', value: '1.2M', icon: Layers },
          { label: 'Search Latency', value: '45ms', icon: Zap },
          { label: 'Avg Results', value: '12.4', icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Interface */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Semantic Search</h2>
        <div className="flex gap-4 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across customers, invoices, documents, tasks..."
            className="flex-1"
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Search Type:</span>
          <div className="flex gap-2">
            {['hybrid', 'semantic', 'keyword'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  searchType === type ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3">
            {searchResults.map((result, i) => {
              const TypeIcon = getTypeIcon(result.type);
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">{result.content}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{(result.score * 100).toFixed(0)}%</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Searchable Entities */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Searchable Entities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchableEntities.map((entity, i) => (
            <motion.div
              key={entity.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-muted/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <entity.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-xs text-muted-foreground">{entity.count.toLocaleString()} records</p>
                </div>
              </div>
              <Switch checked={entity.indexed} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
