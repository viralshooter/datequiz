import Link from "next/link";
import { Nav } from "@/components/Nav";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PRICING_PACKAGES } from "@/config/pricing";

export const metadata = { title: "Terms of Service — Yeslink" };

export default function TermsPage() {
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

        <h1 className="text-2xl font-extrabold">Terms of Service</h1>
        <p className="mt-1 text-sm text-neutral-500">Last updated: {new Date().toLocaleDateString("en-US")}</p>

        <Section title="The service">
          Yeslink lets you create a personalized link to invite someone on
          a date and collect their answer. The first link is free; use
          beyond the free limit requires purchasing one of the available
          packages.
        </Section>

        <Section title="Accounts and credits">
          Every account gets 1 free credit (1 link). Additional credits are
          purchased through the packages shown on the site:{" "}
          {PRICING_PACKAGES.map((p) => `${p.label} (${p.priceLabel})`).join(", ")}. Credits
          don't expire but aren't refundable once used to create a link.
        </Section>

        <Section title="Payments">
          Payments are handled by Stripe. We don't store your card details.
          If you have an issue with a purchase, contact us: we review
          refunds case by case.
        </Section>

        <Section title="Acceptable use">
          You agree not to use the service to send offensive, harassing,
          illegal content, or to reach people who haven't consented to be
          contacted. We reserve the right to suspend accounts that violate
          these terms.
        </Section>

        <Section title="Limitation of liability">
          The service is provided "as is." We don't guarantee that an
          answer will arrive within a given time, nor are we responsible
          for the interactions that result between users.
        </Section>

        <Section title="Changes">
          We may update these terms over time; material changes will be
          announced on the site.
        </Section>

        <Section title="Contact">
          For questions about these terms, reach us through the channels listed on the site.
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
