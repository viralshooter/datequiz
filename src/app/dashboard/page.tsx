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
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 via-white to-white">
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-extrabold text-neutral-900">I tuoi link</h1>
        <p className="mt-1 text-neutral-600">
          {user.email} · {profile?.credits ?? 0} credit{profile?.credits === 1 ? "o" : "i"} residu
          {profile?.credits === 1 ? "o" : "i"}
        </p>

        <Link
          href="/create"
          className="mt-6 inline-block rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200"
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
              <div
                key={link.slug}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-neutral-900">{link.match_name}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      answerRow ? "bg-rose-100 text-rose-600" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {answerRow ? "Ha risposto" : "In attesa"}
                  </span>
                </div>

                {activities.length > 0 && (
                  <p className="mt-2 text-sm text-neutral-600">
                    {activities.map((a) => `${a.emoji} ${a.label}`).join(" · ")}
                  </p>
                )}

                <Link
                  href={`/r/${link.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-rose-500"
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
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-neutral-800">{p.package}</span>
                  <span
                    className={p.status === "completed" ? "text-rose-600" : "text-neutral-400"}
                  >
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
