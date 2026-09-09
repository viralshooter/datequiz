import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountStateFromUser } from "@/lib/accountState";
import { SignOutButton } from "./SignOutButton";

export async function Nav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = accountStateFromUser(user);

  let credits: number | null = null;
  if (account.kind === "active" && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();
    credits = profile?.credits ?? 0;
  }

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-5">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 rotate-[-6deg] items-center justify-center rounded-2xl border-[3px] border-ink bg-brand shadow-[3px_3px_0_0_#1a1a1f] transition-transform group-hover:rotate-6">
          <svg width="20" height="20" viewBox="0 0 32 32">
            <path
              d="M9 17l5 5 9-11"
              stroke="#1a1a1f"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-lg font-black text-ink">Yeslink</span>
          <span className="hidden text-[10px] font-black uppercase tracking-widest text-brand-dark sm:block">
            Hook her with a laugh
          </span>
        </span>
      </Link>

      <div className="flex min-w-0 items-center gap-3">
        {account.kind === "active" && (
          <>
            {/* Who you are and what you have, stated rather than implied. */}
            <Link
              href="/dashboard"
              className="hidden min-w-0 items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 sm:flex"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
              <span className="max-w-[11rem] truncate text-xs font-bold text-neutral-600">
                {account.email}
              </span>
              {credits !== null && (
                <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-black text-brand-dark">
                  {credits}
                </span>
              )}
            </Link>
            <Link href="/dashboard" className="text-sm font-bold text-neutral-600 hover:text-ink sm:hidden">
              Dashboard
            </Link>
            <SignOutButton />
          </>
        )}

        {/* The state that used to be invisible: they have an account and
            credits, but it isn't theirs until the address is confirmed. */}
        {account.kind === "pending" && (
          <Link
            href="/account"
            className="flex min-w-0 items-center gap-2 rounded-full border-2 border-amber-500 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900"
          >
            <span aria-hidden>⚠️</span>
            <span className="truncate">Confirm your email</span>
          </Link>
        )}

        {account.kind === "guest" && (
          <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-ink">
            Log in
          </Link>
        )}

        <Link
          href="/create"
          className="shrink-0 rounded-full border-[3px] border-ink bg-brand px-4 py-2 text-sm font-black text-ink shadow-[4px_4px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 hover:rotate-1 active:translate-y-0 active:scale-95"
        >
          Create a link
        </Link>
      </div>
    </nav>
  );
}
