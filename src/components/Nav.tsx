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
      <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-2">
          <svg width="18" height="18" viewBox="0 0 32 32">
            <path
              d="M9 17l5 5 9-11"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
        Yeslink
      </Link>

      <div className="flex items-center gap-5">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="text-sm font-semibold text-neutral-300 hover:text-white">
              Dashboard
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-neutral-300 hover:text-white">
            Log in
          </Link>
        )}
        <Link
          href="/create"
          className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-transform active:scale-95"
        >
          Create a link
        </Link>
      </div>
    </nav>
  );
}
