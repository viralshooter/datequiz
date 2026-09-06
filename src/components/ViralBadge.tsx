"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/events";

interface ViralBadgeProps {
  slug: string;
  /** distingue da dove arriva il click nel funnel di acquisizione */
  utmSource: "badge" | "respondent_cta";
  className?: string;
}

/**
 * Badge virale mostrato sulla pagina di lei (rimovibile a pagamento
 * tramite link.watermark_enabled). Porta alla home con UTM di
 * provenienza per misurare il loop di acquisizione.
 */
export function ViralBadge({ slug, utmSource, className }: ViralBadgeProps) {
  const href = `/?utm_source=${utmSource}&utm_medium=viral&utm_campaign=${slug}`;

  return (
    <Link
      href={href}
      onClick={() => trackEvent("badge_clicked", slug, { utm_source: utmSource })}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-xs font-semibold text-neutral-500 backdrop-blur transition-colors hover:border-brand-dark hover:text-brand-dark"
      }
    >
      ✅ creato con Yeslink — provalo anche tu
    </Link>
  );
}
