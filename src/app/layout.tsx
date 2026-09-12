import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Yeslink",
  description:
    "Turn that Hinge, Tinder or Bumble match into an actual date. One link she can't say no to.",
};

/** viewportFit: "cover" lets the page paint under the notch; the layouts
 * that sit against a screen edge pad themselves with env(safe-area-inset-*). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff9f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-cream text-ink">
        {children}
        {/* Page views and traffic sources. Cookieless and aggregate-only, so
            it needs no consent banner — unlike an ad-platform pixel. */}
        <Analytics />
      </body>
    </html>
  );
}
