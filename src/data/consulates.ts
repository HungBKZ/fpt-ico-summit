export type InstitutionStatus = "confirmed" | "pending" | "invited" | "hidden";

export type ConsulateEntry = {
  id: string;
  name: string;
  country: string;
  status: InstitutionStatus;
  website?: string;
};

export const consulates: ConsulateEntry[] = [];

export function getConfirmedConsulates(): ConsulateEntry[] {
  return consulates.filter((entry) => entry.status === "confirmed");
}
