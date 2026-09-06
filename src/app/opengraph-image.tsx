import { ImageResponse } from "next/og";

export const alt = "Yeslink";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "#0a0a0b",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#141416",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32">
              <path
                d="M9 17l5 5 9-11"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          Yeslink
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 40,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: 900,
            display: "flex",
          }}
        >
          Chiediglielo prima che risponda un altro
        </div>
        <div style={{ marginTop: 20, fontSize: 26, color: "#22c55e", display: "flex" }}>
          Il link che non si può ignorare
        </div>
      </div>
    ),
    { ...size }
  );
}
