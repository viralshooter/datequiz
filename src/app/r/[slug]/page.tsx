import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { slug } = await params;

  const admin = createSupabaseAdminClient();
  const { data: link } = await admin
    .from("links")
    .select("id, match_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!link) {
    return <Shell><p className="text-neutral-400">Questo link non esiste (più).</p></Shell>;
  }

  // Nessun controllo di sessione qui: come per /d/[slug], lo slug (casuale
  // e non indovinabile) è già la chiave d'accesso. Serve perché il link
  // nella email di notifica deve funzionare anche da un altro dispositivo
  // o prima che l'email dell'account sia confermata.
  const { data: answer } = await admin
    .from("answers")
    .select("selected_activities, selected_days, responded_at")
    .eq("link_id", link.id)
    .maybeSingle();

  if (!answer) {
    return (
      <Shell>
        <div className="text-5xl">⏳</div>
        <h1 className="mt-4 text-2xl font-extrabold text-white">
          In attesa della risposta di {link.match_name}
        </h1>
        <p className="mt-2 text-neutral-400">Torna su questa pagina quando avrà risposto.</p>
      </Shell>
    );
  }

  const selectedActivities = ACTIVITIES.filter((a) =>
    (answer.selected_activities as ActivityId[]).includes(a.id)
  );
  const selectedDays = (answer.selected_days as string[]) ?? [];

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Risposta di {link.match_name}
      </p>

      <div className="mt-3 text-6xl">🎉</div>

      <h1 className="mt-3 text-2xl font-extrabold text-white">Ha detto sì!</h1>

      <div className="mt-6 w-full rounded-2xl border border-white/10 bg-ink-2 p-5 text-left">
        <p className="text-sm font-semibold text-neutral-400">Le va di fare</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedActivities.map((a) => (
            <span key={a.id} className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand">
              {a.emoji} {a.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-ink-2 p-5 text-left">
        <p className="text-sm font-semibold text-neutral-400">Giorni in comune</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {selectedDays.map((day) => (
            <li key={day} className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand">
              {day}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/create" className="mt-8 text-sm font-semibold text-brand">
        + Crea un altro Yeslink
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh text-white">
      <AmbientBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        {children}
      </div>
    </div>
  );
}
