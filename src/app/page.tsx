import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AmbientBackground } from "@/components/AmbientBackground";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRICING_PACKAGES } from "@/config/pricing";

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anyone with a real account shouldn't see the "first link free"
  // pitch again: send them straight to their dashboard.
  if (user && user.is_anonymous === false) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-dvh text-white">
      <AmbientBackground />
      <div className="relative z-10">
        <AnnouncementBar />
        <Nav />
        <Hero />
        <BuiltForDatingApps />
        <HowItWorks />
        <TrustBar />
        <Pricing />
        <Faq />
        <Footer />
      </div>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-brand px-4 py-2 text-center text-sm font-bold text-ink">
      🎁 Your first link is free — no card required
    </div>
  );
}

const MINI_STEPS = [
  { emoji: "✍️", label: "Write the link" },
  { emoji: "👀", label: "She answers" },
  { emoji: "📬", label: "You find out instantly" },
];

function Hero() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-16 pt-12 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand">
          For your Hinge, Tinder & Bumble matches
        </span>
        <span className="rounded-full bg-brand px-4 py-1 text-xs font-bold uppercase tracking-widest text-ink">
          🎁 First link free
        </span>
      </div>
      <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
        Turn that match into an actual date
      </h1>
      <p className="mt-5 max-w-lg text-lg text-neutral-400">
        That match you've been texting for two weeks? Drop a Yeslink in the chat instead of
        another "we should hang out sometime." She tries to say no — she literally can't —
        and ends up picking what to do and when.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/create"
          className="rounded-full bg-brand px-8 py-4 text-lg font-bold text-ink shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-transform active:scale-95"
        >
          Create your first Yeslink free →
        </Link>
        <Link
          href="/login"
          className="rounded-full border-2 border-white/15 px-8 py-4 text-lg font-semibold text-white hover:border-white/30"
        >
          I already have an account
        </Link>
      </div>
      <p className="mt-4 text-sm text-neutral-500">No card required. You only pay if you keep using it.</p>

      <p className="mt-8 text-xs uppercase tracking-widest text-neutral-500">
        Works anywhere you can paste a link
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {["Hinge", "Tinder", "Bumble", "Instagram DMs", "iMessage"].map((app) => (
          <span
            key={app}
            className="rounded-full border border-white/10 bg-ink-2/60 px-3 py-1 text-sm font-semibold text-neutral-300"
          >
            {app}
          </span>
        ))}
      </div>

      <div className="mt-12 flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-4">
        {MINI_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-ink-2/60 px-4 py-3">
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-xs font-semibold text-neutral-300">{step.label}</span>
            </div>
            {i < MINI_STEPS.length - 1 && <span className="text-lg text-neutral-600">→</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

const DATING_APP_PROBLEMS = [
  {
    emoji: "🥶",
    problem: "The match goes cold",
    solution:
      "You matched, you chatted, then nothing. A Yeslink restarts it with something she actually has to answer.",
  },
  {
    emoji: "🌀",
    problem: '"We should get drinks sometime"',
    solution:
      "That sentence never becomes a plan. This one ends with an activity and a day already picked.",
  },
  {
    emoji: "🥱",
    problem: "You look like everyone else",
    solution:
      "Her inbox is 20 guys typing \"hey, how's your week going?\". You're the one who sent something she'll screenshot.",
  },
];

function BuiltForDatingApps() {
  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
          Built for the apps you're already on
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
          Yeslink is made for Hinge, Tinder and Bumble matches: the ones stuck in the chat that
          never turn into a real date. You paste one link — the rest happens on its own.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {DATING_APP_PROBLEMS.map((item) => (
            <div key={item.problem} className="rounded-2xl border border-white/10 bg-ink-2 p-6">
              <div className="text-3xl">{item.emoji}</div>
              <p className="mt-3 text-lg font-bold text-white">{item.problem}</p>
              <p className="mt-2 text-sm text-neutral-400">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Write the link",
    description: "Her name, the days you're free, your email. Under a minute.",
  },
  {
    number: "02",
    title: "You paste it in the chat",
    description: "Straight into your Hinge, Tinder or Bumble conversation. She opens it, the NO runs from her finger.",
  },
  {
    number: "03",
    title: "You cash in",
    description: "You get an email the moment she answers. Zero anxiety over left-on-read texts.",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-white/10 bg-ink-2/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-ink p-6">
              <p className="text-4xl font-black text-brand">{step.number}</p>
              <p className="mt-3 text-lg font-bold text-white">{step.title}</p>
              <p className="mt-2 text-sm text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST_ITEMS = [
  { emoji: "🕵️", text: "We don't ask her for anything: no sign-up, no data." },
  { emoji: "🎭", text: "The page she opens is obviously playful, not a shady quiz." },
  { emoji: "🎚️", text: "You can remove the Yeslink badge whenever you want (paid, optional)." },
];

function TrustBar() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid gap-4 sm:grid-cols-3">
        {TRUST_ITEMS.map((item) => (
          <div key={item.text} className="flex items-start gap-3 rounded-xl border border-white/10 p-4">
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm text-neutral-300">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t border-white/10 bg-ink-2/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Pricing, no surprises</h2>
        <p className="mt-2 text-center text-neutral-400">
          The first one's free. The rest you earn.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-brand bg-brand/10 p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand">To get started</p>
            <p className="mt-2 text-3xl font-extrabold text-white">Free</p>
            <p className="mt-1 text-sm text-neutral-400">1 link, no card required</p>
          </div>

          {PRICING_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-white/10 bg-ink p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-neutral-400">{pkg.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{pkg.priceLabel}</p>
              <p className="mt-1 text-sm text-neutral-400">{pkg.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "Does this work with Hinge, Tinder and Bumble?",
    a: "Yes — that's exactly what it's for. It's just a link, so you paste it into any chat: Hinge, Tinder, Bumble, Instagram DMs, iMessage, wherever you're already talking to her.",
  },
  {
    q: "Does she need to download an app or sign up?",
    a: "No. She opens the link, answers, done. Zero sign-up on her end.",
  },
  {
    q: "Doesn't it look like a scam?",
    a: "The page is designed to be obviously playful from the first second. Not a fake quiz, not an anonymous landing page.",
  },
  {
    q: 'Can I remove the "made with Yeslink" badge?',
    a: "Yes, the watermark removal package makes it entirely your own page.",
  },
  {
    q: "How do I know if she answered?",
    a: "We email you the moment she does. It's also always in your dashboard.",
  },
];

function Faq() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Questions you're probably asking</h2>
      <div className="mt-8 flex flex-col gap-4">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="rounded-2xl border border-white/10 bg-ink-2 p-5">
            <p className="font-bold text-white">{item.q}</p>
            <p className="mt-1 text-sm text-neutral-400">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-col items-center gap-3 border-t border-white/10 px-6 py-10 text-sm text-neutral-500">
      <div className="flex gap-4">
        <Link href="/privacy" className="hover:text-neutral-300">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-neutral-300">
          Terms
        </Link>
      </div>
      <p>© {new Date().getFullYear()} Yeslink</p>
    </footer>
  );
}
