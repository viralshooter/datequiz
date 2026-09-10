import { ImageResponse } from "next/og";
import { CREAM, GREEN, INK, OG_SIZE, PINK, YELLOW, loadOgFonts } from "@/lib/og";

export const alt = "Yeslink";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -70,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: GREEN,
            opacity: 0.18,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -90,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: PINK,
            opacity: 0.18,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 110,
            width: 36,
            height: 36,
            borderRadius: 999,
            background: YELLOW,
            border: `3px solid ${INK}`,
            display: "flex",
          }}
        />

        {/* Wordmark, same lockup as the site header. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 66,
              height: 66,
              borderRadius: 999,
              background: GREEN,
              border: `3px solid ${INK}`,
              boxShadow: `4px 4px 0 0 ${INK}`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 32 32">
              <path
                d="M8 17l5 5 11-13"
                stroke={INK}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 900, color: INK }}>Yeslink</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: INK, lineHeight: 1.05 }}>
            Make her
          </div>
          <div
            style={{
              display: "flex",
              padding: "6px 26px 14px 26px",
              borderRadius: 20,
              background: YELLOW,
              border: `3px solid ${INK}`,
              boxShadow: `6px 6px 0 0 ${INK}`,
              transform: "rotate(-2deg)",
              fontSize: 86,
              fontWeight: 900,
              color: INK,
              lineHeight: 1.05,
            }}
          >
            laugh
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 86,
            fontWeight: 900,
            color: INK,
            lineHeight: 1.05,
          }}
        >
          into a yes
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            maxWidth: 860,
            fontSize: 30,
            fontWeight: 500,
            color: "#57534e",
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          Send her one link. The NO button runs away from her finger.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 30,
            padding: "10px 28px",
            borderRadius: 999,
            background: "#ffffff",
            border: `3px solid ${INK}`,
            boxShadow: `5px 5px 0 0 ${GREEN}`,
            fontSize: 24,
            fontWeight: 900,
            color: INK,
          }}
        >
          🎁 FIRST LINK FREE — NO CARD, NO CATCH
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
