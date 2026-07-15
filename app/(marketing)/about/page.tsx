'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Target,
  Heart,
  Users,
  Lightbulb,
  Shield,
  Zap,
  Globe,
  Trophy,
  Clock,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stats = [
  { value: '500+', label: 'Businesses Served' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
  { value: '1M+', label: 'Invoices Generated' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We are on a mission to democratize AI for Indian businesses, making enterprise-grade technology accessible to everyone.' },
  { icon: Heart, title: 'Customer First', description: 'Every feature we build starts with understanding the real challenges Indian business owners face every day.' },
  { icon: Shield, title: 'Trust & Security', description: 'Your data is sacred. We use bank-grade encryption and comply with all Indian data protection regulations.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We constantly push boundaries, integrating the latest AI advances to keep you ahead of the competition.' },
];

const milestones = [
  { year: '2020', title: 'Founded', description: 'Started as a web hosting company serving small businesses in India.' },
  { year: '2021', title: 'Invoice Platform', description: 'Launched GST-compliant invoicing with smart automation features.' },
  { year: '2022', title: 'AI Integration', description: 'Introduced AI-powered lead scoring and customer insights.' },
  { year: '2023', title: 'AI Workforce', description: 'Launched 20+ AI agents for autonomous business operations.' },
  { year: '2024', title: 'Scale', description: 'Serving 500+ businesses with 99.9% uptime and growing.' },
];

const team = [
  { name: 'Rahul Sharma', role: 'Founder & CEO', bio: '15+ years in enterprise software and AI systems.' },
  { name: 'Priya Patel', role: 'CTO', bio: 'Former Google engineer, AI/ML specialist.' },
  { name: 'Amit Kumar', role: 'Head of Product', bio: '10+ years building SaaS products for Indian market.' },
  { name: 'Sneha Gupta', role: 'Head of Customer Success', bio: 'Passionate about helping businesses succeed.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">WebHoster</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/our-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm font-medium text-primary">About</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="gap-2 rounded-xl">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-4 py-1.5 rounded-full">
              Our Story
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              Empowering Indian Businesses
              <br />
              <span className="gradient-text">with AI Technology</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              We started with a simple observation: Indian businesses spend too much time on manual operations.
              Our AI-powered platform changes that.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">Our Mission</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                Making AI Accessible for Every Indian Business
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                While large enterprises have been leveraging AI for years, small and medium businesses in India
                have been left behind. We are changing that by building an affordable, easy-to-use platform
                that brings the power of AI to every business owner.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our AI agents handle everything from lead capture to GST-compliant invoicing, from payment
                follow-ups to business intelligence. So you can focus on what you do best: growing your business.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 premium-shadow"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: 'AI-Powered', desc: '20+ Intelligent Agents' },
                  { icon: Globe, label: 'Indian First', desc: 'GST & Compliance Built-in' },
                  { icon: Users, label: 'Customer Focus', desc: '500+ Happy Businesses' },
                  { icon: Trophy, label: 'Industry Leader', desc: '99.9% Uptime' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-muted/30">
                    <item.icon className="h-6 w-6 text-primary mb-2" />
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Our Values</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              What We Believe In
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Our Journey</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Milestones Along the Way
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/60 -translate-x-1/2" />
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative flex items-center gap-8 mb-8 last:mb-0',
                  i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                )}
              >
                <div className={cn('flex-1', i % 2 === 0 ? 'text-right' : 'text-left')}>
                  <div className={cn('glass-card p-6 inline-block', i % 2 === 0 ? 'ml-auto' : 'mr-auto')}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{milestone.year}</span>
                    </div>
                    <h3 className="font-semibold">{milestone.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Our Team</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              The People Behind the Platform
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-xs text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Join Our Mission
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              We are always looking for talented individuals who share our vision of empowering Indian businesses.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2 rounded-xl">
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="rounded-xl">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">WebHoster</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered business operating system for Indian businesses.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/our-services" className="hover:text-foreground transition-colors">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>2024 WebHoster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
