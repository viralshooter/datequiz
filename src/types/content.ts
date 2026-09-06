export type ActivityId = "cena" | "drink" | "sport" | "esperienza" | "cultura" | "outdoor";

export interface DateActivity {
  id: ActivityId;
  label: string;
  emoji: string;
  description: string;
}
