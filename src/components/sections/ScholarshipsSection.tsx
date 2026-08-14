"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getConfirmedScholarshipsByType } from "@/data/scholarships";

const tabs = ["Consulate Scholarships", "University Scholarships"] as const;

type ScholarshipTab = (typeof tabs)[number];

function EmptyState({ tab }: { tab: ScholarshipTab }) {
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
        backgroundColor: "rgba(26, 94, 168, 0.10)",
        border: "1px solid rgba(58, 127, 212, 0.20)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
    >
      {/* Subtle corner motif */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "6rem",
          height: "6rem",
          pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(-55deg, rgba(58,127,212,0.15) 0px, rgba(58,127,212,0.15) 1.5px, transparent 1.5px, transparent 18px)",
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
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
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
        {tab} coming soon.
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
        Confirmed scholarship information will be published here as it becomes available.
      </p>
    </div>
  );
}

function ScholarshipCard({
  title,
  provider,
  country,
  eligibility,
  value,
  applicationUrl,
}: {
  title: string;
  provider: string;
  country: string;
  eligibility: string;
  value: string;
  applicationUrl?: string;
}) {
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "#fff",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.25rem 0.625rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-blue-subtle)",
            color: "var(--color-blue)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {provider}
        </span>
        <span
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {country}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          color: "var(--color-navy)",
          lineHeight: "var(--leading-snug)",
        }}
      >
        {title}
      </h3>

      <dl
        style={{
          display: "grid",
          gap: "0.75rem",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          lineHeight: "var(--leading-normal)",
        }}
      >
        <div>
          <dt
            style={{
              color: "var(--color-text-muted)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "0.2rem",
            }}
          >
            Eligibility
          </dt>
          <dd style={{ margin: 0 }}>{eligibility}</dd>
        </div>
        <div>
          <dt
            style={{
              color: "var(--color-text-muted)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "0.2rem",
            }}
          >
            Value / Benefit
          </dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      </dl>

      {applicationUrl ? (
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-blue"
          style={{ alignSelf: "flex-start" }}
        >
          View details
        </a>
      ) : (
        <span
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
          }}
        >
          Application details to be announced
        </span>
      )}
    </article>
  );
}

export function ScholarshipsSection() {
  const [activeTab, setActiveTab] = useState<ScholarshipTab>("Consulate Scholarships");

  const tabsData = useMemo(
    () => ({
      "Consulate Scholarships": getConfirmedScholarshipsByType("Consulate"),
      "University Scholarships": getConfirmedScholarshipsByType("University"),
    }),
    []
  );

  const currentItems = tabsData[activeTab];

  return (
    <section
      id="scholarships"
      aria-labelledby="scholarships-heading"
      className="section--tinted"
    >
      <div className="site-container section-padding">
        <div style={{ marginBottom: "2rem" }}>
          <SectionHeading
            id="scholarships-heading"
            className="section-heading--tinted"
            eyebrow="Scholarships"
            heading="Funding pathways for international study and exchange."
            body="Explore confirmed scholarship opportunities shared through participating consulates and universities."
            level="h2"
            align="center"
            accent={true}
          />
        </div>

        <div
          role="tablist"
          aria-label="Scholarship categories"
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
                aria-controls={`${tab.toLowerCase().replace(/\s+/g, "-")}-panel`}
                id={`${tab.toLowerCase().replace(/\s+/g, "-")}-tab`}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: isActive ? "1px solid transparent" : "1px solid rgba(26, 94, 168, 0.20)",
                  backgroundColor: isActive ? "var(--color-blue)" : "rgba(26, 94, 168, 0.08)",
                  color: isActive ? "#fff" : "var(--color-navy)",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                  padding: "0.75rem 1.25rem",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div
          id={`${activeTab.toLowerCase().replace(/\s+/g, "-")}-panel`}
          role="tabpanel"
          aria-labelledby={`${activeTab.toLowerCase().replace(/\s+/g, "-")}-tab`}
          className="tab-panel-animated"
          key={activeTab}
        >
          {currentItems.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {currentItems.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  title={scholarship.title}
                  provider={scholarship.provider}
                  country={scholarship.country}
                  eligibility={scholarship.eligibility}
                  value={scholarship.value}
                  applicationUrl={scholarship.applicationUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
