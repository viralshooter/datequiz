import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountStateFromUser } from "@/lib/accountState";
import { Nav } from "@/components/Nav";
import { PlayfulBackground } from "@/components/PlayfulBackground";
import { FinishAccount } from "./FinishAccount";

export const dynamic = "force-dynamic";

/**
 * The landing place for the half-finished account.
 *
 * Someone who typed their email while creating a link has everything —
 * the link, the credits — but doesn't own it yet. Before this page they
 * had nowhere to go: the nav offered "Log in", and logging in with the
 * same address would have started a second account.
 */
export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = accountStateFromUser(user);

  if (account.kind === "active") redirect("/dashboard");
  if (account.kind === "guest") redirect("/login");

  const { data: links } = await supabase
    .from("links")
    .select("slug", { count: "exact" })
    .eq("creator_id", user!.id);

  return (
    <div className="relative min-h-dvh text-ink">
      <PlayfulBackground />
      <div className="relative z-10">
        <Nav />
        <div className="mx-auto w-full max-w-md px-6 py-8">
          <div className="mb-6 rounded-2xl border-[3px] border-amber-500 bg-amber-100 p-4">
            <p className="font-black text-amber-900">You&apos;re one step from done</p>
            <p className="mt-1 text-sm text-amber-900/80">
              {links?.length
                ? `Your ${links.length === 1 ? "link is" : `${links.length} links are`} saved here already.`
                : "Your account is created."}{" "}
              Confirming your email is what makes it reachable from any device.
            </p>
          </div>

          <FinishAccount pendingEmail={account.email} />
        </div>
      </div>
    </div>
  );
}
