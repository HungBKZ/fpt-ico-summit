/**
 * PartnersSection — Global Community / Participating Partners.
 *
 * Rules (AGENTS.md §4, §9):
 *  - Only renders entries where status === "confirmed" via getConfirmedPartners().
 *  - If zero confirmed partners exist, renders a clean neutral announcement state.
 *  - Never fabricates, downloads, or searches for logos.
 *  - If a confirmed partner has logo: null, renders a text-name tile instead.
 *  - Groups by type only when more than one type is present.
 *
 * Content source: docs/CONTENT.md §10, src/data/partners.ts.
 * Server Component.
 */

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getConfirmedPartners,
  getConfirmedPartnersByType,
  type Partner,
  type PartnerType,
} from "@/data/partners";

/* ── Type label map ──────────────────────────────────────────────────────── */

const typeLabels: Record<PartnerType, string> = {
  university:   "Universities & Education Partners",
  consulate:    "Consulates & Institutional Partners",
  organization: "Organizations",
  sponsor:      "Sponsors",
};

/* ── Individual partner tile ─────────────────────────────────────────────── */

function PartnerTile({ partner }: { partner: Partner }) {
  const tile = (
    <div className="partner-tile">
      {partner.logo ? (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={120}
          height={60}
          style={{ objectFit: "contain", maxHeight: "3rem", width: "auto" }}
        />
      ) : (
        <span className="partner-tile-name">{partner.name}</span>
      )}
    </div>
  );

  if (partner.website) {
    return (
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${partner.name} (opens in a new tab)`}
      >
        {tile}
      </a>
    );
  }

  return <div aria-label={partner.name}>{tile}</div>;
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="partners-empty" role="status" aria-live="polite">
      <div className="partners-empty-icon" aria-hidden="true">
        <svg
          width="22"
          height="22"
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
      <p className="partners-empty-heading">A growing global community.</p>
      <p className="partners-empty-body">
        Participating institutions and organizations will be announced as their
        involvement is confirmed.
      </p>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function PartnersSection() {
  const confirmed = getConfirmedPartners();
  const byType = getConfirmedPartnersByType();
  const hasMultipleTypes =
    Object.values(byType).filter((group) => group.length > 0).length > 1;

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      style={{ backgroundColor: "var(--color-off-white)" }}
    >
      <div className="site-container section-padding">
        <div style={{ marginBottom: "2.5rem" }}>
          <SectionHeading
            id="partners-heading"
            eyebrow="Global Community"
            heading="Participating Partners"
            body={
              confirmed.length > 0
                ? "Universities, education organizations and consulates joining FPT ICO Summit 2026."
                : undefined
            }
            level="h2"
            align="center"
            accent={true}
          />
        </div>

        {confirmed.length === 0 ? (
          <EmptyState />
        ) : hasMultipleTypes ? (
          /* Grouped by type */
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {(Object.entries(byType) as [PartnerType, Partner[]][])
              .filter(([, group]) => group.length > 0)
              .map(([type, group]) => (
                <div key={type}>
                  <p className="partners-group-label">{typeLabels[type]}</p>
                  <div className="partners-logo-grid">
                    {group.map((p) => (
                      <PartnerTile key={p.name} partner={p} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Flat grid — only one type present */
          <div className="partners-logo-grid">
            {confirmed.map((p) => (
              <PartnerTile key={p.name} partner={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
