'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Search,
  Filter,
  Plus,
  Star,
  Users,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Video,
  DollarSign,
  FileText,
  Users as UsersIcon,
  Shield,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Database,
  Brain,
  CreditCard,
  ShoppingCart,
  Truck,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MarketplaceListing {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  icon: string;
  popularity: number;
  install_count: number;
  is_installed: boolean;
  features: string[];
}

const categoryFilters = [
  { value: 'all', label: 'All Connectors' },
  { value: 'communication', label: 'Communication' },
  { value: 'payment', label: 'Payments' },
  { value: 'document', label: 'Documents' },
  { value: 'identity', label: 'Identity' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'search', label: 'Search & AI' },
];

const categoryColors: Record<string, string> = {
  communication: 'from-blue-500/20 to-cyan-500/20',
  payment: 'from-green-500/20 to-emerald-500/20',
  document: 'from-orange-500/20 to-amber-500/20',
  identity: 'from-purple-500/20 to-violet-500/20',
  accounting: 'from-rose-500/20 to-pink-500/20',
  productivity: 'from-indigo-500/20 to-blue-500/20',
  marketing: 'from-teal-500/20 to-cyan-500/20',
  search: 'from-pink-500/20 to-rose-500/20',
};

const iconMap: Record<string, typeof Globe> = {
  whatsapp: MessageSquare,
  email: Mail,
  sms: Phone,
  voice: Phone,
  video: Video,
  razorpay: DollarSign,
  stripe: CreditCard,
  paypal: DollarSign,
  googledrive: Database,
  docusign: FileText,
  adobesign: FileText,
  oauth: Shield,
  oidc: Shield,
  googleworkspace: Globe,
  microsoft365: Globe,
  tally: BarChart3,
  quickbooks: BarChart3,
  zohobooks: BarChart3,
  calendar: Calendar,
  slack: MessageSquare,
  zoom: Video,
  facebookads: TrendingUp,
  googleads: TrendingUp,
  mailchimp: Mail,
  pinecone: Database,
  elasticsearch: Database,
};

