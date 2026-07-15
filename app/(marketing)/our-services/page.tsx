'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  Shield,
  Globe,
  Zap,
  Server,
  Lock,
  Search,
  FileText,
  Users,
  TrendingUp,
  IndianRupee,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const serviceCategories = [
  {
    name: 'Business Registration',
    icon: Building2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    services: [
      { name: 'GST Registration', price: 1499, duration: '3-5 days', popular: true, features: ['GSTIN Application', 'Document Preparation', 'Application Tracking', 'Expert Support'] },
      { name: 'PAN Card Application', price: 299, duration: '7-10 days', features: ['New PAN Application', 'Correction Support', 'Fast Processing'] },
      { name: 'MSME Registration', price: 999, duration: '2-3 days', features: ['Udyam Registration', 'Certificate Generation', 'Renewal Support'] },
      { name: 'FSSAI License', price: 2999, duration: '7-15 days', features: ['Food License Application', 'Document Filing', 'Compliance Guidance'] },
    ],
  },
  {
    name: 'Intellectual Property',
    icon: Shield,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    services: [
      { name: 'Trademark Registration', price: 5999, duration: '6-8 months', popular: true, features: ['Trademark Search', 'Application Filing', 'Hearing Support', 'Registration Certificate'] },
      { name: 'Copyright Registration', price: 2999, duration: '2-4 months', features: ['Copyright Application', 'Document Preparation', 'Certificate'] },
      { name: 'Patent Filing', price: 15999, duration: '2-3 years', features: ['Patent Search', 'Provisional Filing', 'Complete Specification'] },
    ],
  },
  {
    name: 'Web & Hosting',
    icon: Globe,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    services: [
      { name: 'Web Hosting', price: 199, duration: 'per month', popular: true, features: ['10GB SSD Storage', 'Free SSL', 'Unlimited Bandwidth', 'Daily Backups', '24/7 Support'] },
      { name: 'Domain Registration', price: 799, duration: 'per year', features: ['.com/.in/.co.in', 'WHOIS Privacy', 'DNS Management', 'Auto-renewal'] },
      { name: 'SSL Certificate', price: 999, duration: 'per year', features: ['256-bit Encryption', 'Domain Validation', 'Browser Compatibility', '99.9% Uptime'] },
      { name: 'Cloud Server', price: 2499, duration: 'per month', features: ['4GB RAM', '2 vCPU', '80GB SSD', 'Full Root Access'] },
      { name: 'Dedicated Server', price: 9999, duration: 'per month', features: ['32GB RAM', '8 vCPU', '500GB SSD', 'DDoS Protection'] },
    ],
  },
  {
    name: 'Compliance & Filing',
    icon: FileText,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    services: [
      { name: 'GST Filing (Monthly)', price: 1999, duration: 'per month', features: ['GSTR-1 Filing', 'GSTR-3B Filing', 'Reconciliation', 'Expert Review'] },
      { name: 'Income Tax Filing', price: 2999, duration: 'per year', features: ['ITR Preparation', 'Tax Optimization', 'Filing Support', 'Refund Processing'] },
      { name: 'TDS Return Filing', price: 999, duration: 'per quarter', features: ['TDS Return Preparation', 'Form 24Q/26Q', 'Compliance Check'] },
      { name: 'ROC Filing (Annual)', price: 4999, duration: 'per year', features: ['MCA Filing', 'Annual Returns', 'Director Reports'] },
    ],
  },
  {
    name: 'Digital Services',
    icon: Zap,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    services: [
      { name: 'Website Development', price: 19999, duration: 'project', popular: true, features: ['Custom Design', 'Mobile Responsive', 'SEO Optimized', 'CMS Integration', '1 Year Support'] },
      { name: 'E-commerce Setup', price: 49999, duration: 'project', features: ['Online Store', 'Payment Gateway', 'Inventory System', 'Training'] },
      { name: 'Logo Design', price: 2999, duration: 'project', features: ['5 Design Concepts', 'Unlimited Revisions', 'Source Files', 'Brand Guide'] },
      { name: 'SEO Package', price: 7999, duration: 'per month', features: ['Keyword Research', 'On-page SEO', 'Content Strategy', 'Monthly Report'] },
    ],
  },
  {
    name: 'Support & Consulting',
    icon: Users,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    services: [
      { name: 'Business Consultation', price: 4999, duration: 'session', features: ['1-on-1 Consulting', 'Strategy Planning', 'Action Items', 'Follow-up Support'] },
      { name: 'Accounting Setup', price: 9999, duration: 'setup', features: ['Software Setup', 'Chart of Accounts', 'Training', '3 Month Support'] },
      { name: 'HR & Payroll', price: 2999, duration: 'per month', features: ['Payroll Processing', 'Compliance Check', 'Employee Onboarding'] },
    ],
  },
];

const benefits = [
  { icon: Clock, title: 'Fast Turnaround', description: 'Quick processing with real-time tracking' },
  { icon: Headphones, title: 'Dedicated Support', description: 'Expert assistance at every step' },
  { icon: Shield, title: '100% Compliance', description: 'All services legally compliant' },
  { icon: IndianRupee, title: 'Transparent Pricing', description: 'No hidden fees or surprises' },
];

export default function ServicesPage() {
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
              <Link href="/our-services" className="text-sm font-medium text-primary">Services</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
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
              50+ Services Available
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              All Your Business Services,
              <br />
              <span className="gradient-text">One Platform</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              From GST registration to trademark filing, from web hosting to monthly compliance.
              Get everything done with expert support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-y border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services by Category */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {serviceCategories.map((category, categoryIdx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={cn('mb-16 last:mb-0')}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', category.bg)}>
                  <category.icon className={cn('h-6 w-6', category.color)} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.services.length} services available</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.services.map((service, i) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'glass-card p-5 relative group hover:shadow-lg transition-shadow',
                      service.popular && 'ring-2 ring-primary'
                    )}
                  >
                    {service.popular && (
                      <div className="absolute -top-2 right-4">
                        <Badge className="text-[10px] px-2 py-0.5 rounded-full">Popular</Badge>
                      </div>
                    )}
                    <h3 className="font-semibold">{service.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{service.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-muted-foreground">{service.duration}</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <Button
                        variant={service.popular ? 'default' : 'outline'}
                        size="sm"
                        className="mt-5 w-full rounded-xl gap-1"
                      >
                        Get Started
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Need a Custom Service?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            We offer tailored solutions for your unique business needs. Get in touch with our experts.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="gap-2 rounded-xl">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-xl">
                View Pricing Plans
              </Button>
            </Link>
          </div>
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
