import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export async function Nav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = Boolean(user) && user?.is_anonymous === false;

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-2xl border-[3px] border-ink bg-brand shadow-[3px_3px_0_0_#1a1a1f] transition-transform group-hover:rotate-6">
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

      <div className="flex items-center gap-5">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="text-sm font-bold text-neutral-600 hover:text-ink">
              Dashboard
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-ink">
            Log in
          </Link>
        )}
        <Link
          href="/create"
          className="rounded-full border-[3px] border-ink bg-brand px-4 py-2 text-sm font-black text-ink shadow-[4px_4px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 hover:rotate-1 active:translate-y-0 active:scale-95"
        >
          Create a link
        </Link>
      </div>
    </nav>
  );
}
