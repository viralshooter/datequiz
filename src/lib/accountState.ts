import type { User } from "@supabase/supabase-js";

/**
 * There are three account states, not two — and the missing middle one is
 * what made the app impossible to read.
 *
 * A user who typed their email while creating a link has an account with
 * their links and credits on it, but stays `is_anonymous` until they
 * confirm. Supabase parks the address in `new_email` and leaves `email`
 * empty. Treating that as "logged out" is why the nav said "Log in" to
 * people who already had an account, and why the dashboard turned them
 * away.
 */
export type AccountState =
  | { kind: "guest" }
  | { kind: "pending"; email: string }
  | { kind: "active"; email: string };

export function accountStateFromUser(user: User | null | undefined): AccountState {
  if (!user) return { kind: "guest" };

  if (user.is_anonymous === false) {
    return { kind: "active", email: user.email ?? "" };
  }

  const pendingEmail = user.new_email || user.email || "";
  if (pendingEmail) return { kind: "pending", email: pendingEmail };

  return { kind: "guest" };
}

/** Only a confirmed account may hold anything that was paid for. */
export function canPurchase(state: AccountState): boolean {
  return state.kind === "active";
}
