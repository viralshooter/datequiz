import { ImageResponse } from "next/og";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const alt = "Yeslink";
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
    .select("match_name, instagram_handle")
    .eq("slug", slug)
    .maybeSingle();

  const matchName = link?.match_name ?? "you";
  const handle = (link?.instagram_handle as string | undefined) ?? "";

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
          background: "linear-gradient(135deg, #fff9f2 0%, #fef3e2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {handle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
              padding: "10px 24px",
              borderRadius: 999,
              background: "#ffffff",
              border: "2px solid #e7e2d9",
              fontSize: 28,
              color: "#0a0a0b",
            }}
          >
            <span style={{ color: "#8a8378" }}>sent by</span>
            <span style={{ fontWeight: 700 }}>@{handle}</span>
          </div>
        )}

        <div style={{ fontSize: 120, display: "flex", marginBottom: 12 }}>👀</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#0a0a0b",
            textAlign: "center",
            maxWidth: 980,
            lineHeight: 1.15,
            display: "flex",
          }}
        >
          {matchName}, I've got a question for you
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "#16a34a",
            fontWeight: 700,
            display: "flex",
          }}
        >
          30 seconds · Yeslink
        </div>
      </div>
    ),
    { ...size }
  );
}
