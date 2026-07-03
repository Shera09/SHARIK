'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Award,
  Star,
  TrendingUp,
  CreditCard,
  Copy,
  UserPlus,
  Share2,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const loyaltyTiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, members: 4500, color: 'bg-amber-700', icon: '🥉', benefits: ['1x points', 'Birthday reward', 'Member-only offers'] },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, members: 2100, color: 'bg-gray-400', icon: '🥈', benefits: ['1.25x points', '5% discount', 'Priority support', 'Free shipping'] },
  { name: 'Gold', minPoints: 5000, maxPoints: 14999, members: 850, color: 'bg-yellow-500', icon: '🥇', benefits: ['1.5x points', '10% discount', 'VIP events', 'Exclusive deals'] },
  { name: 'Platinum', minPoints: 15000, maxPoints: 99999, members: 125, color: 'bg-gradient-to-r from-purple-400 to-blue-400', icon: '💎', benefits: ['2x points', '15% discount', 'Personal manager', 'Lifetime benefits'] },
];

const referralPrograms = [
  { id: '1', name: 'Customer Referral Program', referrerReward: '500 points', refereeReward: '10% off', requirement: 'First purchase', referrals: 2800, conversions: 1250 },
  { id: '2', name: 'Partner Referral', referrerReward: '₹500 credit', refereeReward: '₹500 off', requirement: 'Partner signup', referrals: 420, conversions: 185 },
  { id: '3', name: 'Ambassador Program', referrerReward: 'Commission 10%', refereeReward: '15% off', requirement: 'First invoice', referrals: 85, conversions: 62 },
];

export default function LoyaltyReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loyalty');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const stats = {
    totalMembers: loyaltyTiers.reduce((sum, t) => sum + t.members, 0),
    totalPointsEarned: 12500000,
    totalPointsRedeemed: 8750000,
    activeReferralPrograms: referralPrograms.length,
    totalReferrals: referralPrograms.reduce((sum, p) => sum + p.referrals, 0),
    conversionRate: Math.round((referralPrograms.reduce((sum, p) => sum + p.conversions, 0) / referralPrograms.reduce((sum, p) => sum + p.referrals, 0)) * 100),
  };

  return (
    <AppShell>
      <PageHeader
        title="Loyalty & Referrals"
        description="Manage loyalty programs, tiers, and referral campaigns"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Loyalty/Referral Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Program Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" className="flex-1"><Gift className="h-4 w-4 mr-2" /> Loyalty</Button>
                    <Button variant="outline" className="flex-1"><Share2 className="h-4 w-4 mr-2" /> Referral</Button>
                  </div>
                </div>
                <div>
                  <Label>Program Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., Customer Rewards" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Referrer Reward</Label>
                    <Input className="mt-1.5" placeholder="e.g., 500 points" />
                  </div>
                  <div>
                    <Label>Referee Reward</Label>
                    <Input className="mt-1.5" placeholder="e.g., 10% off" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Members', value: stats.totalMembers.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Points Earned', value: `${(stats.totalPointsEarned / 1000000).toFixed(1)}M`, icon: Star, color: 'text-yellow-600' },
          { label: 'Points Redeemed', value: `${(stats.totalPointsRedeemed / 1000000).toFixed(1)}M`, icon: Gift, color: 'text-purple-600' },
          { label: 'Referral Programs', value: stats.activeReferralPrograms, icon: Share2, color: 'text-green-600' },
          { label: 'Total Referrals', value: stats.totalReferrals.toLocaleString(), icon: UserPlus, color: 'text-cyan-600' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="loyalty" className="mt-6">
        <TabsList>
          <TabsTrigger value="loyalty"><Gift className="h-4 w-4 mr-2" /> Loyalty Tiers</TabsTrigger>
          <TabsTrigger value="referrals"><Share2 className="h-4 w-4 mr-2" /> Referral Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="loyalty">
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <div className={cn('h-2', tier.color)} />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl">{tier.icon}</span>
                        <p className="font-bold text-lg">{tier.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tier.minPoints.toLocaleString()}+ pts
                      </Badge>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold">{tier.members.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">members</p>
                    </div>

                    <div className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referrals">
          <div className="mt-4 space-y-3">
            {referralPrograms.map((program, i) => (
              <motion.div key={program.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{program.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Referrer: {program.referrerReward}</span>
                          <span>Referee: {program.refereeReward}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-bold">{program.referrals.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Referrals</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{program.conversions.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{Math.round((program.conversions / program.referrals) * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Conv. Rate</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
