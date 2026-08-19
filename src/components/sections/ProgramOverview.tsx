import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  programDays,
  continuousActivities,
  type ProgramDay,
  type TimeSlot,
} from "@/data/program";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getLocalizedText } from "@/i18n/types";

interface ProgramOverviewProps {
  locale: Locale;
  dict: Dictionary;
}

const DayIcons: Record<ProgramDay["icon"], React.ReactNode> = {
  compass: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  flag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const ContinuousIcons: Record<string, React.ReactNode> = {
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  award: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

const slotOrder: TimeSlot[] = ["morning", "afternoon", "evening"];

function DayCard({ day, locale, dict }: { day: ProgramDay; locale: Locale; dict: Dictionary }) {
  const hasSlots = Object.keys(day.slots).length > 0;
  const dayLabelStr = getLocalizedText(day.dayLabel, locale);
  const titleStr = getLocalizedText(day.title, locale);
  const dateStr = getLocalizedText(day.date, locale);
  const descStr = getLocalizedText(day.description, locale);

  const slotLabels: Record<TimeSlot, string> = {
    morning: dict.program.slots.morning,
    afternoon: dict.program.slots.afternoon,
    evening: dict.program.slots.evening,
  };

  return (
    <article className="program-day-card" aria-label={`${dayLabelStr}: ${titleStr}`}>
      {/* Header */}
      <div className={`program-day-header program-day-header--${day.icon}`}>
        <div className={`program-day-badge program-day-badge--${day.icon}`}>
          {DayIcons[day.icon]}
          {dayLabelStr}
        </div>
        <p className="program-day-date">{dateStr}</p>
        <h3 className="program-day-title">{titleStr}</h3>
        <p className="program-day-desc">{descStr}</p>
      </div>

      {/* Slot activity lists */}
      {hasSlots && (
        <div className="program-day-slots">
          {slotOrder.map((slot) => {
            const activities = day.slots[slot];
            if (!activities || activities.length === 0) return null;
            return (
              <div key={slot}>
                <p className="program-slot-label">{slotLabels[slot]}</p>
                <ul className="program-slot-activities">
                  {activities.map((activity, actIdx) => {
                    const actTitle = getLocalizedText(activity.title, locale);
                    return (
                      <li key={`${actTitle}-${actIdx}`} className="program-activity-item">
                        <span className="program-activity-dot" aria-hidden="true" />
                        {actTitle}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function ProgramOverview({ locale, dict }: ProgramOverviewProps) {
  return (
    <section
      id="program"
      aria-labelledby="program-heading"
      className="section--tinted"
    >
      <div className="site-container section-padding">
        {/* Heading */}
        <div style={{ marginBottom: "2.5rem" }}>
          <RevealOnScroll>
            <SectionHeading
              id="program-heading"
              eyebrow={dict.program.eyebrow}
              heading={dict.program.title}
              body={dict.program.subtitle}
              level="h2"
              align="left"
              accent={true}
            />
          </RevealOnScroll>
        </div>

        {/* Day cards */}
        <div className="program-days-grid">
          {programDays.map((day, index) => (
            <RevealOnScroll key={index} delay={index * 90}>
              <DayCard day={day} locale={locale} dict={dict} />
            </RevealOnScroll>
          ))}
        </div>

        {/* Continuous activities strip */}
        <div style={{ marginTop: "3rem" }}>
          <p
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              color: "var(--color-blue)",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "1.5rem",
                height: "2px",
                backgroundColor: "var(--color-blue)",
                borderRadius: "999px",
              }}
              aria-hidden="true"
            />
            {dict.program.continuousTitle}
          </p>
          <div className="program-continuous">
            {continuousActivities.map((activity, idx) => {
              const actTitle = getLocalizedText(activity.title, locale);
              const actDesc = getLocalizedText(activity.description, locale);
              return (
                <div key={`${actTitle}-${idx}`} className="program-continuous-card">
                  <div className="program-continuous-icon">
                    {ContinuousIcons[activity.icon]}
                  </div>
                  <p className="program-continuous-title">{actTitle}</p>
                  <p className="program-continuous-desc">{actDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
