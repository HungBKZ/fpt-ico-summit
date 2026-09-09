"use client";

import { useState, useEffect, useCallback } from "react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  standardPackages,
  consularPackages,
  boothSupportNote,
  type PackageItem,
} from "@/data/packages";

interface PackagesSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export function PackagesSection({ locale, dict }: PackagesSectionProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "consular">("standard");
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  const currentPackages = activeTab === "standard" ? standardPackages : consularPackages;

  // Keyboard navigation for modal (Escape key)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPackage) {
        setSelectedPackage(null);
      }
    },
    [selectedPackage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPackage]);

  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="packages-section"
      style={{
        padding: "var(--space-24) 0",
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        position: "relative",
      }}
    >
      <div className="site-container">
        {/* Section Header - Left-aligned, Institutional Prospectus Style */}
        <div style={{ maxWidth: "760px", marginBottom: "var(--space-10)" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            {dict.packages.eyebrow}
          </p>
          <h2
            id="packages-heading"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--color-navy)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-3)",
            }}
          >
            {dict.packages.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: "var(--space-2)",
            }}
          >
            {dict.packages.subtitle}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {dict.packages.supportingNote || dict.packages.ctaNote}
          </p>
        </div>

        {/* Category Switcher: Refined Segmented Control */}
        <div
          style={{
            marginBottom: "var(--space-8)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            role="tablist"
            aria-label={dict.packages.eyebrow}
            style={{
              display: "inline-flex",
              backgroundColor: "var(--color-surface-subtle)",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              gap: "4px",
            }}
          >
            <button
              role="tab"
              id="tab-standard"
              aria-selected={activeTab === "standard"}
              aria-controls="panel-packages"
              onClick={() => setActiveTab("standard")}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: activeTab === "standard" ? 600 : 500,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: activeTab === "standard" ? "var(--color-navy)" : "transparent",
                color: activeTab === "standard" ? "#FFFFFF" : "var(--color-text-secondary)",
                boxShadow: activeTab === "standard" ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
              }}
            >
              {dict.packages.tabs.partner}
            </button>
            <button
              role="tab"
              id="tab-consular"
              aria-selected={activeTab === "consular"}
              aria-controls="panel-packages"
              onClick={() => setActiveTab("consular")}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: activeTab === "consular" ? 600 : 500,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: activeTab === "consular" ? "var(--color-navy)" : "transparent",
                color: activeTab === "consular" ? "#FFFFFF" : "var(--color-text-secondary)",
                boxShadow: activeTab === "consular" ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
              }}
            >
              {dict.packages.tabs.consular}
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div
          id="panel-packages"
          role="tabpanel"
          aria-labelledby={activeTab === "standard" ? "tab-standard" : "tab-consular"}
          className={`packages-grid ${activeTab === "standard" ? "grid-4" : "grid-2"}`}
        >
          {currentPackages.map((pkg) => {
            return (
              <div
                key={pkg.id}
                className="package-card"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "18px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Package-specific top accent bar */}
                <div
                  style={{
                    height: "4px",
                    width: "100%",
                    backgroundColor: pkg.accentColor,
                  }}
                />

                <div
                  style={{
                    padding: "1.75rem 1.5rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  {/* Card Header: Package Name & Access Duration */}
                  <div style={{ marginBottom: "0.875rem" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.375rem",
                        fontWeight: 700,
                        color: "var(--color-navy)",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                        margin: 0,
                        marginBottom: "0.375rem",
                        lineHeight: 1.25,
                      }}
                    >
                      {pkg.name}
                    </h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <span>{pkg.accessDuration[locale]}</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                      margin: 0,
                      marginBottom: "1.25rem",
                      flexGrow: 0,
                    }}
                  >
                    {pkg.tagline[locale]}
                  </p>

                  {/* Key Benefits Highlight Area */}
                  <div
                    style={{
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--color-border)",
                      marginTop: "auto",
                      flexGrow: 1,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-text-muted)",
                        margin: 0,
                        marginBottom: "0.875rem",
                      }}
                    >
                      {dict.packages.keyBenefitsLabel || (locale === "vi" ? "Đặc quyền Tiêu biểu" : "Key Benefits")}
                    </p>

                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.625rem",
                      }}
                    >
                      {pkg.keyHighlights.map((hl, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            fontSize: "0.8125rem",
                            color: "var(--color-text-primary)",
                            lineHeight: 1.45,
                          }}
                        >
                          <svg
                            aria-hidden="true"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={pkg.accentColor}
                            strokeWidth="2.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              flexShrink: 0,
                              marginTop: "3px",
                            }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{hl[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: View Full Benefits Action */}
                <div
                  style={{
                    padding: "1rem 1.5rem 1.5rem",
                    borderTop: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      backgroundColor: "var(--color-surface-subtle)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-navy)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.375rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-surface)";
                      e.currentTarget.style.borderColor = "var(--color-navy)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-surface-subtle)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <span>{dict.packages.viewFullBenefits}</span>
                    <svg
                      aria-hidden="true"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtle Booth Support Note beneath cards - ONLY for Consular packages */}
        {activeTab === "consular" && (
          <div
            style={{
              marginTop: "var(--space-6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "8px 18px",
                backgroundColor: "rgba(0, 102, 204, 0.04)",
                border: "1px solid rgba(0, 102, 204, 0.15)",
                borderRadius: "10px",
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
                maxWidth: "640px",
              }}
            >
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066CC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{boothSupportNote[locale]}</span>
            </div>
          </div>
        )}

        {/* Centralized Institutional Contact CTA */}
        <div
          style={{
            marginTop: "var(--space-10)",
            padding: "2.25rem 2rem",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "760px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-navy)",
              marginBottom: "0.5rem",
            }}
          >
            {dict.packages.centralCta?.title ||
              (locale === "vi"
                ? "Cần tư vấn hình thức tham gia phù hợp?"
                : "Need help choosing the right participation option?")}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              maxWidth: "620px",
              margin: "0 auto 1.5rem",
            }}
          >
            {dict.packages.centralCta?.description ||
              (locale === "vi"
                ? "Phòng Hợp tác Quốc tế sẵn sàng hỗ trợ đơn vị lựa chọn phương án tham gia phù hợp với nhu cầu hợp tác và kết nối."
                : "Our International Cooperation Office can help identify the most suitable participation arrangement for your institution.")}
          </p>
          <a
            href="#registration"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            {dict.packages.centralCta?.button || dict.packages.cta}
          </a>
        </div>
      </div>

      {/* Full Benefits Modal / Prospectus Drawer */}
      {selectedPackage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-pkg-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10, 20, 40, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPackage(null);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              padding: "2rem",
              position: "relative",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "1rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: selectedPackage.accentColor,
                  }}
                >
                  {selectedPackage.accessDuration[locale]}
                </span>
                <h3
                  id="modal-pkg-title"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-navy)",
                    marginTop: "0.25rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {selectedPackage.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  {selectedPackage.duration[locale]} · {selectedPackage.hotel[locale]}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                aria-label={dict.packages.closeDetails}
                style={{
                  background: "none",
                  border: "none",
                  padding: "6px",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Booth support alert in modal - ONLY for consular packages */}
            {selectedPackage.tierType === "consular" && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(0, 102, 204, 0.04)",
                  border: "1px solid rgba(0, 102, 204, 0.15)",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  color: "var(--color-navy)",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0066CC"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{boothSupportNote[locale]}</span>
              </div>
            )}

            {/* Detailed Table */}
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--color-navy)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {dict.packages.allBenefitsTitle}
            </h4>

            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--color-surface-subtle)" }}>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {locale === "vi" ? "Hạng mục Quyền lợi" : "Benefit Item"}
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {locale === "vi" ? "Chi tiết áp dụng" : "Entitlement"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPackage.allBenefits.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "var(--color-surface-subtle)",
                        borderBottom:
                          idx === selectedPackage.allBenefits.length - 1
                            ? "none"
                            : "1px solid var(--color-border)",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {item.category[locale]}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: item.isIncluded
                            ? "var(--color-navy)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {item.value[locale]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "var(--color-surface-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-navy)",
                  cursor: "pointer",
                }}
              >
                {dict.packages.closeDetails}
              </button>

              <a
                href="#registration"
                onClick={() => setSelectedPackage(null)}
                className="btn btn-primary"
                style={{
                  fontSize: "0.8125rem",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                {dict.packages.cta}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS for responsive grid */}
      <style jsx>{`
        .packages-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .packages-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (min-width: 1200px) {
          .packages-grid.grid-4 {
            grid-template-columns: repeat(4, 1fr);
          }
          .packages-grid.grid-2 {
            grid-template-columns: repeat(2, 1fr);
            max-width: 820px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        .package-card:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
    </section>
  );
}
