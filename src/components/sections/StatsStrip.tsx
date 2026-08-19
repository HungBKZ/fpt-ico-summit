import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface StatsStripProps {
  locale: Locale;
  dict: Dictionary;
}

export function StatsStrip({ dict }: StatsStripProps) {
  const statsList = [
    {
      number: 4000,
      suffix: "+",
      label: dict.stats.stat1.label,
      ariaLabel: dict.stats.stat1.desc,
    },
    {
      number: 42,
      suffix: "",
      label: dict.stats.stat2.label,
      ariaLabel: dict.stats.stat2.desc,
    },
    {
      number: 1,
      suffix: "",
      staticValue: "Global",
      label: dict.stats.stat3.label,
      ariaLabel: dict.stats.stat3.desc,
    },
    {
      number: 3,
      suffix: " Days",
      label: dict.stats.stat4.label,
      ariaLabel: dict.stats.stat4.desc,
    },
  ];

  return (
    <div className="stats-strip" role="region" aria-label="Event at a glance">
      <div className="site-container">
        <dl className="stats-grid">
          {statsList.map((stat, index) => (
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
                    {"staticValue" in stat && stat.staticValue ? (
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
