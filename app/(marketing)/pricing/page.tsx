'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Building2,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for freelancers and small teams getting started',
    price: { monthly: 999, annual: 799 },
    period: 'per month',
    cta: 'Start Free Trial',
    popular: false,
    features: [
      { name: 'Up to 100 invoices/month', included: true },
      { name: 'Up to 50 customers', included: true },
      { name: '5 AI Agents', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'GST Compliance', included: true },
      { name: 'Email Support', included: true },
      { name: ' WhatsApp Integration', included: false },
      { name: 'Customer Portal', included: false },
      { name: 'API Access', included: false },
      { name: 'Custom Workflows', included: false },
    ],
  },
  {
    name: 'Professional',
    description: 'For growing businesses with more operational needs',
    price: { monthly: 2999, annual: 2399 },
    period: 'per month',
    cta: 'Start Free Trial',
    popular: true,
    features: [
      { name: 'Unlimited invoices', included: true },
      { name: 'Unlimited customers', included: true },
      { name: '15 AI Agents', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'GST Compliance', included: true },
      { name: 'Priority Support', included: true },
      { name: 'WhatsApp Integration', included: true },
      { name: 'Customer Portal', included: true },
      { name: 'API Access', included: true },
      { name: 'Custom Workflows', included: false },
    ],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom requirements',
    price: { monthly: 9999, annual: 7999 },
    period: 'per month',
    cta: 'Contact Sales',
    popular: false,
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'All 20+ AI Agents', included: true },
      { name: 'Custom AI Training', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: '24/7 Phone Support', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'On-premise Deployment', included: true },
      { name: 'SLA Guarantee', included: true },
      { name: 'Custom Workflows', included: true },
    ],
  },
];

const faqs = [
  {
    question: 'What happens after my free trial ends?',
    answer: 'After 14 days, you can subscribe to any plan to continue. Your data is preserved for 30 days. If you subscribe within that period, all your data is restored automatically.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade anytime. Upgrades take effect immediately, and downgrades apply at the next billing cycle. Pro-rated credits are applied automatically.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and wallet payments through Razorpay. For enterprise plans, we also support invoice-based billing.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-grade encryption, regular security audits, and comply with Indian data protection regulations. Your data remains in India-based servers.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 7-day money-back guarantee on monthly plans and 14-day on annual plans. No questions asked.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, there are no lock-in periods. You can cancel anytime from your dashboard. Your access continues until the end of your billing period.',
  },
];

const comparePlans = [
  { feature: 'Invoices per month', starter: '100', professional: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Customers', starter: '50', professional: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'AI Agents', starter: '5', professional: '15', enterprise: 'All 20+' },
  { feature: 'Team Members', starter: '2', professional: '10', enterprise: 'Unlimited' },
  { feature: 'Reports & Analytics', starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
  { feature: 'WhatsApp Integration', starter: false, professional: true, enterprise: true },
  { feature: 'Customer Portal', starter: false, professional: true, enterprise: true },
  { feature: 'API Access', starter: false, professional: true, enterprise: true },
  { feature: 'Custom Integrations', starter: false, professional: false, enterprise: true },
  { feature: 'On-premise Option', starter: false, professional: false, enterprise: true },
  { feature: 'SLA Guarantee', starter: false, professional: false, enterprise: true },
  { feature: 'Support', starter: 'Email', professional: 'Priority', enterprise: '24/7 + Dedicated' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

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
              <Link href="/pricing" className="text-sm font-medium text-primary">Pricing</Link>
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
              14-Day Free Trial. No Credit Card Required.
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include GST-compliant invoicing, AI-powered automation, and expert support.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span className={cn('text-sm', !annual && 'font-medium')}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                annual ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                  annual ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
            <span className={cn('text-sm', annual && 'font-medium')}>
              Annual
              <Badge variant="outline" className="ml-2 text-[10px] px-2 py-0.5">Save 20%</Badge>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'glass-card p-6 relative',
                  plan.popular && 'ring-2 ring-primary scale-105'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full px-4">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    {annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground"> {plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/dashboard'}>
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

      {/* Feature Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold">Compare Plans</h2>
            <p className="mt-2 text-muted-foreground">See what is included in each plan</p>
          </motion.div>

          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-4 text-sm font-semibold">Feature</th>
                  <th className="text-center p-4 text-sm font-semibold">Starter</th>
                  <th className="text-center p-4 text-sm font-semibold bg-primary/5">
                    <Badge className="mb-1">Popular</Badge>
                    <br />Professional
                  </th>
                  <th className="text-center p-4 text-sm font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparePlans.map((row, i) => (
                  <tr key={row.feature} className={cn('border-b border-border/40', i % 2 === 0 && 'bg-muted/20')}>
                    <td className="p-4 text-sm">{row.feature}</td>
                    <td className="text-center p-4 text-sm">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground/50 inline" />
                      ) : row.starter}
                    </td>
                    <td className="text-center p-4 text-sm bg-primary/5">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground/50 inline" />
                      ) : row.professional}
                    </td>
                    <td className="text-center p-4 text-sm">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <Check className="h-4 w-4 text-success inline" /> : <X className="h-4 w-4 text-muted-foreground/50 inline" />
                      ) : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold">Frequently Asked Questions</h2>
          </motion.div>

          <TooltipProvider>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 rounded-xl">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-xl">
                Talk to Sales
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
