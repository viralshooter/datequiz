"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/events";

/**
 * The homepage's main CTA, wrapped just enough to fire an event on click.
 *
 * Kept as a small isolated client component rather than making the whole
 * landing page a client component: the page needs to stay a static Server
 * Component to be servable from the CDN, and a "use client" leaf here
 * doesn't change that — only this one link hydrates.
 *
 * Without this, "did he click through" was invisible: the only funnel
 * signal was an anonymous-session row created on /create, which conflates
 * "never clicked" with "clicked, and something on the next page failed."
 */
export function TrackedCtaLink(props: ComponentProps<typeof Link>) {
  return (
    <Link {...props} onClick={() => trackEvent("landing_cta_clicked")} />
  );
}
