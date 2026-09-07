"use client";

import { useState } from "react";
import { PRICING_PACKAGES, type PackageId } from "@/config/pricing";
import { trackEvent } from "@/lib/events";

interface PaywallProps {
  userId: string;
  onCancel: () => void;
}

export function Paywall({ userId, onCancel }: PaywallProps) {
  const [loadingPackage, setLoadingPackage] = useState<PackageId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packageId: PackageId) {
    setLoadingPackage(packageId);
    setError(null);
    trackEvent("checkout_started", undefined, { package: packageId });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: packageId, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout isn't available right now.");
        setLoadingPackage(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout isn't available right now.");
      setLoadingPackage(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">You're out of free links ✋</h1>
      <p className="mt-2 text-neutral-600">Pick a package to keep creating links.</p>

      <div className="mt-6 flex flex-col gap-3">
        {PRICING_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            disabled={loadingPackage !== null}
            onClick={() => buy(pkg.id)}
            className="flex items-center justify-between rounded-xl border-[3px] border-ink bg-white px-5 py-4 text-left shadow-[4px_4px_0_0_#1a1a1f] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <span>
              <span className="block font-black text-ink">{pkg.label}</span>
              <span className="block text-sm text-neutral-600">{pkg.description}</span>
            </span>
            <span className="font-extrabold text-brand-dark">
              {loadingPackage === pkg.id ? "…" : pkg.priceLabel}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button type="button" onClick={onCancel} className="mt-6 text-sm font-semibold text-neutral-500">
        ← Go back
      </button>
    </div>
  );
}
