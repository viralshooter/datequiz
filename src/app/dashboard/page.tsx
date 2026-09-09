import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { ACTIVITIES } from "@/config/content";
import { accountStateFromUser } from "@/lib/accountState";
import { CheckoutBanner } from "./CheckoutBanner";
import type { ActivityId } from "@/types/content";

export const dynamic = "force-dynamic";

interface AnswerRow {
  selected_activities: ActivityId[];
  reveal_activities: boolean | null;
}

interface LinkRow {
  slug: string;
  match_name: string;
  created_at: string;
  answers: AnswerRow | AnswerRow[] | null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = accountStateFromUser(user);

  // Half-finished accounts used to be bounced to /login, where signing in
  // with the same address would have started a second account and orphaned
  // their links. Send them to the page that actually finishes the job.
  if (account.kind === "pending") redirect("/account");
  if (account.kind !== "active" || !user) redirect("/login?next=/dashboard");

  const checkout = (await searchParams).checkout;

  const [{ data: profile }, { data: links }, { data: purchases }] = await Promise.all([
    supabase.from("users").select("credits, remove_watermark").eq("id", user.id).maybeSingle(),
    supabase
      .from("links")
      .select("slug, match_name, created_at, answers(selected_activities, reveal_activities)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("purchases")
      .select("package, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10">
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-8">
        {(checkout === "success" || checkout === "cancel") && (
          <CheckoutBanner
            status={checkout === "success" ? "success" : "cancel"}
            // "Settled" means the webhook has landed and the credit is real.
            settled={(purchases ?? []).some((p) => p.status === "completed")}
          />
        )}

        <h1 className="text-2xl font-extrabold">Your links</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="font-bold text-neutral-700">Signed in as {user.email}</span>
          </span>
          <span className="rounded-full bg-brand/15 px-3 py-1.5 text-sm font-black text-brand-dark">
            {profile?.credits ?? 0} credit{profile?.credits === 1 ? "" : "s"} left
          </span>
        </div>

        <Link
          href="/create"
          className="mt-6 inline-block rounded-full border-[3px] border-ink bg-brand px-6 py-3 text-sm font-black text-ink shadow-[4px_4px_0_0_#1a1a1f]"
        >
          + Create a new link
        </Link>

        <div className="mt-8 flex flex-col gap-3">
          {(!links || links.length === 0) && (
            <p className="text-neutral-500">You haven't created any links yet.</p>
          )}

          {(links as LinkRow[] | null)?.map((link) => {
            const answerRow = Array.isArray(link.answers) ? link.answers[0] : link.answers;
            // The blind ending withholds her pick from him until the day,
            // so it must not leak here either.
            const sealed = answerRow != null && answerRow.reveal_activities === false;
            const activities = sealed
              ? []
              : ACTIVITIES.filter((a) => (answerRow?.selected_activities ?? []).includes(a.id));

            return (
              <div key={link.slug} className="rounded-2xl border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_0_#1a1a1f]">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink">{link.match_name}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      answerRow ? "bg-brand/15 text-brand" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {answerRow ? "Answered" : "Waiting"}
                  </span>
                </div>

                {sealed && (
                  <p className="mt-2 text-sm font-semibold text-indigo-700">
                    🔒 Blind card — sealed until the day
                  </p>
                )}

                {activities.length > 0 && (
                  <p className="mt-2 text-sm text-neutral-600">
                    {activities.map((a) => `${a.emoji} ${a.label}`).join(" · ")}
                  </p>
                )}

                <Link
                  href={`/r/${link.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand"
                >
                  View details →
                </Link>
              </div>
            );
          })}
        </div>

        {purchases && purchases.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Purchases
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {purchases.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-neutral-800">{p.package}</span>
                  <span className={p.status === "completed" ? "text-brand" : "text-neutral-500"}>
                    {p.status === "completed" ? "Completed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
