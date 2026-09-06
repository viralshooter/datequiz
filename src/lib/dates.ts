const FORMATTER = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatLabel(date: Date): string {
  const raw = FORMATTER.format(date); // es. "ven 5 set"
  return raw
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Prossimi `count` giorni a partire da domani, come label leggibili
 * (es. "Ven 5 Set"). La stessa stringa è ciò che viene salvato in
 * links.available_days e answers.selected_days: nessuna app di
 * calendario coinvolta, quindi non serve un valore ISO separato.
 */
export function getUpcomingDayOptions(count = 14, from: Date = new Date()): string[] {
  const options: string[] = [];
  for (let i = 1; i <= count; i++) {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    options.push(formatLabel(date));
  }
  return options;
}
