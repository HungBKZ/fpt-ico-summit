export type InstitutionStatus = "confirmed" | "pending" | "invited" | "hidden";

export type UniversityCountry =
  | "Thailand"
  | "China"
  | "Korea"
  | "Australia"
  | "Japan"
  | "USA";

export type UniversityEntry = {
  id: string;
  name: string;
  country: UniversityCountry;
  status: InstitutionStatus;
  website?: string;
};

export const universities: UniversityEntry[] = [];

export function getConfirmedUniversities(): UniversityEntry[] {
  return universities.filter((entry) => entry.status === "confirmed");
}

export const universityCountries: UniversityCountry[] = [
  "Thailand",
  "China",
  "Korea",
  "Australia",
  "Japan",
  "USA",
];
