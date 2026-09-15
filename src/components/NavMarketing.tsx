import Link from "next/link";
import { NavBrand } from "./NavBrand";

/**
 * The landing page's nav — deliberately knows nothing about who is visiting.
 *
 * Reading the session here is what forced the whole marketing page to be
 * rendered per request, so it could never be served from the CDN. That cost
 * is paid on every ad click, by people who have no session to read in the
 * first place.
 *
 * Anyone with a real account is sent to /dashboard by the middleware before
 * this renders, so the only states left are guest and not-yet-confirmed —
 * and both have the same thing to do next: create a link.
 */
export function NavMarketing() {
  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-5">
      <NavBrand />

      <div className="flex min-w-0 items-center gap-3">
        <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-ink">
          Log in
        </Link>
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
