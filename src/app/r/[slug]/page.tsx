import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PlayfulBackground } from "@/components/PlayfulBackground";
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

  // A real 404 rather than a 200 saying "not found": this page is also
  // hit by link checkers and mail clients.
  if (!link) notFound();

  // No session check here: like /d/[slug], the slug (random and
  // unguessable) is already the access key. Needed because the link
  // in the notification email must work from another device too, or
  // before the account email is confirmed.
  const { data: answer } = await admin
    .from("answers")
    .select(
      "selected_activities, selected_days, activity_ranking, counter_condition, ending_type, vetoed_activity, reveal_activities, responded_at"
    )
    .eq("link_id", link.id)
    .maybeSingle();

  if (!answer) {
    return (
      <Shell>
        <div className="text-5xl">⏳</div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">
          Waiting for {link.match_name} to answer
        </h1>
        <p className="mt-2 text-neutral-600">Check back here once she&apos;s answered.</p>
      </Shell>
    );
  }

  const rankingIds = (
    (answer.activity_ranking as ActivityId[])?.length
      ? (answer.activity_ranking as ActivityId[])
      : (answer.selected_activities as ActivityId[])
  ) ?? [];
  const ranked = rankingIds
    .map((id) => ACTIVITIES.find((a) => a.id === id))
    .filter((a): a is (typeof ACTIVITIES)[number] => Boolean(a));

  const selectedDays = (answer.selected_days as string[]) ?? [];
  const condition = (answer.counter_condition as string) ?? "";
  const endingType = (answer.ending_type as string) ?? "classic";
  const vetoed = ACTIVITIES.find((a) => a.id === answer.vetoed_activity);
  // Older rows predate the column and default to true, which is correct
  // for them: they were all classic endings.
  const reveal = answer.reveal_activities !== false;

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        {link.match_name}&apos;s answer
      </p>

      <div className="mt-3 text-6xl">
        {endingType === "blind" ? "🕶️" : endingType === "rare" ? "🌟" : "🎉"}
      </div>

      <h1 className="mt-3 text-2xl font-extrabold text-ink">She said yes!</h1>
      {endingType === "rare" && (
        <p className="mt-1 text-sm font-black uppercase tracking-widest text-amber-600">
          Rare card drawn
        </p>
      )}

      {reveal ? (
        <Card title="Her ranking, best first">
          <ol className="mt-2 flex flex-col gap-2">
            {ranked.map((a, i) => (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                  i === 0 ? "bg-brand/15 font-black text-brand-dark" : "text-neutral-600"
                }`}
              >
                <span className="w-5 text-sm font-black text-neutral-400">{i + 1}</span>
                <span className="text-lg">{a.emoji}</span>
                <span>{a.label}</span>
                {i === 0 && <span className="ml-auto text-xs uppercase tracking-widest">winner</span>}
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <Card title="What she picked">
          <div className="mt-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-6 text-center">
            <p className="text-4xl">🔒</p>
            <p className="mt-2 font-black text-indigo-800">Sealed until the day</p>
            <p className="mt-1 text-sm text-indigo-700/80">
              She drew the blind card. She knows what you&apos;re doing. You don&apos;t.
            </p>
          </div>
        </Card>
      )}

      <Card title="Days that work">
        <ul className="mt-2 flex flex-wrap gap-2">
          {selectedDays.map((day) => (
            <li
              key={day}
              className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand-dark"
            >
              {day}
            </li>
          ))}
        </ul>
      </Card>

      {condition && (
        <Card title="Her one condition">
          <p className="mt-2 text-lg font-black text-ink">{condition}</p>
          <p className="mt-1 text-xs text-neutral-500">You already agreed. Sorry.</p>
        </Card>
      )}

      {vetoed && (
        <Card title="Vetoed">
          <p className="mt-2 text-lg font-black text-red-600 line-through">
            {vetoed.emoji} {vetoed.label}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Don&apos;t suggest it.</p>
        </Card>
      )}

      <Link href="/create" className="mt-8 text-sm font-semibold text-brand">
        + Create another Yeslink
      </Link>
    </Shell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 w-full rounded-2xl border-[3px] border-ink bg-white p-5 text-left shadow-[5px_5px_0_0_#1a1a1f]">
      <p className="text-sm font-semibold text-neutral-600">{title}</p>
      {children}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        {children}
      </div>
    </div>
  );
}
