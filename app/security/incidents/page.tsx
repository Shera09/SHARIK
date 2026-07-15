'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Clock,
  User,
  Building,
  Filter,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description: string | null;
  incident_type: string;
  severity: string;
  status: string;
  phase: string;
  detected_at: string;
  assigned_to: string | null;
  impact_scope: string | null;
  affected_systems: string[] | null;
}

const severityConfig = {
  critical: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertCircle, label: 'Critical' },
  high: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: AlertTriangle, label: 'High' },
  medium: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle, label: 'Medium' },
  low: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: Shield, label: 'Low' },
};

const statusConfig = {
  open: { color: 'bg-blue-500/10 text-blue-600', label: 'Open' },
  investigating: { color: 'bg-purple-500/10 text-purple-600', label: 'Investigating' },
  contained: { color: 'bg-yellow-500/10 text-yellow-600', label: 'Contained' },
  resolved: { color: 'bg-green-500/10 text-green-600', label: 'Resolved' },
  closed: { color: 'bg-gray-500/10 text-gray-600', label: 'Closed' },
};

const phaseConfig = {
  detection: 'Detection',
  classification: 'Classification',
  assignment: 'Assignment',
  investigation: 'Investigation',
  containment: 'Containment',
  recovery: 'Recovery',
  post_incident: 'Post-Incident',
  closed: 'Closed',
};

const incidentTypes = [
  { value: 'security_breach', label: 'Security Breach' },
  { value: 'data_leak', label: 'Data Leak' },
  { value: 'malware', label: 'Malware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'dos_attack', label: 'DoS Attack' },
  { value: 'insider_threat', label: 'Insider Threat' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'vulnerability', label: 'Vulnerability' },
  { value: 'other', label: 'Other' },
];

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Incident Management"
        description="Track, investigate, and resolve security incidents"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                New Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
                <DialogDescription>
                  Create a new security incident for investigation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input className="mt-1.5" placeholder="Brief description of the incident" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea className="mt-1.5" placeholder="Detailed description of the incident..." rows={4} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setCreateDialogOpen(false)}>Create Incident</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Incidents</p>
              <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="mt-1 text-2xl font-bold">{stats.open}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investigating</p>
              <p className="mt-1 text-2xl font-bold">{stats.investigating}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Search className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="contained">Contained</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Incidents List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 space-y-3"
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))
        ) : filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map((incident, i) => {
            const severity = severityConfig[incident.severity as keyof typeof severityConfig] || severityConfig.medium;
            const status = statusConfig[incident.status as keyof typeof statusConfig] || statusConfig.open;
            const SeverityIcon = severity.icon;

            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    incident.severity === 'critical' && "bg-red-500",
                    incident.severity === 'high' && "bg-orange-500",
                    incident.severity === 'medium' && "bg-yellow-500",
                    incident.severity === 'low' && "bg-green-500"
                  )} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          severity.color
                        )}>
                          <SeverityIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{incident.incident_number}</span>
                            <Badge variant="outline" className={cn("text-xs", severity.color)}>
                              {severity.label}
                            </Badge>
                          </div>
                          <CardTitle className="mt-1 text-base">{incident.title}</CardTitle>
                        </div>
                      </div>
                      <Badge className={cn("capitalize", status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {new Date(incident.detected_at).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 capitalize">
                          <ArrowRight className="h-4 w-4" />
                          {phaseConfig[incident.phase as keyof typeof phaseConfig]}
                        </span>
                        {incident.assigned_to && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            Assigned
                          </span>
                        )}
                        {incident.impact_scope && (
                          <span className="flex items-center gap-1.5 capitalize">
                            <Building className="h-4 w-4" />
                            {incident.impact_scope.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </AppShell>
  );
}
