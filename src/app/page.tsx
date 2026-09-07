import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AmbientBackground } from "@/components/AmbientBackground";
import { FloatingStickers } from "@/components/FloatingStickers";
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
      <FloatingStickers />
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
    <div className="bg-brand px-4 py-2 text-center text-sm font-black text-ink">
      🎁 First link free — no card, no catch
    </div>
  );
}

const MINI_STEPS = [
  { emoji: "✍️", label: "Write the link", tint: "border-yellow-300 shadow-[5px_5px_0_0_#fde047]" },
  { emoji: "👀", label: "She answers", tint: "border-pink-400 shadow-[5px_5px_0_0_#f472b6]" },
  { emoji: "📬", label: "You find out", tint: "border-brand shadow-[5px_5px_0_0_#22c55e]" },
];

function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-10 text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="-rotate-2 rounded-full border-2 border-brand bg-brand/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-brand">
          For your Hinge, Tinder & Bumble matches
        </span>
        <span className="rotate-2 rounded-full border-2 border-yellow-300 bg-yellow-300 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-ink">
          🎁 First link free
        </span>
      </div>

      <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
        Make her{" "}
        <span className="relative inline-block -rotate-2 rounded-lg bg-yellow-300 px-3 pb-1 text-ink">
          laugh
        </span>{" "}
        into a yes
      </h1>

      <p className="mt-6 max-w-lg text-lg text-neutral-400">
        That match you've been texting for two weeks? Send one link. She tries to say no — the
        button literally runs away from her finger — and she ends up picking what to do and when.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/create"
          className="rounded-full border-2 border-brand bg-brand px-8 py-4 text-lg font-black text-ink shadow-[6px_6px_0_0_rgba(34,197,94,0.4)] transition-transform hover:-translate-y-0.5 hover:rotate-1 active:translate-y-0 active:scale-95"
        >
          Create your first Yeslink free →
        </Link>
        <Link
          href="/login"
          className="rounded-full border-2 border-white/20 px-8 py-4 text-lg font-bold text-white transition-transform hover:-translate-y-0.5 hover:border-white/40"
        >
          I already have an account
        </Link>
      </div>
      <p className="mt-4 text-sm text-neutral-500">No card required. You only pay if you keep using it.</p>

      <p className="mt-10 text-xs font-bold uppercase tracking-widest text-neutral-500">
        Send it where you already talk
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {["WhatsApp", "Instagram DMs", "iMessage", "Messenger"].map((app) => (
          <span
            key={app}
            className="rounded-full border border-white/10 bg-ink-2/60 px-3 py-1 text-sm font-semibold text-neutral-300"
          >
            {app}
          </span>
        ))}
      </div>

      <div className="mt-12 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-4">
        {MINI_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-ink-2 px-5 py-4 transition-transform hover:-translate-y-1 hover:rotate-2 ${step.tint}`}
            >
              <span className="text-3xl">{step.emoji}</span>
              <span className="text-xs font-black uppercase tracking-wide text-neutral-200">
                {step.label}
              </span>
            </div>
            {i < MINI_STEPS.length - 1 && (
              <span className="text-xl font-black text-neutral-600">→</span>
            )}
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
    tilt: "-rotate-1",
    shadow: "shadow-[6px_6px_0_0_#38bdf8]",
    border: "border-sky-400",
  },
  {
    emoji: "🌀",
    problem: '"We should get drinks sometime"',
    solution:
      "That sentence never becomes a plan. This one ends with an activity and a day already picked.",
    tilt: "rotate-1",
    shadow: "shadow-[6px_6px_0_0_#f472b6]",
    border: "border-pink-400",
  },
  {
    emoji: "🥱",
    problem: "You look like everyone else",
    solution:
      "Her inbox is 20 guys typing \"hey, how's your week going?\". You're the one who sent something she'll screenshot.",
    tilt: "-rotate-1",
    shadow: "shadow-[6px_6px_0_0_#fde047]",
    border: "border-yellow-300",
  },
];

function BuiltForDatingApps() {
  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">
          Built for the apps you're already on
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
          Yeslink is made for Hinge, Tinder and Bumble matches: the ones stuck in the chat that
          never turn into a real date.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {DATING_APP_PROBLEMS.map((item) => (
            <div
              key={item.problem}
              className={`rounded-3xl border-2 bg-ink-2 p-6 transition-transform hover:-translate-y-1 hover:rotate-0 ${item.tilt} ${item.shadow} ${item.border}`}
            >
              <div className="text-4xl">{item.emoji}</div>
              <p className="mt-3 text-lg font-black text-white">{item.problem}</p>
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
    number: "1",
    title: "Write the link",
    description: "Her name, one line only she'd get, the days you're free. Under a minute.",
    color: "bg-yellow-300 text-ink",
  },
  {
    number: "2",
    title: "You send it to her",
    description:
      "On WhatsApp or IG, wherever you two already talk. She opens it, and the NO runs from her finger.",
    color: "bg-pink-400 text-ink",
  },
  {
    number: "3",
    title: "You cash in",
    description: "You get an email the moment she answers. Zero anxiety over left-on-read texts.",
    color: "bg-brand text-ink",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-white/10 bg-ink-2/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Three levels, one date</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="relative rounded-3xl border-2 border-white/15 bg-ink p-6 pt-9 transition-transform hover:-translate-y-1"
            >
              <span
                className={`absolute -top-5 left-6 flex h-11 w-11 rotate-[-6deg] items-center justify-center rounded-xl text-xl font-black shadow-[3px_3px_0_0_rgba(0,0,0,0.4)] ${step.color}`}
              >
                {step.number}
              </span>
              <p className="text-lg font-black text-white">{step.title}</p>
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
          <div
            key={item.text}
            className="flex items-start gap-3 rounded-2xl border-2 border-white/10 bg-ink-2/50 p-4 transition-transform hover:-rotate-1"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm text-neutral-300">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tints = [
    "border-pink-400 shadow-[6px_6px_0_0_#f472b6]",
    "border-violet-400 shadow-[6px_6px_0_0_#a78bfa]",
    "border-sky-400 shadow-[6px_6px_0_0_#38bdf8]",
  ];

  return (
    <section className="border-t border-white/10 bg-ink-2/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Pick your power-up</h2>
        <p className="mt-3 text-center text-neutral-400">
          The first one's free. The rest you earn.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="rotate-1 rounded-3xl border-2 border-brand bg-brand/15 p-6 text-center shadow-[6px_6px_0_0_#22c55e] transition-transform hover:-translate-y-1 hover:rotate-0">
            <p className="text-xs font-black uppercase tracking-widest text-brand">Starter</p>
            <p className="mt-2 text-4xl font-black text-white">Free</p>
            <p className="mt-1 text-sm text-neutral-400">1 link, no card required</p>
          </div>

          {PRICING_PACKAGES.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`-rotate-1 rounded-3xl border-2 bg-ink p-6 text-center transition-transform hover:-translate-y-1 hover:rotate-0 ${tints[i % tints.length]}`}
            >
              <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
                {pkg.label}
              </p>
              <p className="mt-2 text-4xl font-black text-white">{pkg.priceLabel}</p>
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
    a: "That's exactly who it's for — but send it once you've swapped numbers or Instagram, not in the app's own chat. Dating apps flag early external links as spam, and their chats don't show link previews anyway. On WhatsApp or IG she sees your name, your handle and the preview card before she even taps.",
  },
  {
    q: "Does she need to download an app or sign up?",
    a: "No. She opens the link, answers, done. Zero sign-up on her end.",
  },
  {
    q: "Doesn't it look like a scam?",
    a: "That's the whole point of the design. Your name, your Instagram and a line only she'd understand are on the page before anything else — plus it's obviously playful from the first second.",
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
      <h2 className="text-center text-3xl font-black sm:text-4xl">
        Questions you're probably asking
      </h2>
      <div className="mt-8 flex flex-col gap-4">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl border-2 border-white/10 bg-ink-2 p-5 transition-colors hover:border-white/25"
          >
            <p className="font-black text-white">{item.q}</p>
            <p className="mt-1 text-sm text-neutral-400">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-col items-center gap-4 border-t border-white/10 px-6 py-12 text-sm text-neutral-500">
      <p className="text-base font-black text-neutral-300">Hook her with a laugh 💚</p>
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
