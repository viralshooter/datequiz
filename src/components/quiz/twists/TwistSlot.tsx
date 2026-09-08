"use client";

import type { TwistContext, TwistId } from "@/types/flow";
import { AdBreak } from "./AdBreak";
import { Captcha } from "./Captcha";
import { FakeCrash } from "./FakeCrash";
import { Reviews } from "./Reviews";

const REGISTRY = {
  AD_BREAK: AdBreak,
  REVIEWS: Reviews,
  FAKE_CRASH: FakeCrash,
  CAPTCHA: Captcha,
} as const;

/** Renders whichever twist the seeded draw landed on for this slot. */
export function TwistSlot({
  id,
  ctx,
  onDone,
}: {
  id: TwistId;
  ctx: TwistContext;
  onDone: (skipped: boolean) => void;
}) {
  const Component = REGISTRY[id];
  return <Component ctx={ctx} onDone={onDone} />;
}
