import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    .select("id, match_name, creator_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!link) {
    return <Shell><p className="text-neutral-600">Questo link non esiste (più).</p></Shell>;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== link.creator_id) {
    return (
      <Shell>
        <p className="text-neutral-600">
          Questa pagina è privata: solo chi ha creato il link può vedere la risposta.
        </p>
      </Shell>
    );
  }

  const { data: answer } = await admin
    .from("answers")
    .select("selected_activities, selected_days, responded_at")
    .eq("link_id", link.id)
    .maybeSingle();

  if (!answer) {
    return (
      <Shell>
        <div className="text-5xl">⏳</div>
        <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">
          In attesa della risposta di {link.match_name}
        </h1>
        <p className="mt-2 text-neutral-600">
          Torna su questa pagina quando avrà risposto.
        </p>
      </Shell>
    );
  }

  const selectedActivities = ACTIVITIES.filter((a) =>
    (answer.selected_activities as ActivityId[]).includes(a.id)
  );
  const selectedDays = (answer.selected_days as string[]) ?? [];

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-wide text-rose-400">
        Risposta di {link.match_name}
      </p>

      <div className="mt-3 text-6xl">🎉</div>

      <h1 className="mt-3 text-2xl font-extrabold text-neutral-900">Ha detto sì!</h1>

      <div className="mt-6 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
        <p className="text-sm font-semibold text-neutral-500">Le va di fare</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedActivities.map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-600"
            >
              {a.emoji} {a.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
        <p className="text-sm font-semibold text-neutral-500">Giorni in comune</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {selectedDays.map((day) => (
            <li
              key={day}
              className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-600"
            >
              {day}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/create" className="mt-8 text-sm font-semibold text-rose-500">
        + Crea un altro DateQuiz
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      {children}
    </div>
  );
}
