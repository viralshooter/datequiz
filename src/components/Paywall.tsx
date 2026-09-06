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
        setError(data.error ?? "Checkout non disponibile al momento.");
        setLoadingPackage(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout non disponibile al momento.");
      setLoadingPackage(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-neutral-900">Hai finito i link gratuiti ✋</h1>
      <p className="mt-2 text-neutral-600">Scegli un pacchetto per continuare a creare link.</p>

      <div className="mt-6 flex flex-col gap-3">
        {PRICING_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            disabled={loadingPackage !== null}
            onClick={() => buy(pkg.id)}
            className="flex items-center justify-between rounded-xl border-2 border-neutral-200 px-5 py-4 text-left transition-colors hover:border-rose-400 disabled:opacity-50"
          >
            <span>
              <span className="block font-bold text-neutral-900">{pkg.label}</span>
              <span className="block text-sm text-neutral-500">{pkg.description}</span>
            </span>
            <span className="font-extrabold text-rose-500">
              {loadingPackage === pkg.id ? "…" : pkg.priceLabel}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button type="button" onClick={onCancel} className="mt-6 text-sm font-semibold text-neutral-400">
        ← Torna indietro
      </button>
    </div>
  );
}
