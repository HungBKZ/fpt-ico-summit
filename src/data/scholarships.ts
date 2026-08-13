export type ScholarshipStatus = "confirmed" | "pending" | "invited" | "hidden";
export type ScholarshipProviderType = "Consulate" | "University";

export type Scholarship = {
  id: string;
  title: string;
  provider: string;
  providerType: ScholarshipProviderType;
  country: string;
  eligibility: string;
  value: string;
  applicationUrl?: string;
  status: ScholarshipStatus;
};

export const scholarships: Scholarship[] = [];

export function getConfirmedScholarships(): Scholarship[] {
  return scholarships.filter((item) => item.status === "confirmed");
}

export function getConfirmedScholarshipsByType(providerType: ScholarshipProviderType): Scholarship[] {
  return getConfirmedScholarships().filter((item) => item.providerType === providerType);
}
