import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

export const dynamic = "force-dynamic";

interface LinkRow {
  slug: string;
  match_name: string;
  created_at: string;
  answers: { selected_activities: ActivityId[] } | { selected_activities: ActivityId[] }[] | null;
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous !== false) {
    redirect("/login?next=/dashboard");
  }

  const [{ data: profile }, { data: links }, { data: purchases }] = await Promise.all([
    supabase.from("users").select("credits, remove_watermark").eq("id", user.id).maybeSingle(),
    supabase
      .from("links")
      .select("slug, match_name, created_at, answers(selected_activities)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("purchases")
      .select("package, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-dvh bg-ink text-white">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-extrabold">I tuoi link</h1>
        <p className="mt-1 text-neutral-400">
          {user.email} · {profile?.credits ?? 0} credit{profile?.credits === 1 ? "o" : "i"} residu
          {profile?.credits === 1 ? "o" : "i"}
        </p>

        <Link
          href="/create"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-[0_0_20px_rgba(34,197,94,0.35)]"
        >
          + Crea un nuovo link
        </Link>

        <div className="mt-8 flex flex-col gap-3">
          {(!links || links.length === 0) && (
            <p className="text-neutral-500">Non hai ancora creato nessun link.</p>
          )}

          {(links as LinkRow[] | null)?.map((link) => {
            const answerRow = Array.isArray(link.answers) ? link.answers[0] : link.answers;
            const activities = ACTIVITIES.filter((a) =>
              (answerRow?.selected_activities ?? []).includes(a.id)
            );

            return (
              <div key={link.slug} className="rounded-2xl border border-white/10 bg-ink-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{link.match_name}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      answerRow ? "bg-brand/15 text-brand" : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {answerRow ? "Ha risposto" : "In attesa"}
                  </span>
                </div>

                {activities.length > 0 && (
                  <p className="mt-2 text-sm text-neutral-400">
                    {activities.map((a) => `${a.emoji} ${a.label}`).join(" · ")}
                  </p>
                )}

                <Link
                  href={`/r/${link.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand"
                >
                  Vedi dettagli →
                </Link>
              </div>
            );
          })}
        </div>

        {purchases && purchases.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Acquisti
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {purchases.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-2 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-neutral-200">{p.package}</span>
                  <span className={p.status === "completed" ? "text-brand" : "text-neutral-500"}>
                    {p.status === "completed" ? "Completato" : "In sospeso"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
