'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Search,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    name: 'Getting Started',
    faqs: [
      {
        question: 'What is WebHoster and how does it work?',
        answer: 'WebHoster is an AI-powered business operating system designed specifically for Indian businesses. It combines invoicing, GST compliance, customer management, and AI automation into one platform. Our 20+ AI agents handle everything from lead capture to payment follow-ups, so you can focus on growing your business.',
      },
      {
        question: 'How do I sign up for WebHoster?',
        answer: 'Simply click the "Get Started" or "Start Free Trial" button on any page. You will be asked to provide basic business information, and you can start using the platform immediately. No credit card required for the 14-day free trial.',
      },
      {
        question: 'Do I need technical knowledge to use WebHoster?',
        answer: 'Not at all. WebHoster is designed to be user-friendly. If you can use email, you can use WebHoster. Our AI agents handle the technical work, and our support team is always available to help.',
      },
      {
        question: 'Can I import my existing data into WebHoster?',
        answer: 'Yes, we support importing data from Excel, CSV, and most accounting software. Our team can help you migrate your customers, invoices, and other data during onboarding.',
      },
    ],
  },
  {
    name: 'Pricing & Billing',
    faqs: [
      {
        question: 'Is there a free trial?',
        answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required. You can explore the platform and see if it fits your needs before committing.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards, UPI, net banking, and wallet payments through Razorpay. For enterprise plans, we also support invoice-based billing with NET 30 terms.',
      },
      {
        question: 'Can I change my plan later?',
        answer: 'Yes, you can upgrade or downgrade your plan anytime from your dashboard. Upgrades take effect immediately, and downgrades apply from the next billing cycle. Pro-rated credits are applied automatically.',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'Yes, we offer a 7-day money-back guarantee on monthly plans and 14-day on annual plans. If you are not satisfied, contact support for a full refund.',
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No. The price you see is what you pay. All features listed in your plan are included. There are no setup fees, transaction fees, or hidden charges.',
      },
    ],
  },
  {
    name: 'GST & Compliance',
    faqs: [
      {
        question: 'Is WebHoster GST-compliant?',
        answer: 'Yes, WebHoster is built from the ground up for Indian businesses. All invoices are GST-compliant with proper formatting, HSN/SAC codes, and tax calculations. We support CGST, SGST, and IGST automatically based on your customer location.',
      },
      {
        question: 'Can WebHoster file my GST returns?',
        answer: 'WebHoster generates GSTR-1 and GSTR-3B ready reports that you can download and file. We do not file directly on your behalf, but our reports are formatted exactly as per government requirements.',
      },
      {
        question: 'What GST rates are supported?',
        answer: 'We support all Indian GST rates: 0%, 5%, 12%, 18%, and 28%. You can set different rates for different services, and the system automatically calculates the correct GST based on the rate and customer location.',
      },
      {
        question: 'How does WebHoster handle reverse charge?',
        answer: 'Yes, WebHoster supports reverse charge mechanism for applicable services. You can mark specific transactions as reverse charge, and the invoice will be generated accordingly.',
      },
    ],
  },
  {
    name: 'AI Agents & Automation',
    faqs: [
      {
        question: 'What can AI agents do?',
        answer: 'Our 20+ AI agents handle various tasks: Lead Scoring Agent qualifies leads, Invoice Agent generates GST-compliant invoices, Payment Agent sends reminders via WhatsApp/email, Support Agent handles customer queries, Report Agent generates business insights, and many more. Each agent works autonomously based on your configured rules.',
      },
      {
        question: 'Do I need to train the AI agents?',
        answer: 'No, our AI agents come pre-trained for Indian business contexts. However, you can customize their behavior, set priority rules, and define workflows to match your specific needs.',
      },
      {
        question: 'Can I turn off AI agents?',
        answer: 'Yes, every AI agent can be enabled or disabled individually from your dashboard. You have full control over which automations run and when.',
      },
      {
        question: 'How accurate are the AI agents?',
        answer: 'Our AI agents have over 95% accuracy for standard tasks like invoice generation, payment reminders, and lead scoring. For complex decisions, the system always includes human review options.',
      },
    ],
  },
  {
    name: 'Security & Data',
    faqs: [
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use bank-grade AES-256 encryption for all data, both in transit and at rest. Our servers are located in India-based data centers, and we comply with all Indian data protection regulations.',
      },
      {
        question: 'Where is my data stored?',
        answer: 'All data is stored in secure data centers located in India. This ensures compliance with data localization requirements and provides faster access for Indian users.',
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes, you can export all your data anytime in Excel, CSV, or PDF formats. We believe your data belongs to you, and you should be able to access it whenever you need.',
      },
      {
        question: 'Do you share my data with third parties?',
        answer: 'Never. We do not sell or share your data with any third parties. Your business data remains completely private and secure.',
      },
    ],
  },
  {
    name: 'Support',
    faqs: [
      {
        question: 'How can I contact support?',
        answer: 'You can reach us via email at support@webhoster.io, WhatsApp at +91 98765 43210, or through the live chat in your dashboard. Our support team is available Monday to Saturday, 9 AM to 6 PM IST.',
      },
      {
        question: 'Do you offer onboarding support?',
        answer: 'Yes, all plans include onboarding support. Professional and Enterprise plans include scheduled onboarding calls with our team to help you set up your account and configure everything correctly.',
      },
      {
        question: 'Is there documentation available?',
        answer: 'Yes, we have comprehensive documentation covering all features. You will also find video tutorials, FAQs, and step-by-step guides in our Knowledge Base.',
      },
      {
        question: 'What if I need help outside support hours?',
        answer: 'Our AI Assistant is available 24/7 to answer common questions and guide you through the platform. For urgent issues outside hours, Enterprise customers have access to emergency support.',
      },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const allFaqs = faqCategories.flatMap((cat) =>
    cat.faqs.map((faq) => ({ ...faq, category: cat.name }))
  );

  const filteredFaqs = search
    ? allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
              Help Center
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              Frequently Asked
              <br />
              <span className="gradient-text">Questions</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about WebHoster. If you do not find what you are looking for, contact our support team.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for answers..."
              className="h-12 pl-11 rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-6 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: MessageSquare, label: 'Live Chat', href: '/contact' },
              { icon: Phone, label: '+91 22 4567 8900', href: 'tel:+912245678900' },
              { icon: Mail, label: 'support@webhoster.io', href: 'mailto:support@webhoster.io' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Results */}
          {filteredFaqs ? (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &quot;{search}&quot;
              </p>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, i) => {
                    const id = `search-${i}`;
                    const isOpen = openItems.includes(id);
                    return (
                      <div key={id} className="glass-card overflow-hidden">
                        <button
                          onClick={() => toggleItem(id)}
                          className="w-full p-5 text-left flex items-start justify-between gap-4"
                        >
                          <div>
                            <Badge variant="outline" className="mb-2 text-[10px]">{faq.category}</Badge>
                            <p className="font-medium">{faq.question}</p>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* By Category */
            <div className="space-y-12">
              {faqCategories.map((category, catIdx) => (
                <div key={category.name}>
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {category.name}
                  </h2>
                  <div className="space-y-3">
                    {category.faqs.map((faq, i) => {
                      const id = `${catIdx}-${i}`;
                      const isOpen = openItems.includes(id);
                      return (
                        <div key={id} className="glass-card overflow-hidden">
                          <button
                            onClick={() => toggleItem(id)}
                            className="w-full p-5 text-left flex items-start justify-between gap-4"
                          >
                            <p className="font-medium">{faq.question}</p>
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                                isOpen && 'rotate-180'
                              )}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl font-bold">Still Have Questions?</h2>
            <p className="mt-2 text-muted-foreground">
              Our support team is here to help you with any questions.
            </p>
            <Link href="/contact">
              <Button className="mt-6 rounded-xl gap-2">
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
