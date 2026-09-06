import Link from "next/link";
import { Nav } from "@/components/Nav";

export const metadata = { title: "Privacy Policy — Yeslink" };

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-ink text-white">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          Questa è una bozza standard, non ancora rivista da un legale. Va
          verificata e adattata prima di un lancio reale.
        </div>

        <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-neutral-500">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>

        <Section title="Chi siamo">
          Yeslink è un servizio che permette di creare un link personalizzato per
          invitare qualcuno a un appuntamento e raccogliere la sua risposta.
        </Section>

        <Section title="Dati che raccogliamo">
          <ul className="list-disc space-y-1 pl-5">
            <li>La tua email, quando crei un account o un link (per avvisarti via email delle risposte).</li>
            <li>Il nome che inserisci per la persona che inviti.</li>
            <li>Le risposte fornite dalla persona invitata (attività scelte, giorni disponibili) — non richiediamo alcun dato di identificazione a lei.</li>
            <li>Dati tecnici minimi legati all&apos;uso del servizio (es. eventi di utilizzo del funnel), senza cookie di profilazione o tracciamento pubblicitario di terze parti.</li>
          </ul>
        </Section>

        <Section title="Perché li raccogliamo">
          Per fornire il servizio (generare link, salvare risposte), inviarti le
          notifiche via email quando qualcuno risponde, gestire eventuali
          pagamenti ed eventuali comunicazioni relative all&apos;account.
        </Section>

        <Section title="Con chi li condividiamo">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> — hosting del database e autenticazione.</li>
            <li><strong>Vercel</strong> — hosting dell&apos;applicazione.</li>
            <li><strong>Stripe</strong> — elaborazione dei pagamenti (non vediamo né conserviamo i dati della tua carta).</li>
            <li><strong>Resend</strong> — invio delle email di notifica.</li>
          </ul>
          Non vendiamo né condividiamo i tuoi dati con terzi per finalità di marketing.
        </Section>

        <Section title="Conservazione">
          Conserviamo i dati finché il tuo account resta attivo, o finché
          necessario per le finalità sopra indicate.
        </Section>

        <Section title="I tuoi diritti">
          Puoi chiedere accesso, correzione o cancellazione dei tuoi dati in
          qualsiasi momento scrivendo all&apos;indirizzo di contatto indicato sul sito.
        </Section>

        <Section title="Contatti">
          Per qualsiasi domanda su questa policy, scrivici tramite i canali indicati sul sito.
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
