import { DEFAULT_MODE } from "@/config/modes";
import { isLinkMode, type LinkMode } from "@/types/flow";

/**
 * Everything he typed before hitting the paywall.
 *
 * Buying credits means leaving for Stripe and coming back on a fresh page
 * load, which wiped the whole form. Asking someone to retype her name,
 * the personal line and the days *immediately after taking their money*
 * is the worst possible moment to lose their work, so the draft is parked
 * here for the round trip and cleared the moment the link exists.
 */
export interface CreateDraft {
  matchName: string;
  personalNote: string;
  selectedDays: string[];
  mode: LinkMode;
  senderName: string;
  instagramHandle: string;
  notifyEmail: string;
}

const KEY = "yeslink:create-draft:v1";

export function saveCreateDraft(draft: CreateDraft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Private browsing can refuse storage. Losing the draft is bad, but
    // blocking the purchase over it would be worse.
  }
}

export function loadCreateDraft(): CreateDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CreateDraft>;
    // A draft is only worth restoring if it still has the parts the API
    // requires; anything less would fail validation and look like a bug.
    if (!parsed.matchName || !parsed.personalNote || !parsed.selectedDays?.length) {
      return null;
    }

    return {
      matchName: parsed.matchName,
      personalNote: parsed.personalNote,
      selectedDays: parsed.selectedDays,
      mode: isLinkMode(parsed.mode) ? parsed.mode : DEFAULT_MODE,
      senderName: parsed.senderName ?? "",
      instagramHandle: parsed.instagramHandle ?? "",
      notifyEmail: parsed.notifyEmail ?? "",
    };
  } catch {
    return null;
  }
}

export function clearCreateDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to do
  }
}
