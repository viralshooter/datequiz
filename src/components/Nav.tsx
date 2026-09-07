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
        <span className="flex h-9 w-9 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-brand bg-ink-2 transition-transform group-hover:rotate-6">
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
        <span className="flex flex-col leading-none">
          <span className="text-lg font-black text-white">Yeslink</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-brand sm:block">
            Hook her with a laugh
          </span>
        </span>
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
          className="rounded-full border-2 border-brand bg-brand px-4 py-2 text-sm font-black text-ink shadow-[4px_4px_0_0_rgba(34,197,94,0.4)] transition-transform hover:-translate-y-0.5 hover:rotate-1 active:translate-y-0 active:scale-95"
        >
          Create a link
        </Link>
      </div>
    </nav>
  );
}
