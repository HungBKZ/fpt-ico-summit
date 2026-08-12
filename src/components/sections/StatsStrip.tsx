/**
 * StatsStrip — Compact statistics bar below the hero.
 *
 * Rules (docs/CONTENT.md §3, docs/PROJECT.md §3):
 *  - Use cautious labels: "Expected", "Planned" — not guaranteed attendance.
 *  - No photos in this section (docs/ASSETS.md §5).
 *  - Figures come from approved copy; do not change wording without user approval.
 *  - Server Component — no interactivity.
 */

const stats = [
  {
    number: "4,000+",
    label: "Expected student participants",
    ariaLabel: "4,000 or more expected student participants",
  },
  {
    number: "42",
    label: "Planned booths & experience areas",
    ariaLabel: "42 planned booths and experience areas",
  },
  {
    number: "Global",
    label: "Community of universities, organisations & consulates",
    ariaLabel: "Global community of universities, organisations and consulates",
  },
  {
    number: "3 Days",
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
            <div key={stat.number} className="stat-item">
              {/* Vertical divider — hidden via CSS on first of each row */}
              {index > 0 && (
                <div
                  className={`stats-divider stat-divider-${index}`}
                  aria-hidden="true"
                />
              )}
              <div className="stat-inner">
                <dt className="stat-number" aria-label={stat.ariaLabel}>
                  {stat.number}
                </dt>
                <dd className="stat-label">{stat.label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
