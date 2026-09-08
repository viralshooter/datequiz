import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { EVENT_FUNNEL_ORDER, type EventType } from "@/lib/events";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

const STEP_LABELS: Record<EventType, string> = {
  link_created: "Links created",
  link_opened: "Links opened",
  answered_yes: "Said yes",
  tournament_completed: "Tournament finished",
  counter_condition_chosen: "Terms set",
  badge_clicked: "Badge clicks",
  checkout_started: "Checkouts started",
  purchase_completed: "Purchases completed",
  // Diagnostics rather than funnel steps — the twist_shown/twist_skipped
  // ratio per id is what says which twists to prune from the deck.
  cold_open_variant: "Cold opens",
  drumroll_completed: "Drumroll holds",
  twist_shown: "Twists shown",
  twist_skipped: "Twists skipped",
  jolly_triggered: "Rare cards drawn",
  ending_type: "Endings reached",
  activities_selected: "Activities picked (legacy)",
};

async function countEvent(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  eventType: EventType
): Promise<number> {
  const { count } = await admin
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", eventType);
  return count ?? 0;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = isValidAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!authed) {
    return <AdminLogin />;
  }

  const admin = createSupabaseAdminClient();
  const counts = await Promise.all(EVENT_FUNNEL_ORDER.map((type) => countEvent(admin, type)));
  const funnel = EVENT_FUNNEL_ORDER.map((type, i) => ({ type, count: counts[i] }));

  const first = funnel[0]?.count || 1;
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Yeslink · Admin</h1>
        <span
          className="rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Payments: {PAYMENTS_ENABLED ? "live" : "off (validation)"}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Links created" value={funnel[0]?.count ?? 0} />
        <StatTile label="Yes" value={funnel.find((f) => f.type === "answered_yes")?.count ?? 0} />
        <StatTile label="Activities picked" value={funnel.find((f) => f.type === "activities_selected")?.count ?? 0} />
        <StatTile label="Purchases" value={funnel.find((f) => f.type === "purchase_completed")?.count ?? 0} />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Conversion funnel
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {funnel.map((step, i) => {
          const prev = i > 0 ? funnel[i - 1].count : null;
          const pctOfPrev = prev ? Math.round((step.count / (prev || 1)) * 100) : null;
          const pctOfFirst = Math.round((step.count / first) * 100);
          const widthPct = Math.max((step.count / maxCount) * 100, step.count > 0 ? 3 : 0);

          return (
            <div key={step.type}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {STEP_LABELS[step.type]}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {step.count}
                  {pctOfPrev !== null && (
                    <span style={{ color: "var(--muted)" }}> · {pctOfPrev}% of previous step</span>
                  )}
                  <span style={{ color: "var(--muted)" }}> · {pctOfFirst}% of total</span>
                </span>
              </div>
              <div
                className="mt-1.5 h-3 w-full overflow-hidden rounded-full"
                style={{ background: "var(--gridline)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${widthPct}%`, background: "var(--series-1)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
    </div>
  );
}