const connectors: MarketplaceListing[] = [
  // Communication
  { id: 'whatsapp', name: 'WhatsApp Business', category: 'communication', provider: 'Meta', description: 'Send and receive WhatsApp messages, templates, and business APIs', icon: 'whatsapp', popularity: 98, install_count: 12500, is_installed: true, features: ['Message sending', 'Templates', 'Media support', 'Webhooks'] },
  { id: 'email', name: 'Email (SMTP/IMAP)', category: 'communication', provider: 'Generic', description: 'Connect to any email provider via SMTP/IMAP protocols', icon: 'email', popularity: 95, install_count: 9800, is_installed: true, features: ['Send emails', 'Receive emails', 'Attachments', 'Templates'] },
  { id: 'sms', name: 'SMS Gateway', category: 'communication', provider: 'Multi-Provider', description: 'Send SMS via Twilio, MSG91, or custom gateways', icon: 'sms', popularity: 88, install_count: 7600, is_installed: false, features: ['SMS sending', 'OTP delivery', 'Bulk SMS', 'Delivery reports'] },
  { id: 'voice', name: 'Voice Calling', category: 'communication', provider: 'Twilio', description: 'Programmable voice calls and IVR workflows', icon: 'voice', popularity: 72, install_count: 3200, is_installed: false, features: ['Outbound calls', 'IVR', 'Recording', 'Transcription'] },
  // Payment
  { id: 'razorpay', name: 'Razorpay', category: 'payment', provider: 'Razorpay', description: 'Accept payments, manage subscriptions, and payouts', icon: 'razorpay', popularity: 96, install_count: 11200, is_installed: true, features: ['Payment links', 'Subscriptions', 'Payouts', 'Webhooks'] },
  { id: 'stripe', name: 'Stripe', category: 'payment', provider: 'Stripe', description: 'Global payment processing with 135+ currencies', icon: 'stripe', popularity: 94, install_count: 10500, is_installed: false, features: ['Cards', 'Bank transfers', 'Subscriptions', 'Invoicing'] },
  { id: 'paypal', name: 'PayPal', category: 'payment', provider: 'PayPal', description: 'Accept PayPal and card payments globally', icon: 'paypal', popularity: 82, install_count: 5400, is_installed: false, features: ['PayPal checkout', 'Cards', 'Subscriptions', 'Refunds'] },
  // Document
  { id: 'googledrive', name: 'Google Drive', category: 'document', provider: 'Google', description: 'Sync, store, and manage documents in Google Drive', icon: 'googledrive', popularity: 90, install_count: 8900, is_installed: true, features: ['File sync', 'Upload', 'Download', 'Sharing'] },
  { id: 'docusign', name: 'DocuSign', category: 'document', provider: 'DocuSign', description: 'Electronic signatures and document workflows', icon: 'docusign', popularity: 85, install_count: 4200, is_installed: false, features: ['eSignatures', 'Templates', 'Envelopes', 'Status tracking'] },
  { id: 'adobesign', name: 'Adobe Sign', category: 'document', provider: 'Adobe', description: 'Enterprise e-signatures and document management', icon: 'adobesign', popularity: 78, install_count: 2800, is_installed: false, features: ['eSignatures', 'Workflows', 'Audit trails', 'Integration'] },
  // Identity
  { id: 'oauth', name: 'OAuth 2.0', category: 'identity', provider: 'Generic', description: 'Standard OAuth 2.0 authentication provider', icon: 'oauth', popularity: 92, install_count: 9200, is_installed: true, features: ['Authorization', 'Token mgmt', 'Refresh tokens', 'Scopes'] },
  { id: 'googleworkspace', name: 'Google Workspace', category: 'identity', provider: 'Google', description: 'Google Workspace SSO and directory sync', icon: 'googleworkspace', popularity: 88, install_count: 6800, is_installed: true, features: ['SSO', 'Directory sync', 'Groups', 'Admin APIs'] },
  { id: 'microsoft365', name: 'Microsoft 365', category: 'identity', provider: 'Microsoft', description: 'Microsoft 365 integration with Azure AD', icon: 'microsoft365', popularity: 86, install_count: 6200, is_installed: false, features: ['SSO', 'Azure AD', 'Teams', 'SharePoint'] },
  // Accounting
  { id: 'tally', name: 'Tally Connector', category: 'accounting', provider: 'Tally Solutions', description: 'Sync data with Tally ERP for Indian businesses', icon: 'tally', popularity: 84, install_count: 5600, is_installed: false, features: ['Ledger sync', 'Vouchers', 'Masters', 'Reports'] },
  { id: 'quickbooks', name: 'QuickBooks', category: 'accounting', provider: 'Intuit', description: 'Connect to QuickBooks Online for accounting sync', icon: 'quickbooks', popularity: 80, install_count: 4100, is_installed: false, features: ['Invoices', 'Expenses', 'Reports', 'Customers'] },
  { id: 'zohobooks', name: 'Zoho Books', category: 'accounting', provider: 'Zoho', description: 'Zoho Books integration for accounting automation', icon: 'zohobooks', popularity: 76, install_count: 3200, is_installed: false, features: ['Invoices', 'Estimates', 'Expenses', 'Contacts'] },
  // Productivity
  { id: 'calendar', name: 'Calendar Sync', category: 'productivity', provider: 'Multi-Provider', description: 'Sync with Google Calendar, Outlook, and more', icon: 'calendar', popularity: 87, install_count: 7200, is_installed: true, features: ['Events', 'Reminders', 'Availability', 'Rooms'] },
  { id: 'slack', name: 'Slack', category: 'productivity', provider: 'Slack', description: 'Send notifications and interact with Slack channels', icon: 'slack', popularity: 91, install_count: 8400, is_installed: true, features: ['Messages', 'Channels', 'Threads', 'Files'] },
  { id: 'zoom', name: 'Zoom', category: 'productivity', provider: 'Zoom', description: 'Create meetings and manage Zoom recordings', icon: 'zoom', popularity: 83, install_count: 5100, is_installed: false, features: ['Meetings', 'Webinars', 'Recordings', 'Reports'] },
  // Marketing
  { id: 'facebookads', name: 'Facebook Ads', category: 'marketing', provider: 'Meta', description: 'Manage Facebook ad campaigns and audiences', icon: 'facebookads', popularity: 79, install_count: 3800, is_installed: false, features: ['Campaigns', 'Audiences', 'Analytics', 'Leads'] },
  { id: 'googleads', name: 'Google Ads', category: 'marketing', provider: 'Google', description: 'Google Ads campaign management and reporting', icon: 'googleads', popularity: 81, install_count: 4200, is_installed: false, features: ['Campaigns', 'Keywords', 'Reports', 'Conversions'] },
  { id: 'mailchimp', name: 'Mailchimp', category: 'marketing', provider: 'Intuit', description: 'Email marketing automation and list management', icon: 'mailchimp', popularity: 77, install_count: 3400, is_installed: false, features: ['Campaigns', 'Lists', 'Automation', 'Reports'] },
  // Search & AI
  { id: 'pinecone', name: 'Pinecone', category: 'search', provider: 'Pinecone', description: 'Vector database for AI applications', icon: 'pinecone', popularity: 75, install_count: 2100, is_installed: false, features: ['Vector search', 'Indexing', 'Hybrid search', 'Namespace'] },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'search', provider: 'Elastic', description: 'Full-text search and analytics engine', icon: 'elasticsearch', popularity: 82, install_count: 4500, is_installed: false, features: ['Full-text search', 'Aggregations', 'Analytics', 'Kibana'] },
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState<MarketplaceListing | null>(null);
  const [installing, setInstalling] = useState(false);

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedConnectors = filteredConnectors.reduce((acc, connector) => {
    if (!acc[connector.category]) acc[connector.category] = [];
    acc[connector.category].push(connector);
    return acc;
  }, {} as Record<string, MarketplaceListing[]>);

  async function installConnector(connector: MarketplaceListing) {
    setInstalling(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${connector.name} installed successfully`);
    setInstalling(false);
    setSelectedConnector(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Integration Marketplace"
        description="Browse and install connectors for external services"
      />

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search connectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCategoryFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                categoryFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Available', value: connectors.length, icon: Store },
          { label: 'Installed', value: connectors.filter(c => c.is_installed).length, icon: CheckCircle },
          { label: 'Categories', value: categoryFilters.length - 1, icon: Filter },
          { label: 'Total Installs', value: '100K+', icon: Users },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Connectors Grid */}
      {categoryFilter === 'all' ? (
        <div className="space-y-8">
          {Object.entries(groupedConnectors).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4 capitalize">{category}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((connector, i) => {
                  const Icon = iconMap[connector.icon] || Globe;
                  return (
                    <motion.div
                      key={connector.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        onClick={() => setSelectedConnector(connector)}
                      >
                        <div className={cn('h-1 bg-gradient-to-r', categoryColors[connector.category] || 'from-slate-500/20 to-zinc-500/20')} />
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', categoryColors[connector.category])}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-sm">{connector.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">{connector.provider}</p>
                              </div>
                            </div>
                            {connector.is_installed && (
                              <Badge className="bg-green-500/10 text-green-600 text-[10px]">Installed</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{connector.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span>{connector.popularity}%</span>
                            </div>
                            <span>{connector.install_count.toLocaleString()} installs</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredConnectors.map((connector, i) => {
            const Icon = iconMap[connector.icon] || Globe;
            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => setSelectedConnector(connector)}
                >
                  <div className={cn('h-1 bg-gradient-to-r', categoryColors[connector.category])} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', categoryColors[connector.category])}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{connector.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{connector.provider}</p>
                        </div>
                      </div>
                      {connector.is_installed && (
                        <Badge className="bg-green-500/10 text-green-600 text-[10px]">Installed</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{connector.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{connector.popularity}%</span>
                      </div>
                      <span>{connector.install_count.toLocaleString()} installs</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Connector Detail Dialog */}
      <Dialog open={!!selectedConnector} onOpenChange={() => setSelectedConnector(null)}>
        <DialogContent className="max-w-lg">
          {selectedConnector && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br', categoryColors[selectedConnector.category])}>
                    {(() => { const Icon = iconMap[selectedConnector.icon] || Globe; return <Icon className="h-6 w-6" /> })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedConnector.name}</DialogTitle>
                    <DialogDescription>{selectedConnector.provider}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">{selectedConnector.description}</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-lg font-bold">{selectedConnector.popularity}%</p>
                    <p className="text-xs text-muted-foreground">Popularity</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-lg font-bold">{selectedConnector.install_count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Installs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-lg font-bold capitalize">{selectedConnector.category}</p>
                    <p className="text-xs text-muted-foreground">Category</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnector.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-[10px]">{feature}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedConnector(null)}>Cancel</Button>
                <Button
                  onClick={() => installConnector(selectedConnector)}
                  disabled={selectedConnector.is_installed || installing}
                  className="gap-2"
                >
                  {installing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Installing...
                    </>
                  ) : selectedConnector.is_installed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Install
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
