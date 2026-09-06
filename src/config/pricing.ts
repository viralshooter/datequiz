export type PackageId = "pack_3" | "pack_10" | "remove_watermark";

export interface PricingPackage {
  id: PackageId;
  label: string;
  description: string;
  priceLabel: string;
  priceCents: number;
  /** Crediti (link) aggiunti all'acquisto. 0 per il watermark. */
  credits: number;
  /** Nome della env var che contiene lo Stripe Price ID di questo pacchetto. */
  stripePriceEnv: string;
}

/** Pacchetti in vendita quando PAYMENTS_ENABLED è true. */
export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: "pack_3",
    label: "3 link",
    description: "Per tentare con più di un match",
    priceLabel: "€4,99",
    priceCents: 499,
    credits: 3,
    stripePriceEnv: "STRIPE_PRICE_PACK_3",
  },
  {
    id: "pack_10",
    label: "10 link",
    description: "La scorta per i seriali del rapid-fire",
    priceLabel: "€9,99",
    priceCents: 999,
    credits: 10,
    stripePriceEnv: "STRIPE_PRICE_PACK_10",
  },
  {
    id: "remove_watermark",
    label: "Rimuovi watermark",
    description: 'Togli il badge "creato con Yeslink" dai tuoi link',
    priceLabel: "€2,99",
    priceCents: 299,
    credits: 0,
    stripePriceEnv: "STRIPE_PRICE_REMOVE_WATERMARK",
  },
];

export function getPackageById(id: string): PricingPackage | undefined {
  return PRICING_PACKAGES.find((p) => p.id === id);
}
