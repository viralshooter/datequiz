"use client";

import { useRouter } from "next/navigation";
import { AccountGate } from "@/components/AccountGate";

export function FinishAccount({ pendingEmail }: { pendingEmail: string }) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_0_#1a1a1f] sm:p-8">
      <AccountGate
        defaultEmail={pendingEmail}
        onVerified={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      />
    </div>
  );
}
