import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  programDays,
  continuousActivities,
  partnerArrivalNotice,
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
  const subtitleStr = getLocalizedText(day.subtitle, locale);
  const dateStr = getLocalizedText(day.date, locale);
  const descStr = getLocalizedText(day.description, locale);

  const slotLabels: Record<TimeSlot, string> = {
    morning: dict.program.slots.morning,
    afternoon: dict.program.slots.afternoon,
    evening: dict.program.slots.evening,
  };

  return (
    <article className="program-day-card flex flex-col h-full" aria-label={`${dayLabelStr} — ${titleStr}`}>
      {/* Header */}
      <div className={`program-day-header program-day-header--${day.icon}`}>
        <div className={`program-day-badge program-day-badge--${day.icon}`}>
          {DayIcons[day.icon]}
          {dayLabelStr}
        </div>
        <p className="program-day-date">{dateStr}</p>
        <h3 className="program-day-title text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {titleStr}
        </h3>
        {subtitleStr && (
          <p className="text-xs font-semibold text-blue-700 mt-1 uppercase tracking-wider">
            {subtitleStr}
          </p>
        )}
        <p className="program-day-desc text-xs text-slate-600 mt-2 leading-relaxed">
          {descStr}
        </p>
      </div>

      {/* Slot activity lists */}
      {hasSlots && (
        <div className="program-day-slots flex-1 flex flex-col">
          {slotOrder.map((slot) => {
            const activities = day.slots[slot];
            if (!activities || activities.length === 0) return null;
            return (
              <div key={slot} className="mb-4 last:mb-0">
                <p className="program-slot-label">{slotLabels[slot]}</p>
                <ul className="program-slot-activities space-y-2">
                  {activities.map((activity, actIdx) => {
                    const actTitle = getLocalizedText(activity.title, locale);
                    return (
                      <li key={`${actTitle}-${actIdx}`} className="program-activity-item flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="program-activity-dot mt-1.5 shrink-0" aria-hidden="true" />
                        <div className="flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          {activity.time && (
                            <span className="font-semibold text-slate-900 text-xs px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200/80 shrink-0">
                              {activity.time}
                            </span>
                          )}
                          <span className="font-medium text-slate-800 leading-snug">
                            {actTitle}
                          </span>
                          {activity.isOptional && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
                              {locale === "vi" ? "Không bắt buộc" : "Optional"}
                            </span>
                          )}
                        </div>
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
  const arrivalTag = getLocalizedText(partnerArrivalNotice.tag, locale);
  const arrivalTitle = getLocalizedText(partnerArrivalNotice.title, locale);
  const arrivalDesc = getLocalizedText(partnerArrivalNotice.description, locale);

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

        {/* 19 Nov Partner Logistics Callout */}
        <RevealOnScroll delay={40}>
          <div className="mb-6 p-3.5 sm:p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
            <div className="flex items-start sm:items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {arrivalTag}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {arrivalTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {arrivalDesc}
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 shrink-0 font-medium sm:text-right pl-11 sm:pl-0">
              {locale === "vi" ? "Lưu ý hậu cần đối tác" : "Partner Logistics"}
            </div>
          </div>
        </RevealOnScroll>

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
