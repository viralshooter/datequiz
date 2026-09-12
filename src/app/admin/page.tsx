import { cookies } from "next/headers";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { EVENT_FUNNEL_ORDER, type EventType } from "@/lib/events";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

const STEP_LABELS: Partial<Record<EventType, string>> = {
  link_created: "Links created",
  link_opened: "Links opened",
  answered_yes: "Said yes",
  tournament_completed: "Tournament finished",
  counter_condition_chosen: "Terms set",
  badge_clicked: "Badge clicks",
  checkout_started: "Checkouts started",
  purchase_completed: "Purchases completed",
};

const WINDOWS = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "all", label: "All time", days: null },
] as const;

type WindowId = (typeof WINDOWS)[number]["id"];

interface CampaignRow {
  campaign: string;
  source: string;
  signups: number;
  links: number;
  purchases: number;
  revenue_cents: number;
}

function sinceFor(windowId: WindowId): string {
  const found = WINDOWS.find((w) => w.id === windowId) ?? WINDOWS[1];
  if (found.days === null) return new Date(0).toISOString();
  const since = new Date();
  if (found.id === "today") {
    since.setHours(0, 0, 0, 0);
  } else {
    since.setDate(since.getDate() - found.days);
  }
  return since.toISOString();
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const cookieStore = await cookies();
  if (!isValidAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    return <AdminLogin />;
  }

  const params = await searchParams;
  const windowId: WindowId =
    WINDOWS.find((w) => w.id === params.window)?.id ?? "7d";
  const since = sinceFor(windowId);

  const admin = createSupabaseAdminClient();

  const [funnelCounts, revenue, signups, campaigns] = await Promise.all([
    Promise.all(
      EVENT_FUNNEL_ORDER.map(async (type) => {
        const { count } = await admin
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("event_type", type)
          .gte("created_at", since);
        return { type, count: count ?? 0 };
      })
    ),
    admin
      .from("purchases")
      .select("amount_cents")
      .eq("status", "completed")
      .gte("created_at", since),
    admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    admin.rpc("campaign_report", { p_since: since }),
  ]);

  const revenueCents = (revenue.data ?? []).reduce(
    (total, row) => total + (row.amount_cents ?? 0),
    0
  );
  const paidCount = (revenue.data ?? []).length;
  const campaignRows = ((campaigns.data as CampaignRow[] | null) ?? []).filter(
    (row) => row.signups > 0
  );
  const campaignError = campaigns.error?.message ?? null;

  const linksCreated = funnelCounts.find((f) => f.type === "link_created")?.count ?? 0;
  const first = linksCreated || 1;
  const maxCount = Math.max(...funnelCounts.map((f) => f.count), 1);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Yeslink · Admin</h1>
        <span
          className="rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Payments: {PAYMENTS_ENABLED ? "live" : "off (validation)"}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {WINDOWS.map((w) => {
          const active = w.id === windowId;
          return (
            <Link
              key={w.id}
              href={`/admin?window=${w.id}`}
              className="rounded-full border px-4 py-1.5 text-sm font-semibold"
              style={{
                borderColor: active ? "var(--series-1)" : "var(--border)",
                background: active ? "var(--series-1-soft)" : "var(--surface-1)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {w.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Revenue" value={money(revenueCents)} accent />
        <StatTile label="Paying customers" value={String(paidCount)} />
        <StatTile label="New signups" value={String(signups.count ?? 0)} />
        <StatTile label="Links created" value={String(linksCreated)} />
      </div>

      <SectionTitle>By campaign</SectionTitle>
      <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
        Grouped by the campaign a user first arrived from. Counts people who
        arrived in this window, and everything they have spent since.
      </p>

      {campaignError ? (
        <p className="mt-4 rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          Campaign report unavailable: {campaignError}. Has migration 009 been applied?
        </p>
      ) : campaignRows.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          No arrivals in this window yet.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr style={{ color: "var(--text-secondary)" }}>
                <Th align="left">Campaign</Th>
                <Th align="left">Source</Th>
                <Th>Signups</Th>
                <Th>Links</Th>
                <Th>Paid</Th>
                <Th>Revenue</Th>
              </tr>
            </thead>
            <tbody>
              {campaignRows.map((row) => (
                <tr key={`${row.campaign}-${row.source}`} style={{ borderTop: "1px solid var(--gridline)" }}>
                  <Td align="left" bold>{row.campaign}</Td>
                  <Td align="left">{row.source}</Td>
                  <Td>{row.signups}</Td>
                  <Td>{row.links}</Td>
                  <Td>{row.purchases}</Td>
                  <Td bold>{money(row.revenue_cents)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionTitle>Conversion funnel</SectionTitle>

      <div className="mt-4 flex flex-col gap-4">
        {funnelCounts.map((step, i) => {
          const prev = i > 0 ? funnelCounts[i - 1].count : null;
          const pctOfPrev = prev ? Math.round((step.count / (prev || 1)) * 100) : null;
          const pctOfFirst = Math.round((step.count / first) * 100);
          const widthPct = Math.max((step.count / maxCount) * 100, step.count > 0 ? 3 : 0);

          return (
            <div key={step.type}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {STEP_LABELS[step.type] ?? step.type}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {step.count}
                  {pctOfPrev !== null && (
                    <span style={{ color: "var(--muted)" }}> · {pctOfPrev}% of previous</span>
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

      <p className="mt-10 text-xs" style={{ color: "var(--muted)" }}>
        Visits and traffic sources live in Vercel Analytics. Payouts and
        refunds live in Stripe. This page is the bit in between.
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-10 text-sm font-semibold uppercase tracking-wide"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </h2>
  );
}

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`pb-2 text-xs font-semibold uppercase tracking-wide ${align === "left" ? "text-left" : "text-right"}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = "right",
  bold,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  bold?: boolean;
}) {
  return (
    <td
      className={`py-2.5 ${align === "left" ? "text-left" : "text-right"} ${bold ? "font-bold" : ""}`}
      style={{ color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}
    >
      {children}
    </td>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: accent ? "var(--series-1)" : "var(--border)",
        background: accent ? "var(--series-1-soft)" : "var(--surface-1)",
      }}
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
