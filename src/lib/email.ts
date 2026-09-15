import { Resend } from "resend";

interface AnswerNotificationParams {
  to: string;
  matchName: string;
  slug: string;
}

export type EmailResult = { ok: true } | { ok: false; reason: string };

/**
 * Email notification to "him" when she answers.
 *
 * Never throws: the answer is already saved by the time this runs, and a
 * failed send must not undo that. It reports the failure instead, because
 * "she said yes and he never found out" is the worst way this product can
 * break, and it must not be invisible.
 */
export async function sendAnswerNotification({
  to,
  matchName,
  slug,
}: AnswerNotificationParams): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "missing_api_key" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yeslink.app";
  const resultUrl = `${siteUrl}/r/${slug}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // yeslink.app is verified in Resend, so notifications now come from the
      // real brand rather than resend.dev's shared sender — which is both
      // better deliverability and one less reason to look like spam.
      from: "Yeslink <hey@yeslink.app>",
      to,
      subject: `${matchName} answered! 🎉`,
      html: `
        <p>Hey,</p>
        <p><strong>${matchName}</strong> answered your invite on Yeslink.</p>
        <p><a href="${resultUrl}">See what she picked →</a></p>
      `,
    });

    // The SDK resolves with an error object instead of throwing on an API
    // error, so a catch block alone sees none of these — the daily sending
    // cap included, which is precisely the failure worth knowing about.
    if (error) {
      const name = error.name ?? "resend_error";
      return { ok: false, reason: error.message ? `${name}: ${error.message}` : name };
    }

    return { ok: true };
  } catch (err) {
    // Network-level failure, which the SDK does throw for.
    return { ok: false, reason: err instanceof Error ? err.message : "unknown_error" };
  }
}
