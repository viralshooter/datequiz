import type { ReactNode } from "react";

function Phone({
  children,
  caption,
  className = "",
}: {
  children: ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 transition-transform duration-200 hover:z-20 hover:-translate-y-2 hover:rotate-0 ${className}`}
    >
      <div className="w-[178px] rounded-[1.75rem] border-[5px] border-ink bg-white p-2.5 shadow-[8px_8px_0_0_#1a1a1f] sm:w-[188px]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/15" />
        <div className="flex h-[300px] flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-cream via-white to-white px-3 py-4">
          {children}
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">
        {caption}
      </p>
    </div>
  );
}

/** The three screens she actually goes through, rebuilt in markup rather than
 * captured as images so they stay sharp at any size and never drift from the
 * real UI. */
export function AppScreens() {
  return (
    <div className="-mx-6 flex snap-x items-start gap-4 overflow-x-auto px-6 pb-4 pt-2 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:-space-x-7 lg:px-0">
      <Phone caption="1. The invite" className="z-10 snap-center lg:-rotate-6">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[9px] font-bold text-neutral-500">
            sent by <span className="text-ink">@marco.b</span> ↗
          </span>
          <span className="text-4xl">💌</span>
          <p className="text-lg font-black leading-tight text-ink">Hey Emma 👋</p>
          <p className="-mt-1 text-[11px] font-bold text-neutral-500">it&apos;s Marco</p>
          <div className="rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-3 py-2 text-[11px] leading-snug text-neutral-700 shadow-sm">
            Still thinking about your take on pineapple pizza. Settle this in person?
          </div>
          <div className="mt-1 w-full rounded-full bg-brand-dark py-2 text-xs font-black text-white">
            Let&apos;s go →
          </div>
        </div>
      </Phone>

      <Phone caption="2. The trick" className="z-20 snap-center lg:rotate-1 lg:-translate-y-3">
        <div className="relative h-full">
          <p className="pt-3 text-center text-base font-black leading-snug text-ink">
            Emma, will you go out with me?
          </p>

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-brand/40">
            YES
          </span>

          <span className="absolute -right-1 top-[28%] rotate-12 rounded-full border-2 border-neutral-200 bg-white px-4 py-2 text-sm font-black text-neutral-400">
            NO
          </span>
          <span className="absolute left-5 top-[60%] text-lg opacity-70">💨</span>
          <span className="absolute bottom-12 right-7 text-lg opacity-50">💨</span>

          <p className="absolute inset-x-0 bottom-1 text-center text-[9px] text-neutral-400">
            (NO is a little slippery 😏)
          </p>
        </div>
      </Phone>

      <Phone caption="3. She picks" className="z-10 snap-center lg:rotate-6">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-black text-ink">What are you in the mood for? 🎈</p>
          <div className="mt-1 grid w-full grid-cols-2 gap-1.5">
            {[
              { emoji: "🍝", label: "Dinner", on: false },
              { emoji: "🥂", label: "Drinks", on: true },
              { emoji: "🏋️", label: "Sport", on: false },
              { emoji: "🎯", label: "Experience", on: true },
              { emoji: "🖼️", label: "Culture", on: false },
              { emoji: "🏞️", label: "Outdoor", on: false },
            ].map((a) => (
              <div
                key={a.label}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 py-2 ${
                  a.on ? "border-brand-dark bg-brand/10" : "border-neutral-200 bg-white"
                }`}
              >
                {a.on && (
                  <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-dark text-[7px] text-white">
                    ✓
                  </span>
                )}
                <span className="text-base">{a.emoji}</span>
                <span className="text-[9px] font-bold text-neutral-700">{a.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 w-full rounded-full bg-brand-dark py-2 text-xs font-black text-white">
            Continue →
          </div>
        </div>
      </Phone>
    </div>
  );
}
