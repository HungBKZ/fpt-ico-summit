export type ExpoItemStatus = "confirmed" | "pending" | "invited" | "hidden";

export type ExpoItem = {
  id: string;
  title: string;
  description: string;
  status: ExpoItemStatus;
};

export const expoItems: ExpoItem[] = [
  {
    id: "international-partner-zone",
    title: "International Partner Zone",
    description:
      "A dedicated showcase space for higher education institutions and global partners to connect directly with students.",
    status: "confirmed",
  },
  {
    id: "consulate-zone",
    title: "Consulate Zone",
    description:
      "A dedicated space highlighting international engagement, cultural connections, and public diplomacy in the summit experience.",
    status: "confirmed",
  },
  {
    id: "cultural-zone",
    title: "Cultural Zone",
    description:
      "Interactive cultural discovery through traditions, performances, participation, and cross-cultural exchange.",
    status: "confirmed",
  },
  {
    id: "food-and-souvenirs",
    title: "Food & Souvenirs",
    description:
      "A welcoming area centered on local flavours, regional identity, and memorable keepsakes from the Mekong experience.",
    status: "confirmed",
  },
  {
    id: "fpt-showcase-main-stage",
    title: "FPT Showcase / Main Stage",
    description:
      "A presentation and performance space for the host institution, student stories, cultural showcases, and public-facing highlights.",
    status: "confirmed",
  },
];

export function getConfirmedExpoItems(): ExpoItem[] {
  return expoItems.filter((item) => item.status === "confirmed");
}
