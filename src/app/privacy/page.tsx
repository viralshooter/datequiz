import Link from "next/link";
import { Nav } from "@/components/Nav";
import { AmbientBackground } from "@/components/AmbientBackground";

export const metadata = { title: "Privacy Policy — Yeslink" };

export default function PrivacyPage() {
  return (
    <div className="relative min-h-dvh text-white">
      <AmbientBackground />
      <div className="relative z-10">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          This is a standard draft, not yet reviewed by a lawyer. It should
          be checked and adapted before a real launch.
        </div>

        <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-neutral-500">Last updated: {new Date().toLocaleDateString("en-US")}</p>

        <Section title="Who we are">
          Yeslink is a service that lets you create a personalized link to
          invite someone on a date and collect their answer.
        </Section>

        <Section title="Data we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Your email, when you create an account or a link (to notify you of answers).</li>
            <li>The name you enter for the person you're inviting.</li>
            <li>The answers given by the invited person (activities picked, days available) — we don't ask her for any identifying data.</li>
            <li>Minimal technical data tied to using the service (e.g. funnel usage events), with no profiling cookies or third-party ad tracking.</li>
          </ul>
        </Section>

        <Section title="Why we collect it">
          To provide the service (generate links, save answers), send you
          email notifications when someone answers, handle any payments,
          and any account-related communication.
        </Section>

        <Section title="Who we share it with">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> — database hosting and authentication.</li>
            <li><strong>Vercel</strong> — application hosting.</li>
            <li><strong>Stripe</strong> — payment processing (we never see or store your card details).</li>
            <li><strong>Resend</strong> — sending notification emails.</li>
          </ul>
          We don't sell or share your data with third parties for marketing purposes.
        </Section>

        <Section title="Retention">
          We keep data for as long as your account stays active, or as
          needed for the purposes above.
        </Section>

        <Section title="Your rights">
          You can request access to, correction of, or deletion of your
          data at any time by writing to the contact address listed on
          the site.
        </Section>

        <Section title="Contact">
          For any questions about this policy, reach us through the channels listed on the site.
        </Section>

        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-brand">
          ← Back to home
        </Link>
      </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-neutral-400">{children}</div>
    </section>
  );
}
