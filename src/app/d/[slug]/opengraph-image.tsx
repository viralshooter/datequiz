import { ImageResponse } from "next/og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const alt = "DateQuiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data: link } = await admin
    .from("links")
    .select("match_name")
    .eq("slug", slug)
    .maybeSingle();

  const matchName = link?.match_name ?? "tu";

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
          background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 45%, #fecdd3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 140, display: "flex", marginBottom: 12 }}>💌</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#881337",
            textAlign: "center",
            maxWidth: 980,
            lineHeight: 1.15,
            display: "flex",
          }}
        >
          {matchName}, ho una domanda per te
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "#e11d48",
            display: "flex",
          }}
        >
          30 secondi · DateQuiz
        </div>
      </div>
    ),
    { ...size }
  );
}
