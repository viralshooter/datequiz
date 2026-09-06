export type PackageId = "pack_3" | "pack_10" | "remove_watermark";

export interface PricingPackage {
  id: PackageId;
  label: string;
  description: string;
  priceLabel: string;
  priceCents: number;
  /** Credits (links) added on purchase. 0 for the watermark removal. */
  credits: number;
  /** Name of the env var holding this package's Stripe Price ID. */
  stripePriceEnv: string;
}

/** Packages on sale when PAYMENTS_ENABLED is true. */
export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: "pack_3",
    label: "3 links",
    description: "For trying with more than one match",
    priceLabel: "$4.99",
    priceCents: 499,
    credits: 3,
    stripePriceEnv: "STRIPE_PRICE_PACK_3",
  },
  {
    id: "pack_10",
    label: "10 links",
    description: "The stash for serial rapid-fire senders",
    priceLabel: "$9.99",
    priceCents: 999,
    credits: 10,
    stripePriceEnv: "STRIPE_PRICE_PACK_10",
  },
  {
    id: "remove_watermark",
    label: "Remove watermark",
    description: 'Drop the "made with Yeslink" badge from your links',
    priceLabel: "$2.99",
    priceCents: 299,
    credits: 0,
    stripePriceEnv: "STRIPE_PRICE_REMOVE_WATERMARK",
  },
];

export function getPackageById(id: string): PricingPackage | undefined {
  return PRICING_PACKAGES.find((p) => p.id === id);
}
