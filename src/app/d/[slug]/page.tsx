import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEventServer } from "@/lib/events";
import { DateFlow } from "./DateFlow";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getLink(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data: link } = await admin
    .from("links")
    .select("id, slug, match_name, available_days")
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

  const title = `${result.link.match_name}, I've got a question for you 💌`;
  const description = "30 seconds, no strings attached. Promise. (Almost.)";

  return {
    title,
    description,
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
      matchName={link.match_name}
      availableDays={link.available_days as string[]}
      alreadyAnswered={alreadyAnswered}
    />
  );
}
