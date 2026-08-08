import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — WebHoster AI',
  description: 'Terms governing your use of the WebHoster AI platform.',
};

export default function TermsPage() {
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: July 2026</p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the WebHoster AI platform, you agree to these
              Terms of Service. If you do not agree, you may not access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Your Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login
              credentials and for all activity under your account. You must be at least
              18 years old to use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Acceptable Use</h2>
            <p>
              You agree not to use the platform for unlawful activities, to upload malicious
              content, to attempt unauthorized access, or to interfere with the service&apos;s
              operation. Violations may result in immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Subscriptions &amp; Billing</h2>
            <p>
              Paid plans are billed on a recurring basis. You may cancel at any time. Refunds
              are issued at our discretion per the plan&apos;s cancellation policy. Price
              changes are communicated at least 30 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              The platform, including its design, code, and branding, is owned by WebHoster AI.
              You retain full ownership of the data you enter into the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              The service is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for indirect, incidental, or consequential damages arising from your use
              of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
            <p>
              Questions about these terms? Email
              <a href="mailto:support@webhoster.ai" className="text-primary hover:underline"> support@webhoster.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
