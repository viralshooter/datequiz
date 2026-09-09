import Link from "next/link";
import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { CONTACT_EMAIL } from "@/config/contact";

export const metadata = { title: "Privacy Policy — Yeslink" };

export default function PrivacyPage() {
  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>

          <Section title="Who we are">
            Yeslink is a service for creating a personalised link inviting someone on a date and
            collecting their answer. We are the data controller for the data described here, and
            you can reach us at{" "}
            <a className="font-semibold text-brand-dark" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </Section>

          <Section title="What we collect from you">
            <ul className="list-disc space-y-1 pl-5">
              <li>Your email address — to notify you when someone answers, and as your account.</li>
              <li>Your first name and Instagram handle, if you enter them, so the invitation looks like it came from you.</li>
              <li>The name of the person you invite and the note you write to them.</li>
              <li>Minimal usage events (which steps were reached) with no advertising or cross-site tracking.</li>
            </ul>
          </Section>

          <Section title="What we collect from the person you invite">
            Only the answers they give: which activities they picked, which days work, and the
            condition they chose. We do not ask them to sign up and we collect no identifying
            information about them.
          </Section>

          <Section title="Why we are allowed to hold it">
            We process this to provide the service you asked for — creating your link, saving the
            answer and emailing it to you — and to take payment where you buy credits. Usage
            events are kept on the basis of our legitimate interest in seeing whether the product
            works.
          </Section>

          <Section title="Who we share it with">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Supabase</strong> — database and authentication.</li>
              <li><strong>Vercel</strong> — application hosting.</li>
              <li><strong>Stripe</strong> — payment processing. We never see your card details.</li>
              <li><strong>Resend</strong> — sending email.</li>
            </ul>
            We do not sell your data and we do not share it for advertising.
          </Section>

          <Section title="How long we keep it">
            Links and answers are kept while your account exists. Ask us to delete your account
            and we remove them, along with the invitations you created.
          </Section>

          <Section title="Your rights">
            You can ask for a copy of your data, ask us to correct it, or ask us to delete it —
            including everything tied to invitations you sent. Write to{" "}
            <a className="font-semibold text-brand-dark" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            and we will respond within 30 days. If you are in the EU or UK you also have the
            right to complain to your local data protection authority.
          </Section>

          <Section title="Cookies">
            We set only what is needed to keep you signed in. There are no advertising or
            analytics cookies.
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
