import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEventServer } from "@/lib/events";
import { DEFAULT_MODE } from "@/config/modes";
import { isLinkMode } from "@/types/flow";
import { DateFlow } from "./DateFlow";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getLink(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data: link } = await admin
    .from("links")
    .select(
      "id, slug, match_name, available_days, instagram_handle, sender_name, personal_note, seed, mode, watermark_enabled"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!link) return null;

  const { data: answer } = await admin
    .from("answers")
    .select("id")
    .eq("link_id", link.id)
    .maybeSingle();

  return { link, alreadyAnswered: Boolean(answer) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getLink(slug);
  if (!result) return { title: "Yeslink" };

  const handle = result.link.instagram_handle as string;
  const senderName = result.link.sender_name as string;
  const note = result.link.personal_note as string;

  const title = senderName
    ? `${result.link.match_name}, it's ${senderName} — I've got a question for you 💌`
    : `${result.link.match_name}, I've got a question for you 💌`;

  const from = handle ? `From @${handle}` : null;
  const description = [note || null, from, "30 seconds, no strings attached."]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description,
    // The slug is unguessable, but a leaked URL (browser bar, a shared
    // screenshot, a toolbar that phones home) must not put someone's
    // private note into a search index.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function YeslinkPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getLink(slug);
  if (!result) notFound();

  const { link, alreadyAnswered } = result;

  const admin = createSupabaseAdminClient();
  await trackEventServer(admin, "link_opened", slug);

  return (
    <DateFlow
      slug={slug}
      seed={(link.seed as number) ?? 0}
      mode={isLinkMode(link.mode) ? link.mode : DEFAULT_MODE}
      matchName={link.match_name}
      availableDays={link.available_days as string[]}
      instagramHandle={link.instagram_handle as string}
      senderName={link.sender_name as string}
      personalNote={link.personal_note as string}
      alreadyAnswered={alreadyAnswered}
      watermarkEnabled={link.watermark_enabled !== false}
    />
  );
}
