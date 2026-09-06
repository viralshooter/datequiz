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
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-extrabold text-neutral-900">
        DateQuiz 💌
      </Link>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="text-sm font-semibold text-neutral-600">
              Dashboard
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-neutral-600">
            Accedi
          </Link>
        )}
        <Link
          href="/create"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-rose-200"
        >
          Crea un link
        </Link>
      </div>
    </nav>
  );
}
