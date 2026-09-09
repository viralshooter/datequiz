import { Resend } from "resend";

interface AnswerNotificationParams {
  to: string;
  matchName: string;
  slug: string;
}

/**
 * Email notification to "him" when she answers. Best-effort: callers
 * must wrap it in try/catch and never let a send failure break saving
 * the answer.
 */
export async function sendAnswerNotification({ to, matchName, slug }: AnswerNotificationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yeslink.app";
  const resultUrl = `${siteUrl}/r/${slug}`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
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
}
