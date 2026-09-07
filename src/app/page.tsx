import Link from "next/link";
import { redirect } from "next/navigation";
import { AppScreens } from "@/components/AppScreens";
import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { TryTheButton } from "@/components/TryTheButton";
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
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10">
        <AnnouncementBar />
        <Nav />
        <Hero />
        <BuiltForDatingApps />
        <HowItWorks />
        <NoteExamples />
        <TrustBar />
        <Pricing />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="border-b-2 border-ink bg-brand px-4 py-2 text-center text-sm font-black text-ink">
      🎁 First link free — no card, no catch
    </div>
  );
}

const MINI_STEPS = [
  { emoji: "✍️", label: "Write the link", shadow: "shadow-[5px_5px_0_0_#fbbf24]" },
  { emoji: "👀", label: "She answers", shadow: "shadow-[5px_5px_0_0_#f472b6]" },
  { emoji: "📬", label: "You find out", shadow: "shadow-[5px_5px_0_0_#22c55e]" },
];

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-6">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        {/* The pitch */}
        <div className="text-center lg:pt-4 lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="-rotate-2 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ink shadow-[3px_3px_0_0_#1a1a1f]">
              For your Hinge, Tinder & Bumble matches
            </span>
            <span className="rotate-2 rounded-full border-2 border-ink bg-yellow-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ink shadow-[3px_3px_0_0_#1a1a1f]">
              🎁 First link free
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
            Make her{" "}
            <span className="relative inline-block -rotate-2 rounded-xl border-2 border-ink bg-yellow-300 px-3 pb-1 shadow-[4px_4px_0_0_#1a1a1f]">
              laugh
            </span>{" "}
            into a yes
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base text-neutral-600 sm:text-lg lg:mx-0">
            Send her one link. The NO button runs away from her finger, and she ends up picking
            what you two do and when.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 lg:justify-start">
            {MINI_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-white px-3 py-2 transition-transform hover:-translate-y-1 hover:rotate-2 ${step.shadow}`}
                >
                  <span className="text-xl">{step.emoji}</span>
                  <span className="text-[11px] font-black uppercase tracking-wide text-ink">
                    {step.label}
                  </span>
                </div>
                {i < MINI_STEPS.length - 1 && (
                  <span className="font-black text-neutral-400">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/create"
              className="rounded-full border-[3px] border-ink bg-brand px-7 py-4 text-base font-black text-ink shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 hover:rotate-1 active:translate-y-0 active:scale-95"
            >
              Create your first Yeslink free →
            </Link>
            <Link
              href="/login"
              className="rounded-full border-[3px] border-ink bg-white px-7 py-4 text-base font-black text-ink shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 hover:-rotate-1 active:translate-y-0"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-3 text-sm font-semibold text-neutral-500">
            No card required. You only pay if you keep using it.
          </p>
        </div>

        {/* The proof: what she sees, then the same trick playable right here */}
        <div>
          <p className="text-center text-xs font-black uppercase tracking-widest text-neutral-500">
            👀 This is what lands in her DMs
          </p>
          <div className="mt-4">
            <AppScreens />
          </div>

          <div className="mt-6">
            <TryTheButton />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-neutral-500">
            ↑ Go on, try to click NO. That&apos;s the whole product.
          </p>
        </div>
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
    bg: "bg-sky-100",
  },
  {
    emoji: "🌀",
    problem: '"We should get drinks sometime"',
    solution:
      "That sentence never becomes a plan. This one ends with an activity and a day already picked.",
    tilt: "rotate-1",
    bg: "bg-pink-100",
  },
  {
    emoji: "🥱",
    problem: "You look like everyone else",
    solution:
      "Her inbox is 20 guys typing \"hey, how's your week going?\". You're the one who sent something she'll screenshot.",
    tilt: "-rotate-1",
    bg: "bg-yellow-100",
  },
];

function BuiltForDatingApps() {
  return (
    <section className="border-t-2 border-ink/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">
          Built for the apps you're already on
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          Yeslink is made for Hinge, Tinder and Bumble matches: the ones stuck in the chat that
          never turn into a real date.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {DATING_APP_PROBLEMS.map((item) => (
            <div
              key={item.problem}
              className={`rounded-3xl border-[3px] border-ink p-6 shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-1 hover:rotate-0 ${item.tilt} ${item.bg}`}
            >
              <div className="text-4xl">{item.emoji}</div>
              <p className="mt-3 text-lg font-black">{item.problem}</p>
              <p className="mt-2 text-sm text-neutral-700">{item.solution}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-center text-xs font-black uppercase tracking-widest text-neutral-500">
          Send it where you already talk
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {["WhatsApp", "Instagram DMs", "iMessage", "Messenger"].map((app) => (
            <span
              key={app}
              className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-sm font-bold text-neutral-600"
            >
              {app}
            </span>
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
    color: "bg-yellow-300",
  },
  {
    number: "2",
    title: "You send it to her",
    description:
      "On WhatsApp or IG, wherever you two already talk. She opens it, and the NO runs from her finger.",
    color: "bg-pink-400",
  },
  {
    number: "3",
    title: "You cash in",
    description: "You get an email the moment she answers. Zero anxiety over left-on-read texts.",
    color: "bg-brand",
  },
];

function HowItWorks() {
  return (
    <section className="border-t-2 border-ink/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Three levels, one date</h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="relative rounded-3xl border-[3px] border-ink bg-white p-6 pt-9 shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-1"
            >
              <span
                className={`absolute -top-6 left-6 flex h-12 w-12 rotate-[-8deg] items-center justify-center rounded-2xl border-[3px] border-ink text-xl font-black text-ink shadow-[3px_3px_0_0_#1a1a1f] ${step.color}`}
              >
                {step.number}
              </span>
              <p className="text-lg font-black">{step.title}</p>
              <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const NOTE_EXAMPLES = [
  { note: "Still thinking about your take on pineapple pizza. Settle this in person?", tilt: "-rotate-2", bg: "bg-white" },
  { note: "You said you'd beat me at mini golf. Bold claim. Prove it.", tilt: "rotate-1", bg: "bg-yellow-50" },
  { note: "I owe you a coffee for that playlist recommendation.", tilt: "rotate-2", bg: "bg-pink-50" },
  { note: "Our chat has gone three days without a plan. Fixing that now.", tilt: "-rotate-1", bg: "bg-sky-50" },
];

function NoteExamples() {
  return (
    <section className="border-t-2 border-ink/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">
          The one line that does the work
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          Every link carries a line only she'd understand. It's what separates you from the guy
          who sends a bare URL. Steal the vibe, not the words:
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {NOTE_EXAMPLES.map((item) => (
            <div
              key={item.note}
              className={`rounded-3xl rounded-bl-lg border-[3px] border-ink p-6 text-lg font-semibold shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:rotate-0 ${item.tilt} ${item.bg}`}
            >
              <span className="mb-2 block text-2xl">💬</span>
              {item.note}
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
            className="flex items-start gap-3 rounded-2xl border-2 border-ink/15 bg-white/70 p-4 transition-transform hover:-rotate-1"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm font-medium text-neutral-700">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tints = ["bg-pink-100", "bg-violet-100", "bg-sky-100"];

  return (
    <section className="border-t-2 border-ink/10 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Pick your power-up</h2>
        <p className="mt-3 text-center text-neutral-600">
          The first one's free. The rest you earn.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="rotate-1 rounded-3xl border-[3px] border-ink bg-brand p-6 text-center shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-1 hover:rotate-0">
            <p className="text-xs font-black uppercase tracking-widest text-ink/70">Starter</p>
            <p className="mt-2 text-4xl font-black">Free</p>
            <p className="mt-1 text-sm font-semibold text-ink/70">1 link, no card required</p>
          </div>

          {PRICING_PACKAGES.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`-rotate-1 rounded-3xl border-[3px] border-ink p-6 text-center shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-1 hover:rotate-0 ${tints[i % tints.length]}`}
            >
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                {pkg.label}
              </p>
              <p className="mt-2 text-4xl font-black">{pkg.priceLabel}</p>
              <p className="mt-1 text-sm font-medium text-neutral-700">{pkg.description}</p>
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
    q: "Can she actually click NO?",
    a: "Try it above. We'll wait.",
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
            className="rounded-2xl border-[3px] border-ink bg-white p-5 shadow-[4px_4px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5"
          >
            <p className="font-black">{item.q}</p>
            <p className="mt-1 text-sm text-neutral-600">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      <div className="rounded-[2rem] border-[3px] border-ink bg-brand p-10 text-center shadow-[10px_10px_0_0_#1a1a1f]">
        <p className="text-3xl font-black leading-tight sm:text-4xl">
          She's not going to ask you.
        </p>
        <p className="mx-auto mt-3 max-w-md font-semibold text-ink/80">
          Takes a minute. Costs nothing. Worst case she says yes.
        </p>
        <Link
          href="/create"
          className="mt-7 inline-block rounded-full border-[3px] border-ink bg-white px-8 py-4 text-lg font-black text-ink shadow-[6px_6px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 hover:-rotate-1 active:translate-y-0"
        >
          Make your first Yeslink →
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-col items-center gap-4 border-t-2 border-ink/10 px-6 py-12 text-sm text-neutral-500">
      <p className="text-base font-black text-ink">Hook her with a laugh 💚</p>
      <div className="flex gap-4">
        <Link href="/privacy" className="font-semibold hover:text-ink">
          Privacy
        </Link>
        <Link href="/terms" className="font-semibold hover:text-ink">
          Terms
        </Link>
      </div>
      <p>© {new Date().getFullYear()} Yeslink</p>
    </footer>
  );
}
