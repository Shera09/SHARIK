'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Bot,
  BarChart3,
  MessageSquare,
  FileText,
  CreditCard,
  Check,
  Star,
  Play,
  ChevronRight,
  Building2,
  Globe,
  Headphones,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stats = [
  { value: '500+', label: 'Businesses' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'AI Support' },
  { value: '50K+', label: 'Invoices Processed' },
];

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Operations',
    description: '20+ AI agents handling sales, finance, GST compliance, and customer support autonomously.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileText,
    title: 'Smart Invoice Engine',
    description: 'Auto-generate GST-compliant invoices, quotations, and credit notes with intelligent tax calculations.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Business intelligence dashboards with predictive insights and performance tracking.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'GST Compliance',
    description: 'Built-in HSN/SAC codes, multi-rate GST support, and automated tax reporting.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Customer Portal',
    description: 'Self-service portal for clients to view invoices, make payments, and track services.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integration',
    description: 'Automated messaging for payment reminders, follow-ups, and customer engagement.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

const testimonials = [
  {
    content: 'Reduced our invoicing time by 80%. The AI agents handle everything from lead capture to payment follow-ups.',
    author: 'Rajesh Kumar',
    role: 'CEO, TechStart Solutions',
    rating: 5,
  },
  {
    content: 'Finally, a platform that understands Indian business needs. GST compliance was our biggest headache - now it is automated.',
    author: 'Priya Sharma',
    role: 'Founder, CloudHost India',
    rating: 5,
  },
  {
    content: 'The AI CEO feature gives us insights that would cost lakhs from a consultant. Game changer for small businesses.',
    author: 'Amit Patel',
    role: 'Director, WebServices Pro',
    rating: 5,
  },
];

const trustedCompanies = [
  'TechStart Solutions', 'CloudHost India', 'WebServices Pro', 'DigitalEdge', 'HostMaster', 'NetCore Systems',
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '999',
    period: '/month',
    description: 'Perfect for freelancers and small teams',
    features: ['Up to 100 invoices/month', '5 AI Agents', 'Basic Analytics', 'Email Support', 'GST Compliance'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '2,999',
    period: '/month',
    description: 'For growing businesses with more needs',
    features: ['Unlimited invoices', '15 AI Agents', 'Advanced Analytics', 'Priority Support', 'WhatsApp Integration', 'Customer Portal', 'API Access'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '9,999',
    period: '/month',
    description: 'For large organizations with custom needs',
    features: ['Everything in Professional', 'All 20+ AI Agents', 'Custom Workflows', 'Dedicated Account Manager', 'SLA Guarantee', 'Custom Integrations', 'On-premise Option'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const servicesPreview = [
  { name: 'GST Registration', price: '1,499', icon: Building2 },
  { name: 'Trademark Filing', price: '5,999', icon: Shield },
  { name: 'Web Hosting', price: '199/mo', icon: Globe },
  { name: 'SSL Certificate', price: '999/yr', icon: Zap },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

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
              <Link href="/our-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-mesh">
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-primary/15 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm rounded-full gradient-animate bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-primary/30">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                AI-Powered Business Operating System
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              Run Your Entire Business with
              <br />
              <span className="gradient-text">One AI-Powered Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              From lead capture to GST-compliant invoicing, from payment follow-ups to business intelligence.
              Let 20+ AI agents handle your operations while you focus on growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 rounded-xl h-12 px-8 text-base font-semibold premium-shadow">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 rounded-xl h-12 px-8">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl sm:text-4xl font-bold text-glow">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16"
          >
            <div className="relative rounded-2xl overflow-hidden premium-shadow glass-card">
              <div className="bg-gradient-to-b from-muted/50 to-muted/30 p-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      app.webhoster.io/dashboard
                    </div>
                  </div>
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
                {/* Simulated Dashboard UI */}
                <div className="absolute inset-0 p-4 sm:p-8">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="col-span-2 space-y-4">
                      <div className="flex gap-3">
                        {['Revenue', 'Leads', 'Tasks'].map((label, idx) => (
                          <div key={label} className={cn('flex-1 glass-card p-4', idx === 0 && 'bg-primary/5')}>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="mt-1 text-2xl font-bold">{idx === 0 ? '2.4L' : idx === 1 ? '127' : '43'}</p>
                            <div className={cn('mt-2 text-xs', idx === 0 ? 'text-success' : 'text-muted-foreground')}>
                              +{12 + idx * 3}% this month
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="glass-card p-4 h-40">
                        <p className="text-xs text-muted-foreground mb-2">Revenue Trend</p>
                        <div className="flex items-end gap-1 h-24">
                          {[40, 65, 50, 80, 95, 75, 85, 70, 90, 100, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/50 to-primary/80" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="glass-card p-4 h-32">
                        <p className="text-xs text-muted-foreground mb-2">AI Agents Active</p>
                        <div className="flex items-center justify-center h-16">
                          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center pulse-glow">
                            <Bot className="h-7 w-7 text-success" />
                          </div>
                        </div>
                        <p className="mt-2 text-center text-sm font-medium">14 of 20 Active</p>
                      </div>
                      <div className="glass-card p-4 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <p className="text-xs font-medium">Live Activity</p>
                        </div>
                        <div className="space-y-2">
                          {['Invoice #1247 sent', 'Lead captured', 'Payment received'].map((activity, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-success" />
                              <span className="text-muted-foreground">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools powered by artificial intelligence, designed for Indian businesses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card-hover p-6"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.bg)}>
                  <feature.icon className={cn('h-6 w-6', feature.color)} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Services</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Popular Business Services
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicesPreview.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:shadow-lg transition-shadow"
              >
                <service.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold">{service.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Starting {service.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/our-services">
              <Button variant="outline" className="gap-2 rounded-xl">
                View All Services
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No hidden fees. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'glass-card p-6 relative',
                  plan.popular && 'ring-2 ring-primary'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full px-3">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    className={cn('mt-6 w-full rounded-xl', plan.popular && 'gap-2')}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    {plan.popular && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Loved by Indian Businesses
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 text-center"
              >
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed">{testimonials[activeTestimonial].content}</p>
                <div className="mt-6">
                  <p className="font-semibold">{testimonials[activeTestimonial].author}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[activeTestimonial].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === activeTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading businesses across India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {trustedCompanies.map((company) => (
              <span key={company} className="text-sm font-medium">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
              Ready to Transform Your Business?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of Indian businesses already using AI to automate their operations.
              Start your free trial today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 rounded-xl h-12 px-8">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2 rounded-xl h-12">
                  <Headphones className="h-4 w-4" />
                  Talk to Sales
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
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
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-sm">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>2024 WebHoster. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
