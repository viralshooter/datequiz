import Link from "next/link";
import { Nav } from "@/components/Nav";
import { PRICING_PACKAGES } from "@/config/pricing";

export const metadata = { title: "Termini di servizio — Yeslink" };

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-ink text-white">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Questa è una bozza standard, non ancora rivista da un legale. Va
          verificata e adattata prima di un lancio reale.
        </div>

        <h1 className="text-2xl font-extrabold">Termini di servizio</h1>
        <p className="mt-1 text-sm text-neutral-500">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>

        <Section title="Il servizio">
          Yeslink permette di creare un link personalizzato per invitare qualcuno
          a un appuntamento e raccogliere la sua risposta. Il primo link è
          gratuito; l&apos;uso oltre il limite gratuito richiede l&apos;acquisto di uno dei
          pacchetti disponibili.
        </Section>

        <Section title="Account e crediti">
          Ogni account riceve 1 credito gratuito (1 link). I crediti aggiuntivi si
          acquistano tramite i pacchetti mostrati sul sito:{" "}
          {PRICING_PACKAGES.map((p) => `${p.label} (${p.priceLabel})`).join(", ")}. I
          crediti non hanno scadenza ma non sono rimborsabili una volta usati per
          creare un link.
        </Section>

        <Section title="Pagamenti">
          I pagamenti sono gestiti da Stripe. Non conserviamo i dati della tua
          carta. In caso di problemi con un acquisto, contattaci: valutiamo i
          rimborsi caso per caso.
        </Section>

        <Section title="Uso consentito">
          Ti impegni a non usare il servizio per inviare contenuti offensivi,
          molesti, illegali o rivolti a persone che non hanno acconsentito a
          essere contattate. Ci riserviamo il diritto di sospendere account che
          violano queste condizioni.
        </Section>

        <Section title="Limitazione di responsabilità">
          Il servizio è fornito &ldquo;così com&apos;è&rdquo;. Non garantiamo che una risposta
          arrivi entro un certo tempo, né siamo responsabili delle interazioni
          che ne derivano tra gli utenti.
        </Section>

        <Section title="Modifiche">
          Possiamo aggiornare questi termini nel tempo; le modifiche rilevanti
          saranno comunicate tramite il sito.
        </Section>

        <Section title="Contatti">
          Per domande su questi termini, scrivici tramite i canali indicati sul sito.
        </Section>

        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-brand">
          ← Torna alla home
        </Link>
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
