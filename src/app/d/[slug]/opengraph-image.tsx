import { ImageResponse } from "next/og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CREAM, GREEN, INK, OG_SIZE, PINK, YELLOW, loadOgFonts } from "@/lib/og";

export const alt = "Yeslink";
export const size = OG_SIZE;
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data: link } = await admin
    .from("links")
    .select("match_name, instagram_handle, sender_name, personal_note")
    .eq("slug", slug)
    .maybeSingle();

  const matchName = link?.match_name ?? "you";
  const handle = (link?.instagram_handle as string | undefined) ?? "";
  const senderName = (link?.sender_name as string | undefined) ?? "";
  const rawNote = (link?.personal_note as string | undefined) ?? "";
  // Keep the card readable: a 180-char note would crowd out the headline.
  const note = rawNote.length > 100 ? `${rawNote.slice(0, 100).trimEnd()}…` : rawNote;

  const leadLine = `${matchName}, I've got a`;
  // Long names would otherwise push the headline off the card. Stepped
  // rather than continuous so the common cases all share one size.
  const headline = leadLine.length > 26 ? 50 : leadLine.length > 20 ? 58 : 66;

  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          fontFamily: "Geist",
          position: "relative",
          overflow: "hidden",
          padding: "48px 60px",
        }}
      >
        {/* Sticker confetti, bled off the edges so the card reads as a
            crop of something bigger rather than a centred poster. */}
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: 999,
            background: GREEN,
            opacity: 0.18,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -70,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: YELLOW,
            opacity: 0.22,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 70,
            width: 40,
            height: 40,
            borderRadius: 999,
            background: PINK,
            border: `3px solid ${INK}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 110,
            right: 84,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: GREEN,
            border: `3px solid ${INK}`,
            display: "flex",
          }}
        />

        {(handle || senderName) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 26,
              padding: "10px 26px",
              borderRadius: 999,
              background: "#ffffff",
              border: `3px solid ${INK}`,
              boxShadow: `4px 4px 0 0 ${INK}`,
              fontSize: 26,
              color: INK,
            }}
          >
            <span style={{ fontWeight: 500, color: "#6b6660" }}>sent by</span>
            <span style={{ fontWeight: 900 }}>
              {senderName && handle ? `${senderName} · @${handle}` : senderName || `@${handle}`}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: headline,
            fontWeight: 900,
            color: INK,
            lineHeight: 1.1,
          }}
        >
          {leadLine}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "4px 20px 10px 20px",
              borderRadius: 16,
              background: YELLOW,
              border: `3px solid ${INK}`,
              boxShadow: `5px 5px 0 0 ${INK}`,
              transform: "rotate(-1.5deg)",
              fontSize: headline,
              fontWeight: 900,
              color: INK,
              lineHeight: 1.1,
            }}
          >
            question
          </div>
          <div
            style={{
              display: "flex",
              fontSize: headline,
              fontWeight: 900,
              color: INK,
              lineHeight: 1.1,
            }}
          >
            for you
          </div>
          <div style={{ display: "flex", fontSize: headline - 8 }}>👀</div>
        </div>

        {note && (
          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 880,
              padding: "18px 28px",
              borderRadius: 26,
              borderBottomLeftRadius: 6,
              background: "#ffffff",
              border: `3px solid ${INK}`,
              boxShadow: `6px 6px 0 0 ${INK}`,
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "#3f3b36",
              textAlign: "center",
            }}
          >
            {note}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 22px",
              borderRadius: 999,
              background: GREEN,
              border: `3px solid ${INK}`,
              boxShadow: `4px 4px 0 0 ${INK}`,
              fontSize: 24,
              fontWeight: 900,
              color: INK,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 32 32">
              <path
                d="M8 17l5 5 11-13"
                stroke={INK}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Yeslink
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#6b6660" }}>
            30 seconds
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
