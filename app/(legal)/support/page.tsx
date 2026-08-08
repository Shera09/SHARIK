import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, LifeBuoy, Mail, MessageSquare, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support — WebHoster AI',
  description: 'Get help with the WebHoster AI platform.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              Support
            </h1>
            <p className="text-sm text-muted-foreground">We&apos;re here to help</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="mailto:support@webhoster.ai"
            className="glass-card p-5 transition-all hover:premium-shadow"
          >
            <Mail className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold text-sm">Email</p>
            <p className="text-xs text-muted-foreground mt-1">support@webhoster.ai</p>
          </a>
          <a
            href="/contact"
            className="glass-card p-5 transition-all hover:premium-shadow"
          >
            <MessageSquare className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold text-sm">Contact Form</p>
            <p className="text-xs text-muted-foreground mt-1">Send us a message</p>
          </a>
          <a
            href="tel:+918000000000"
            className="glass-card p-5 transition-all hover:premium-shadow"
          >
            <Phone className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold text-sm">Phone</p>
            <p className="text-xs text-muted-foreground mt-1">Mon–Fri, 9am–6pm IST</p>
          </a>
        </div>

        <div className="mt-8 glass-card p-6">
          <h2 className="font-semibold text-base mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">How do I reset my password?</p>
              <p className="mt-1">
                On the login page, click &quot;Forgot password?&quot; and follow the
                instructions sent to your email.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I cancel my subscription?</p>
              <p className="mt-1">
                Yes. You can cancel anytime from Settings → Billing. Access continues until
                the end of the current billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Is my data secure?</p>
              <p className="mt-1">
                Yes. All data is encrypted in transit and at rest, with row-level security
                policies enforced at the database level.
              </p>
            </div>
          </div>
          <Link
            href="/faq"
            className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
          >
            View all FAQs →
          </Link>
        </div>
      </div>
    </div>
  );
}
