import { Resend } from "resend";

interface AnswerNotificationParams {
  to: string;
  matchName: string;
  slug: string;
}

/**
 * Notifica via email a "lui" quando lei risponde. Best-effort: chi la
 * chiama deve avvolgerla in try/catch e non far fallire il salvataggio
 * della risposta se l'invio fallisce.
 */
export async function sendAnswerNotification({ to, matchName, slug }: AnswerNotificationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datequiz-seven.vercel.app";
  const resultUrl = `${siteUrl}/r/${slug}`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Yeslink <onboarding@resend.dev>",
    to,
    subject: `${matchName} ha risposto! 🎉`,
    html: `
      <p>Ciao,</p>
      <p><strong>${matchName}</strong> ha risposto al tuo invito su Yeslink.</p>
      <p><a href="${resultUrl}">Guarda cosa ha scelto →</a></p>
    `,
  });
}
