import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Brand tokens for the share cards, mirroring the sticker style the app
 * itself uses: 3px near-black outlines and hard, un-blurred drop shadows.
 * Duplicated here rather than read from Tailwind because the OG renderer
 * (satori) never sees a stylesheet — it only gets inline styles.
 */
export const INK = "#1a1a1f";
export const CREAM = "#fff9f2";
export const GREEN = "#22c55e";
export const YELLOW = "#fbbf24";
export const PINK = "#f472b6";

/**
 * Geist, shipped in the repo rather than fetched from a CDN at render
 * time. A share card is the first thing anyone sees of a link, so it must
 * not depend on a third party being up — and without a real weight-900
 * file the renderer silently falls back to a regular weight, which is what
 * made these cards look nothing like the site.
 *
 * The literal path is deliberate: it lets the deploy's file tracing spot
 * the dependency and bundle the fonts.
 */
export async function loadOgFonts() {
  const [black, bold, medium] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Geist-900.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Geist-700.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Geist-500.ttf")),
  ]);

  return [
    { name: "Geist", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Geist", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}
