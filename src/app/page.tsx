import Link from "next/link";
import { Nav } from "@/components/Nav";
import { PRICING_PACKAGES } from "@/config/pricing";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 via-white to-white">
      <Nav />
      <Hero />
      <HowItWorks />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-16 pt-10 text-center">
      <div className="text-6xl">💌</div>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight text-neutral-900 sm:text-5xl">
        Chiediglielo, in modo che dica di sì
      </h1>
      <p className="mt-4 max-w-lg text-lg text-neutral-600">
        Crei un link personalizzato in 30 secondi. Lei apre, risponde a una domanda
        (impossibile dire di no) e sceglie cosa fare e quando. Zero imbarazzo, zero
        messaggi lasciati in sospeso.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/create"
          className="rounded-full bg-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95"
        >
          Crea il tuo primo link gratis →
        </Link>
        <Link
          href="/login"
          className="rounded-full border-2 border-neutral-200 px-8 py-4 text-lg font-semibold text-neutral-700"
        >
          Ho già un account
        </Link>
      </div>
      <p className="mt-4 text-sm text-neutral-400">Il primo link è gratis, senza carta di credito.</p>
    </section>
  );
}

const STEPS = [
  {
    emoji: "✍️",
    title: "Crei il link",
    description: "Nome di lei, i giorni in cui sei libero, la tua email per essere avvisato.",
  },
  {
    emoji: "📲",
    title: "Lei risponde",
    description:
      "Una pagina giocosa (non sembra spam), una domanda diretta e la scelta di cosa fare insieme.",
  },
  {
    emoji: "🎉",
    title: "Tu lo scopri subito",
    description: "Ti arriva una email appena risponde, con cosa le va di fare e quando è libera.",
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-center text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        Come funziona
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
          >
            <div className="text-4xl">{step.emoji}</div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-rose-400">
              Passo {i + 1}
            </p>
            <p className="mt-1 text-lg font-bold text-neutral-900">{step.title}</p>
            <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-center text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        Prezzi semplici
      </h2>
      <p className="mt-2 text-center text-neutral-600">
        Il primo link è sempre gratis. Poi paghi solo se continui a usarlo.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-rose-500">Per iniziare</p>
          <p className="mt-2 text-3xl font-extrabold text-neutral-900">Gratis</p>
          <p className="mt-1 text-sm text-neutral-600">1 link, nessuna carta richiesta</p>
        </div>

        {PRICING_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">{pkg.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-neutral-900">{pkg.priceLabel}</p>
            <p className="mt-1 text-sm text-neutral-600">{pkg.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "Lei deve scaricare un'app o registrarsi?",
    a: "No. Apre il link, risponde, fine. Nessuna registrazione richiesta dal suo lato.",
  },
  {
    q: "Non sembra uno scam o un link sospetto?",
    a: "La pagina che apre lei è pensata apposta per essere chiaramente giocosa fin dal primo secondo, non un finto quiz o una landing anonima.",
  },
  {
    q: "Posso togliere la scritta \"creato con DateQuiz\"?",
    a: "Sì, con il pacchetto rimozione watermark diventa una pagina completamente tua.",
  },
  {
    q: "Come faccio a sapere se ha risposto?",
    a: "Ti mandiamo una email appena risponde. Puoi anche controllare tutto dalla tua dashboard.",
  },
];

function Faq() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="text-center text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        Domande frequenti
      </h2>
      <div className="mt-8 flex flex-col gap-4">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="font-bold text-neutral-900">{item.q}</p>
            <p className="mt-1 text-sm text-neutral-600">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-10 text-sm text-neutral-400">
      <div className="flex gap-4">
        <Link href="/privacy" className="hover:text-neutral-600">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-neutral-600">
          Termini
        </Link>
      </div>
      <p>© {new Date().getFullYear()} DateQuiz</p>
    </footer>
  );
}
