"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The moment right after paying.
 *
 * Stripe returns before its webhook has necessarily landed, so the credits
 * may genuinely not be there yet. Rather than showing a stale balance and
 * letting him think the payment failed, this says the payment arrived and
 * quietly re-checks until the credit shows up.
 */
export function CheckoutBanner({
  status,
  settled,
}: {
  status: "success" | "cancel";
  settled: boolean;
}) {
  const router = useRouter();
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    if (status !== "success" || settled || waited >= 5) return;
    const t = window.setTimeout(() => {
      setWaited((n) => n + 1);
      router.refresh();
    }, 2000);
    return () => window.clearTimeout(t);
  }, [status, settled, waited, router]);

  if (status === "cancel") {
    return (
      <div className="mb-6 rounded-2xl border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_0_#1a1a1f]">
        <p className="font-black text-ink">Payment cancelled</p>
        <p className="mt-1 text-sm text-neutral-600">
          Nothing was charged. Your credits are unchanged.
        </p>
      </div>
    );
  }

  if (!settled) {
    return (
      <div className="mb-6 rounded-2xl border-[3px] border-ink bg-amber-100 p-4 shadow-[5px_5px_0_0_#1a1a1f]">
        <p className="font-black text-amber-900">Payment received — confirming…</p>
        <p className="mt-1 text-sm text-amber-900/80">
          {waited >= 5
            ? "This is taking longer than usual. Your credits will appear here shortly; nothing is lost."
            : "Your credits land here in a couple of seconds."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border-[3px] border-ink bg-brand p-4 shadow-[5px_5px_0_0_#1a1a1f]">
      <p className="font-black text-ink">Payment confirmed 🎉</p>
      <p className="mt-1 text-sm text-ink/80">Your credits are on your account, below.</p>
    </div>
  );
}
