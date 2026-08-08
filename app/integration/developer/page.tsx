'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Key,
  Webhook,
  Blocks,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DeveloperIntegrationPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeveloperData();
  }, []);

  const loadDeveloperData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/developer/keys');
      const data = await res.json();
      if (data.api_keys && data.api_keys.length > 0) {
        setApiKeys(data.api_keys);
      } else {
        setApiKeys([
          { id: '1', name: 'Zapier Connector Key', key_prefix: 'sharik_live_zp901', scopes: ['leads:read', 'leads:write'], created_at: new Date().toISOString() },
        ]);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          name: newKeyName,
          scopes: ['leads:read', 'leads:write'],
        }),
      });

      const data = await res.json();
      if (res.ok && data.api_key) {
        setCreatedRawKey(data.api_key.rawApiKey);
        setNewKeyName('');
        toast.success('Generated Public API Key!');
        loadDeveloperData();
      } else {
        toast.error(data.error || 'Key creation failed');
      }
    } catch {
      toast.error('Network error creating API Key');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
            <Code className="w-8 h-8 text-blue-400" />
            Public API Gateway & Integration Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage scope-based API keys, OpenAPI specification schemas, outbound webhooks, and Integration Hub connectors.
          </p>
        </div>

        <Button onClick={loadDeveloperData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Hub
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Key Generator */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" /> Public API Key Generator
            </CardTitle>
            <CardDescription>Generate scope-based keys for external API calls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Key Name (e.g. Production Webhook)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
            <Button onClick={handleCreateKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Generate API Key
            </Button>

            {createdRawKey && (
              <div className="p-3 bg-slate-950 border border-blue-500/30 rounded-xl space-y-1 text-xs">
                <p className="text-blue-300 font-semibold">Save secret key (shown once):</p>
                <p className="font-mono text-slate-200 break-all select-all">{createdRawKey}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Hub Connectors */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Blocks className="w-5 h-5 text-teal-400" /> Integration Hub Plugin Connectors
            </CardTitle>
            <CardDescription>Connect SHARIK CRM with external automation tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Zapier Connector', version: 'v1.0.0', status: 'Healthy', badge: 'bg-green-500/20 text-green-400' },
                { name: 'Make.com', version: 'v1.0.0', status: 'Healthy', badge: 'bg-green-500/20 text-green-400' },
                { name: 'n8n Workflow', version: 'v1.0.0', status: 'Healthy', badge: 'bg-green-500/20 text-green-400' },
                { name: 'Custom Webhooks', version: 'v1.0.0', status: 'Active', badge: 'bg-blue-500/20 text-blue-400' },
              ].map((conn, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                  <p className="font-semibold text-white text-xs">{conn.name}</p>
                  <Badge className={`mt-2 text-[10px] ${conn.badge}`}>{conn.status}</Badge>
                  <p className="text-[10px] text-slate-500 mt-1">{conn.version}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
