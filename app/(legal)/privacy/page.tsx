import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — WebHoster AI',
  description: 'How WebHoster AI collects, uses, and protects your data.',
};

export default function PrivacyPage() {
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
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: July 2026</p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly when you create an account,
              including your name, email address, phone number, and organization details.
              We also collect business data you enter into the platform such as customers,
              leads, invoices, and tasks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
            <p>
              Your data is used solely to provide the WebHoster AI Business OS features —
              managing your CRM, finance, HR, and analytics. We never sell your data to
              third parties. Aggregated, anonymized metrics may be used to improve our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Data Storage &amp; Security</h2>
            <p>
              All data is stored in encrypted databases with row-level security policies.
              Authentication tokens are managed via Supabase Auth. We use industry-standard
              TLS encryption for data in transit and AES-256 for data at rest.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
            <p>
              Your data is retained for as long as your account is active. You may request
              deletion of your account and associated data at any time. Upon deletion, your
              data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
            <p>
              You have the right to access, export, correct, or delete your personal data.
              Contact us at <a href="mailto:support@webhoster.ai" className="text-primary hover:underline">support@webhoster.ai</a> to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>
              For privacy-related questions, reach out to
              <a href="mailto:support@webhoster.ai" className="text-primary hover:underline"> support@webhoster.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
