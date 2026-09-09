import Link from "next/link";
import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { PRICING_PACKAGES } from "@/config/pricing";
import { CONTACT_EMAIL } from "@/config/contact";

export const metadata = { title: "Terms of Service — Yeslink" };

export default function TermsPage() {
  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-2xl font-extrabold">Terms of Service</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>

          <Section title="The service">
            Yeslink lets you create a personalised link inviting someone on a date and collect
            their answer. The first link is free. Beyond that, you buy credits.
          </Section>

          <Section title="Accounts">
            You can create your first link without signing up. Confirming your email turns that
            into a real account, which is what makes your links reachable from any device — and
            it is required before any purchase, so that what you pay for cannot be stranded in a
            single browser.
          </Section>

          <Section title="Credits and pricing">
            Every account gets 1 free credit (1 link). Additional credits are sold in the
            packages listed on the site:{" "}
            {PRICING_PACKAGES.map((p) => `${p.label} (${p.priceLabel})`).join(", ")}. Prices are
            in US dollars. Credits do not expire.
          </Section>

          <Section title="Payments">
            Payments are processed by Stripe. We never receive or store your card details.
          </Section>

          <Section title="Refunds and your right to withdraw">
            Unused credits can be refunded within 14 days of purchase — write to{" "}
            <a className="font-semibold text-brand-dark" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            and we will return the unused portion.
            <br />
            <br />
            Credits are digital content delivered immediately. Spending a credit on a link asks
            us to begin performance straight away, which ends the statutory right of withdrawal
            for that particular credit. Credits you have not spent stay refundable for the full
            14 days.
          </Section>

          <Section title="Acceptable use">
            Yeslink is for inviting someone who already knows you and is happy to hear from you.
            You agree not to use it to contact people who have not consented to hear from you, to
            impersonate anyone, or to send offensive, harassing or illegal content. We may
            suspend accounts that do.
          </Section>

          <Section title="Availability">
            We aim to keep the service running but do not guarantee uninterrupted availability,
            nor that an answer will arrive within any particular time. We are not responsible for
            what happens between you and the person you invite.
          </Section>

          <Section title="Changes">
            We may update these terms. Material changes will be announced on the site, and the
            date above will change.
          </Section>

          <Section title="Contact">
            <a className="font-semibold text-brand-dark" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
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
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-neutral-600">{children}</div>
    </section>
  );
}
