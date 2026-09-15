import Link from "next/link";

/** The wordmark lockup, shared by both navs so the marketing page can drop
 *  the session-aware one without the logo drifting out of sync. */
export function NavBrand() {
  return (
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
  );
}
