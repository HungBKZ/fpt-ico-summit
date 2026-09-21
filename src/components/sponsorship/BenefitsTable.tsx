import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  benefitGroups,
  sponsorTierOrder,
  type BenefitValue,
} from "@/data/sponsorship";
import { CheckIcon, MinusIcon } from "./icons";
import { tierTheme } from "./tier-theme";

interface BenefitsTableProps {
  locale: Locale;
  dict: Dictionary;
}

function BenefitCell({
  value,
  locale,
  dict,
  accent,
}: {
  value: BenefitValue;
  locale: Locale;
  dict: Dictionary;
  accent: string;
}) {
  if (value.kind === "included") {
    return (
      <span className="inline-flex justify-center">
        <CheckIcon size={18} color={accent} />
        <span className="sr-only">{dict.sponsorship.included}</span>
      </span>
    );
  }
  if (value.kind === "excluded") {
    return (
      <span className="inline-flex justify-center" style={{ color: "var(--color-text-muted)" }}>
        <MinusIcon size={18} />
        <span className="sr-only">{dict.sponsorship.notIncluded}</span>
      </span>
    );
  }
  return <span>{value.text[locale]}</span>;
}

/** Accordion of 5 benefit groups; each opens to a comparison table that scrolls horizontally on small screens. */
export function BenefitsTable({ locale, dict }: BenefitsTableProps) {
  const t = dict.sponsorship;

  return (
    <div>
      <h3
        className="m-0 text-lg font-bold sm:text-xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
      >
        {t.compareTitle}
      </h3>
      <p className="mb-4 mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {t.compareSubtitle}
      </p>

      <div className="flex flex-col gap-3">
        {benefitGroups.map((group, index) => (
          <details
            key={group.id}
            open={index === 0}
            className="group overflow-hidden rounded-xl bg-white"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden"
              style={{ color: "var(--color-navy)", fontFamily: "var(--font-display)" }}
            >
              <span>
                <span style={{ color: "var(--color-blue)" }}>{index + 1}.</span>{" "}
                {group.title[locale]}
              </span>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 transition-transform group-open:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>

            <div className="overflow-x-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
              <table className="w-full min-w-[600px] border-collapse text-left text-[0.8125rem]">
                <caption className="sr-only">{group.title[locale]}</caption>
                <thead>
                  <tr style={{ backgroundColor: "var(--color-bg-alt)" }}>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 w-[32%] px-3 py-2 text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: "var(--color-bg-alt)", color: "var(--color-text-secondary)" }}
                    >
                      {t.benefitColumn}
                    </th>
                    {sponsorTierOrder.map((tierId) => (
                      <th
                        key={tierId}
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider"
                        style={{ color: tierTheme[tierId].text }}
                      >
                        {t.tierNames[tierId]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white px-3 py-2 font-medium"
                        style={{ color: "var(--color-navy)" }}
                      >
                        {row.label[locale]}
                      </th>
                      {sponsorTierOrder.map((tierId) => (
                        <td
                          key={tierId}
                          className="px-3 py-2 text-center"
                          style={{
                            color: "var(--color-text-primary)",
                            backgroundColor: tierId === "diamond" ? tierTheme.diamond.tint : undefined,
                          }}
                        >
                          <BenefitCell
                            value={row.values[tierId]}
                            locale={locale}
                            dict={dict}
                            accent={tierTheme[tierId].accent}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>

      <p className="mt-4 text-sm italic" style={{ color: "var(--color-text-muted)" }}>
        {t.disclaimer}
      </p>
    </div>
  );
}
