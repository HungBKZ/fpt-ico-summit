/**
 * StatsStrip — Compact statistics bar below the hero.
 *
 * Rules (docs/CONTENT.md §3, docs/PROJECT.md §3):
 *  - Use cautious labels: "Expected", "Planned" — not guaranteed attendance.
 *  - No photos in this section (docs/ASSETS.md §5).
 *  - Figures come from approved copy; do not change wording without user approval.
 *  - Server Component — no interactivity.
 */

import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const stats = [
  {
    number: 4000,
    suffix: "+",
    label: "Expected student participants",
    ariaLabel: "4,000 or more expected student participants",
  },
  {
    number: 42,
    suffix: "",
    label: "Planned booths & experience areas",
    ariaLabel: "42 planned booths and experience areas",
  },
  {
    number: 1,
    suffix: "",
    label: "Global Community of universities, organizations & consulates",
    ariaLabel: "Global community of universities, organizations and consulates",
    staticValue: "Global",
  },
  {
    number: 3,
    suffix: " Days",
    label: "Education · Culture · Connections",
    ariaLabel: "3-day event covering education, culture and connections",
  },
] as const;

export function StatsStrip() {
  return (
    <div className="stats-strip" role="region" aria-label="Event at a glance">
      <div className="site-container">
        <dl className="stats-grid">
          {stats.map((stat, index) => (
            <RevealOnScroll key={`${stat.label}-${index}`} delay={index * 80} className="stat-item-wrapper">
              <div className="stat-item">
                {index > 0 && (
                  <div
                    className={`stats-divider stat-divider-${index}`}
                    aria-hidden="true"
                  />
                )}
                <div className="stat-inner">
                  <dt className="stat-number" aria-label={stat.ariaLabel}>
                    {"staticValue" in stat ? (
                      <span>{stat.staticValue}</span>
                    ) : (
                      <CountUpNumber
                        value={stat.number}
                        duration={1000}
                        suffix={stat.suffix}
                        className="stat-number-inner"
                        ariaLabel={stat.ariaLabel}
                      />
                    )}
                  </dt>
                  <dd className="stat-label">{stat.label}</dd>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </dl>
      </div>
    </div>
  );
}
