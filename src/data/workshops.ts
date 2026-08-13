export type WorkshopStatus = "confirmed" | "pending" | "invited" | "hidden";

export type Workshop = {
  id: string;
  title: string;
  description: string;
  status: WorkshopStatus;
};

export const workshops: Workshop[] = [
  {
    id: "cross-cultural-communication-ai-era",
    title: "Cross-Cultural Communication in the AI Era",
    description:
      "The workshop explores how students can communicate across cultures, adapt to international environments, and use AI thoughtfully in multicultural study and work.",
    status: "confirmed",
  },
];

export function getConfirmedWorkshops(): Workshop[] {
  return workshops.filter((workshop) => workshop.status === "confirmed");
}
