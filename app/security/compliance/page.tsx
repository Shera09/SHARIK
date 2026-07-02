'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Shield,
  Calendar,
  TrendingUp,
  ArrowRight,
  Building,
  Globe,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ComplianceFramework {
  id: string;
  name: string;
  display_name: string;
  description: string;
  framework_type: string;
  jurisdiction: string;
  requirements: Array<{ id: string; title: string }>;
  controls: Array<{ id: string; title: string }>;
  assessment_frequency: string;
  is_active: boolean;
}

interface Assessment {
  id: string;
  framework_id: string;
  assessment_date: string;
  compliance_score: number;
  overall_status: string;
  controls_assessed: number;
  controls_passed: number;
  controls_failed: number;
}

const frameworkIcons: Record<string, typeof Shield> = {
  gdpr: Shield,
  soc2: FileCheck,
  iso27001: CheckCircle2,
  pci_dss: Shield,
  hipaa: FileCheck,
  sox: Shield,
};

const statusColors = {
  compliant: 'bg-green-500/10 text-green-600 border-green-500/20',
  non_compliant: 'bg-red-500/10 text-red-600 border-red-500/20',
  partial: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  pending_review: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  exempt: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);

  useEffect(() => {
    loadComplianceData();
  }, []);

  async function loadComplianceData() {
    try {
      const [fwData, assessData] = await Promise.all([
        supabase.from('compliance_frameworks').select('*').eq('is_active', true),
        supabase.from('compliance_assessments').select('*').order('assessment_date', { ascending: false }),
      ]);

      setFrameworks(fwData.data || []);
      setAssessments(assessData.data || []);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getLatestAssessment = (frameworkId: string) => {
    return assessments.find(a => a.framework_id === frameworkId);
  };

  const overallCompliance = frameworks.length > 0
    ? Math.round(
        frameworks.reduce((sum, fw) => {
          const assessment = getLatestAssessment(fw.id);
          return sum + (assessment?.compliance_score || 0);
        }, 0) / frameworks.length
      )
    : 0;

  return (
    <AppShell>
      <PageHeader
        title="Compliance Management"
        description="Monitor regulatory compliance and manage assessments"
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
              <TrendingUp className="h-3 w-3" />
              {overallCompliance}% Compliant
            </Badge>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Assessment
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Compliance</p>
              <p className="mt-1 text-3xl font-bold">{overallCompliance}%</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90 transform">
                <circle cx="32" cy="32" r="28" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={overallCompliance >= 80 ? 'hsl(142 71% 45%)' : overallCompliance >= 60 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${overallCompliance * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{frameworks.length} frameworks tracked</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Compliant Frameworks</p>
              <p className="mt-1 text-2xl font-bold">
                {frameworks.filter(fw => {
                  const assess = getLatestAssessment(fw.id);
                  return assess && assess.overall_status === 'compliant';
                }).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className="mt-3 text-xs text-green-600">Fully compliant</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="mt-1 text-2xl font-bold">
                {assessments.filter(a => a.overall_status === 'pending_review').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <p className="mt-3 text-xs text-yellow-600">Awaiting review</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Findings</p>
              <p className="mt-1 text-2xl font-bold">3</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="mt-3 text-xs text-orange-600">Requires action</p>
        </motion.div>
      </div>

      {/* Frameworks List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <h3 className="font-display text-base font-semibold mb-4">Compliance Frameworks</h3>

        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl shimmer" />
            ))
          ) : (
            frameworks.map((framework, i) => {
              const Icon = frameworkIcons[framework.framework_type] || Shield;
              const assessment = getLatestAssessment(framework.id);
              const score = assessment?.compliance_score || 0;
              const status = assessment?.overall_status || 'pending_review';

              return (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{framework.display_name}</CardTitle>
                              <Badge variant="outline" className="text-xs uppercase">
                                {framework.jurisdiction}
                              </Badge>
                            </div>
                            <CardDescription className="mt-1">
                              {framework.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{score}%</div>
                          <Badge className={cn("mt-1", statusColors[status as keyof typeof statusColors])}>
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <Progress value={score} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground">
                          {assessment?.controls_passed || 0}/{assessment?.controls_assessed || framework.controls?.length || 0} controls
                        </span>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details" className="border-0">
                          <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                            View Requirements & Controls
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div>
                                <h4 className="text-sm font-medium mb-3">Requirements ({framework.requirements?.length || 0})</h4>
                                <div className="space-y-2">
                                  {(framework.requirements || []).slice(0, 5).map((req, idx) => (
                                    <div key={req.id || idx} className="flex items-start gap-2 text-sm">
                                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                                      <span className="text-muted-foreground">{req.title}</span>
                                    </div>
                                  ))}
                                  {(framework.requirements?.length || 0) > 5 && (
                                    <Button variant="ghost" size="sm" className="w-full text-xs">
                                      View all {framework.requirements?.length} requirements
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-3">Controls ({framework.controls?.length || 0})</h4>
                                <div className="space-y-2">
                                  {(framework.controls || []).slice(0, 5).map((ctrl, idx) => (
                                    <div key={ctrl.id || idx} className="flex items-start gap-2 text-sm">
                                      <Shield className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                                      <span className="text-muted-foreground">{ctrl.title}</span>
                                    </div>
                                  ))}
                                  {(framework.controls?.length || 0) > 5 && (
                                    <Button variant="ghost" size="sm" className="w-full text-xs">
                                      View all {framework.controls?.length} controls
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Globe className="h-4 w-4" />
                            {framework.jurisdiction}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {framework.assessment_frequency} assessments
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          Run Assessment
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
