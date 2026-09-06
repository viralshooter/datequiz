const FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/**
 * Next `count` days starting tomorrow, as readable labels (e.g. "Fri,
 * Sep 5"). This exact string is what gets stored in links.available_days
 * and answers.selected_days: no calendar app involved, so no separate
 * ISO value is needed.
 */
export function getUpcomingDayOptions(count = 14, from: Date = new Date()): string[] {
  const options: string[] = [];
  for (let i = 1; i <= count; i++) {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    options.push(FORMATTER.format(date));
  }
  return options;
}
