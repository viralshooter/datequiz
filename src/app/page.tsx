import Link from "next/link";
import { Nav } from "@/components/Nav";
import { PRICING_PACKAGES } from "@/config/pricing";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-ink text-white">
      <Nav />
      <Hero />
      <HowItWorks />
      <TrustBar />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-20 pt-14 text-center">
      <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand">
        Il wingman digitale
      </span>
      <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
        Chiediglielo prima che risponda un altro
      </h1>
      <p className="mt-5 max-w-lg text-lg text-neutral-400">
        Le mandi un link. Lei prova a dirti di no — non ci riesce, letteralmente — e finisce
        per scegliere lei cosa fare e quando. Tu ti godi la vittoria.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/create"
          className="rounded-full bg-brand px-8 py-4 text-lg font-bold text-ink shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-transform active:scale-95"
        >
          Crea il tuo primo Yeslink gratis →
        </Link>
        <Link
          href="/login"
          className="rounded-full border-2 border-white/15 px-8 py-4 text-lg font-semibold text-white hover:border-white/30"
        >
          Ho già un account
        </Link>
      </div>
      <p className="mt-4 text-sm text-neutral-500">Gratis il primo giro. Nessuna carta richiesta.</p>
    </section>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Scrivi il link",
    description: "Il suo nome, i giorni in cui sei libero, la tua email. Meno di un minuto.",
  },
  {
    number: "02",
    title: "Il NO non regge",
    description: "Letteralmente scappa dal dito. Lei finisce per dire sì e scegliere cosa fare.",
  },
  {
    number: "03",
    title: "Incassi",
    description: "Ti arriva una mail appena risponde. Zero ansia da doppia spunta blu.",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-white/10 bg-ink-2/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Come funziona</h2>
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
  { emoji: "🕵️", text: "A lei non chiediamo niente: nessuna registrazione, nessun dato." },
  { emoji: "🎭", text: "La pagina che apre è chiaramente giocosa, non un finto quiz spam." },
  { emoji: "🎚️", text: "Puoi togliere il badge Yeslink quando vuoi (opzionale, a pagamento)." },
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
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Prezzi senza sorprese</h2>
        <p className="mt-2 text-center text-neutral-400">
          Il primo è gratis. Gli altri te li guadagni.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-brand bg-brand/10 p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand">Per iniziare</p>
            <p className="mt-2 text-3xl font-extrabold text-white">Gratis</p>
            <p className="mt-1 text-sm text-neutral-400">1 link, nessuna carta richiesta</p>
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
    q: "Lei deve scaricare un'app o registrarsi?",
    a: "No. Apre il link, risponde, fine. Zero registrazione dal suo lato.",
  },
  {
    q: "Non sembra uno scam?",
    a: "La pagina è pensata apposta per essere chiaramente giocosa fin dal primo secondo. Non un finto quiz, non una landing anonima.",
  },
  {
    q: "Posso togliere la scritta \"creato con Yeslink\"?",
    a: "Sì, con il pacchetto rimozione watermark diventa una pagina completamente tua.",
  },
  {
    q: "Come faccio a sapere se ha risposto?",
    a: "Ti mandiamo una email appena risponde. Tutto è comunque anche nella tua dashboard.",
  },
];

function Faq() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Domande che ti stai facendo</h2>
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
          Termini
        </Link>
      </div>
      <p>© {new Date().getFullYear()} Yeslink</p>
    </footer>
  );
}
