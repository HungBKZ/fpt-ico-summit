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
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.625rem",
        padding: "2rem 1.5rem",
        backgroundColor: "rgba(26, 94, 168, 0.12)",
        border: "1px solid rgba(58, 127, 212, 0.22)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
    >
      {/* Subtle corner motif — one diagonal stripe group, top-right */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "6rem",
          height: "6rem",
          pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(-55deg, rgba(58,127,212,0.18) 0px, rgba(58,127,212,0.18) 1.5px, transparent 1.5px, transparent 18px)",
          borderRadius: "0 var(--radius-lg) 0 0",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "rgba(58, 127, 212, 0.18)",
          color: "var(--color-blue-light)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-base)",
          fontWeight: 700,
          color: "#ffffff",
          position: "relative",
          zIndex: 1,
        }}
      >
        {tab} to be announced.
      </p>
      <p
        style={{
          maxWidth: "38ch",
          fontSize: "var(--text-sm)",
          color: "rgba(255,255,255,0.60)",
          lineHeight: "var(--leading-normal)",
          position: "relative",
          zIndex: 1,
        }}
      >
        Confirmed institutions will appear here as participation is verified.
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
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "var(--radius-md)",
        textAlign: "center",
        transition: "background-color 150ms ease, border-color 150ms ease",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "rgba(255,255,255,0.88)",
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
                  backgroundColor: isActive ? "var(--color-blue)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "#fff" : "#edf4ff",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  padding: "0.625rem 1.5rem",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  transition: "background-color 150ms ease, color 150ms ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Consulates" ? (
          <div id="consulates-panel" role="tabpanel" aria-labelledby="consulates-tab" className="tab-panel-animated" key="consulates">
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
          <div id="universities-panel" role="tabpanel" aria-labelledby="universities-tab" className="tab-panel-animated" key="universities">
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
                      backgroundColor: selectedCountry === "All" ? "var(--color-blue)" : "rgba(255,255,255,0.06)",
                      color: selectedCountry === "All" ? "#fff" : "#edf4ff",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.4rem 0.875rem",
                      fontWeight: 600,
                      fontSize: "var(--text-sm)",
                      cursor: "pointer",
                      transition: "background-color 150ms ease, color 150ms ease",
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
                        backgroundColor: selectedCountry === country ? "var(--color-blue)" : "rgba(255,255,255,0.06)",
                        color: selectedCountry === country ? "#fff" : "#edf4ff",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.4rem 0.875rem",
                        fontWeight: 600,
                        fontSize: "var(--text-sm)",
                        cursor: "pointer",
                        transition: "background-color 150ms ease, color 150ms ease",
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
                      padding: "1.25rem",
                      textAlign: "center",
                      backgroundColor: "rgba(26, 94, 168, 0.12)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(58, 127, 212, 0.20)",
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    No confirmed universities for {selectedCountry} yet.
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
