"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getConfirmedConsulates } from "@/data/consulates";
import { getConfirmedUniversities, universityCountries } from "@/data/universities";

const tabs = ["Consulates", "Universities"] as const;
type PartnerTab = (typeof tabs)[number];

function EmptyState({ tab }: { tab: PartnerTab }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem 1.25rem",
        backgroundColor: "var(--color-off-white)",
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "3rem",
          height: "3rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-blue-subtle)",
          color: "var(--color-blue)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--color-navy)",
        }}
      >
        {tab} to be announced.
      </p>
      <p
        style={{
          maxWidth: "42ch",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          lineHeight: "var(--leading-normal)",
        }}
      >
        Confirmed institutions and universities will appear here as participation is verified.
      </p>
    </div>
  );
}

function PartnerTile({
  name,
  website,
}: {
  name: string;
  website?: string;
}) {
  const tile = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "5rem",
        padding: "1.25rem 1rem",
        backgroundColor: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--color-navy)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {name}
      </span>
    </div>
  );

  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} (opens in a new tab)`}
        style={{ display: "block" }}
      >
        {tile}
      </a>
    );
  }

  return tile;
}

export function PartnersSection() {
  const [activeTab, setActiveTab] = useState<PartnerTab>("Consulates");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const confirmedConsulates = useMemo(() => getConfirmedConsulates(), []);
  const confirmedUniversities = useMemo(() => getConfirmedUniversities(), []);

  const visibleUniversities =
    selectedCountry === "All"
      ? confirmedUniversities
      : confirmedUniversities.filter((item) => item.country === selectedCountry);

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="section--navy section--partners"
    >
      <div className="site-container section-padding">
        <div style={{ marginBottom: "2rem" }}>
          <SectionHeading
            id="partners-heading"
            className="section-heading--invert"
            eyebrow="Global community"
            heading="Participating consulates and universities."
            body="Only confirmed institutions are shown publicly."
            level="h2"
            align="center"
            accent={true}
          />
        </div>

        <div
          role="tablist"
          aria-label="Partner categories"
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.toLowerCase()}-panel`}
                id={`${tab.toLowerCase()}-tab`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Universities") setSelectedCountry("All");
                }}
                style={{
                  border: isActive ? "1px solid transparent" : "1px solid rgba(255,255,255,0.18)",
                  backgroundColor: isActive ? "var(--color-orange)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "#fff" : "#edf4ff",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                  padding: "0.75rem 1.25rem",
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Consulates" ? (
          <div id="consulates-panel" role="tabpanel" aria-labelledby="consulates-tab">
            {confirmedConsulates.length === 0 ? (
              <EmptyState tab="Consulates" />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {confirmedConsulates.map((partner) => (
                  <PartnerTile key={partner.id} name={partner.name} website={partner.website} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div id="universities-panel" role="tabpanel" aria-labelledby="universities-tab">
            {confirmedUniversities.length === 0 ? (
              <EmptyState tab="Universities" />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    justifyContent: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCountry("All")}
                    style={{
                      border: selectedCountry === "All" ? "1px solid transparent" : "1px solid rgba(255,255,255,0.18)",
                      backgroundColor: selectedCountry === "All" ? "var(--color-orange)" : "rgba(255,255,255,0.06)",
                      color: selectedCountry === "All" ? "#fff" : "#edf4ff",
                      borderRadius: "var(--radius-full)",
                      padding: "0.5rem 0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    All countries
                  </button>

                  {universityCountries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      style={{
                        border:
                          selectedCountry === country ? "1px solid transparent" : "1px solid rgba(255,255,255,0.18)",
                        backgroundColor: selectedCountry === country ? "var(--color-orange)" : "rgba(255,255,255,0.06)",
                        color: selectedCountry === country ? "#fff" : "#edf4ff",
                        borderRadius: "var(--radius-full)",
                        padding: "0.5rem 0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {country}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {visibleUniversities.map((partner) => (
                    <div key={partner.id}>
                      <p
                        style={{
                          marginBottom: "0.5rem",
                          fontSize: "var(--text-xs)",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        {partner.country}
                      </p>
                      <PartnerTile name={partner.name} website={partner.website} />
                    </div>
                  ))}
                </div>

                {selectedCountry !== "All" && visibleUniversities.length === 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1.5rem",
                      textAlign: "center",
                      backgroundColor: "#fff",
                      borderRadius: "var(--radius-md)",
                      border: "1px dashed var(--color-border-strong)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No confirmed universities are available for {selectedCountry} yet.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
