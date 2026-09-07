"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { ShowcaseRelationshipStatus } from "@/lib/db/models/partner-showcase";
import {
  createShowcaseEntryAction,
  updateShowcaseEntryAction,
  toggleShowcaseVisibilityAction,
  deleteShowcaseEntryAction,
  attachShowcaseLogoAction,
} from "@/app/actions/showcase-actions";
import { getAdminShowcaseUploadSignatureAction } from "@/app/actions/upload-actions";

export interface SerializedShowcaseEntry {
  id: string;
  displayName: string;
  country: string;
  websiteUrl: string;
  logo: {
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
  } | null;
  relationshipStatus: ShowcaseRelationshipStatus;
  isVisible: boolean;
  displayOrder: number;
  organizationId: string | null;
  displayConsentConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationOption {
  id: string;
  name: string;
  country: string;
  type: string;
}

interface ShowcaseManagementClientProps {
  locale: Locale;
  dict: Dictionary;
  initialEntries: SerializedShowcaseEntry[];
  metrics: {
    total: number;
    visible: number;
    invited: number;
    confirmed: number;
    network: number;
  };
  organizationOptions: OrganizationOption[];
}

export function ShowcaseManagementClient({
  dict,
  initialEntries,
  metrics,
  organizationOptions,
}: ShowcaseManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = dict.adminShowcase;

  // Filters
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("ALL");
  const [selectedVisibilityTab, setSelectedVisibilityTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SerializedShowcaseEntry | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Form State in Modal
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formRelationshipStatus, setFormRelationshipStatus] = useState<ShowcaseRelationshipStatus>("INVITED");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formOrganizationId, setFormOrganizationId] = useState("");
  const [formConsent, setFormConsent] = useState(false);
  const [formIsVisible, setFormIsVisible] = useState(false);

  // Logo upload state inside Modal
  const [createdEntryId, setCreatedEntryId] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<SerializedShowcaseEntry["logo"]>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active entries list
  const [entries, setEntries] = useState<SerializedShowcaseEntry[]>(initialEntries);

  // Filter computation
  const filteredEntries = entries.filter((entry) => {
    if (selectedStatusTab !== "ALL" && entry.relationshipStatus !== selectedStatusTab) {
      return false;
    }
    if (selectedVisibilityTab === "VISIBLE" && !entry.isVisible) {
      return false;
    }
    if (selectedVisibilityTab === "HIDDEN" && entry.isVisible) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entry.displayName.toLowerCase().includes(q);
      const matchCountry = entry.country.toLowerCase().includes(q);
      if (!matchName && !matchCountry) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingEntry(null);
    setCreatedEntryId(null);
    setFormDisplayName("");
    setFormCountry("");
    setFormWebsiteUrl("");
    setFormRelationshipStatus("INVITED");
    setFormDisplayOrder(entries.length * 10);
    setFormOrganizationId("");
    setFormConsent(false);
    setFormIsVisible(false);
    setCurrentLogo(null);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: SerializedShowcaseEntry) => {
    setEditingEntry(entry);
    setCreatedEntryId(entry.id);
    setFormDisplayName(entry.displayName);
    setFormCountry(entry.country);
    setFormWebsiteUrl(entry.websiteUrl);
    setFormRelationshipStatus(entry.relationshipStatus);
    setFormDisplayOrder(entry.displayOrder);
    setFormOrganizationId(entry.organizationId || "");
    setFormConsent(entry.displayConsentConfirmed);
    setFormIsVisible(entry.isVisible);
    setCurrentLogo(entry.logo);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setCreatedEntryId(null);
    setFormError(null);
    setFormSuccess(null);
  };

  // Quick visibility toggle directly from the table
  const handleQuickToggleVisibility = async (entry: SerializedShowcaseEntry) => {
    const nextState = !entry.isVisible;
    if (nextState && !entry.displayConsentConfirmed) {
      alert(t.consentNotice);
      return;
    }
    if (nextState && (!entry.logo || !entry.logo.secureUrl)) {
      alert(t.missingLogoWarning);
      return;
    }

    const res = await toggleShowcaseVisibilityAction(entry.id, nextState);
    if (res.success) {
      setEntries((prev) =>
        prev.map((item) => (item.id === entry.id ? { ...item, isVisible: nextState } : item))
      );
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(res.error || "Failed to update visibility.");
    }
  };

  // Upload handler for Cloudinary signed logo
  const handleLogoUpload = async (file: File) => {
    const targetEntryId = editingEntry?.id || createdEntryId;
    if (!targetEntryId) {
      setFormError("Please save the organization details first before uploading a logo.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFormError("Accepted formats: PNG, JPG, WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Logo file size must not exceed 5 MB.");
      return;
    }

    setUploadingLogo(true);
    setFormError(null);

    try {
      // Step 1: Request signed authorization from server for this entry ID
      const authRes = await getAdminShowcaseUploadSignatureAction(targetEntryId);
      if (!authRes.success || !authRes.authorization) {
        setUploadingLogo(false);
        setFormError(authRes.error || "Failed to authorize upload.");
        return;
      }

      const { cloudName, apiKey, timestamp, folder, signature, uploadPreset } = authRes.authorization;

      // Step 2: Upload directly to Cloudinary
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("folder", folder);
      if (uploadPreset) uploadData.append("upload_preset", uploadPreset);
      uploadData.append("signature", signature);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await cloudinaryRes.json();
      if (!cloudinaryRes.ok || !result.secure_url || !result.public_id) {
        setUploadingLogo(false);
        setFormError(result.error?.message || "Cloudinary upload failed.");
        return;
      }

      // Step 3: Server verifies the asset and attaches it to the entry
      const attachRes = await attachShowcaseLogoAction(targetEntryId, result.public_id);
      setUploadingLogo(false);

      if (attachRes.success && attachRes.logo) {
        setCurrentLogo(attachRes.logo);
        setFormSuccess("Logo uploaded and verified successfully.");
        // Update local entries list
        setEntries((prev) =>
          prev.map((item) => (item.id === targetEntryId ? { ...item, logo: attachRes.logo! } : item))
        );
      } else {
        setFormError(attachRes.error || "Failed to attach logo asset.");
      }
    } catch {
      setUploadingLogo(false);
      setFormError("An unexpected error occurred during logo upload.");
    }
  };

  // Submit Modal Form (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formDisplayName.trim()) {
      setFormError(t.fieldName + " is required.");
      return;
    }

    if (formIsVisible) {
      if (!formConsent) {
        setFormError(t.consentNotice);
        return;
      }
      if (!currentLogo || !currentLogo.secureUrl) {
        setFormError(t.missingLogoWarning);
        return;
      }
    }

    setSavingForm(true);

    try {
      if (editingEntry) {
        // Update existing entry
        const res = await updateShowcaseEntryAction(editingEntry.id, {
          displayName: formDisplayName,
          country: formCountry,
          websiteUrl: formWebsiteUrl,
          relationshipStatus: formRelationshipStatus,
          displayOrder: formDisplayOrder,
          displayConsentConfirmed: formConsent,
          isVisible: formIsVisible,
          organizationId: formOrganizationId || null,
        });

        setSavingForm(false);
        if (res.success) {
          setEntries((prev) =>
            prev.map((item) =>
              item.id === editingEntry.id
                ? {
                    ...item,
                    displayName: formDisplayName.trim(),
                    country: formCountry.trim(),
                    websiteUrl: formWebsiteUrl.trim(),
                    relationshipStatus: formRelationshipStatus,
                    displayOrder: formDisplayOrder,
                    displayConsentConfirmed: formConsent,
                    isVisible: formIsVisible,
                    organizationId: formOrganizationId || null,
                    updatedAt: new Date().toISOString(),
                  }
                : item
            )
          );
          startTransition(() => {
            router.refresh();
          });
          closeModal();
        } else {
          setFormError(res.error || "Failed to update entry.");
        }
      } else if (!createdEntryId) {
        // Create initial hidden entry
        const res = await createShowcaseEntryAction({
          displayName: formDisplayName,
          country: formCountry,
          websiteUrl: formWebsiteUrl,
          relationshipStatus: formRelationshipStatus,
          displayOrder: formDisplayOrder,
          displayConsentConfirmed: formConsent,
          isVisible: false, // Must be hidden initially until logo is attached
          organizationId: formOrganizationId || undefined,
        });

        setSavingForm(false);
        if (res.success && res.showcaseEntryId) {
          setCreatedEntryId(res.showcaseEntryId);
          setFormSuccess("Entry saved! Now please upload the official logo.");

          // Add to local state
          const newEntry: SerializedShowcaseEntry = {
            id: res.showcaseEntryId,
            displayName: formDisplayName.trim(),
            country: formCountry.trim(),
            websiteUrl: formWebsiteUrl.trim(),
            logo: null,
            relationshipStatus: formRelationshipStatus,
            isVisible: false,
            displayOrder: formDisplayOrder,
            organizationId: formOrganizationId || null,
            displayConsentConfirmed: formConsent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setEntries((prev) => [newEntry, ...prev]);

          startTransition(() => {
            router.refresh();
          });
        } else {
          setFormError(res.error || "Failed to create entry.");
        }
      } else {
        // Newly created entry with logo uploaded; now updating visibility/consent
        const res = await updateShowcaseEntryAction(createdEntryId, {
          displayName: formDisplayName,
          country: formCountry,
          websiteUrl: formWebsiteUrl,
          relationshipStatus: formRelationshipStatus,
          displayOrder: formDisplayOrder,
          displayConsentConfirmed: formConsent,
          isVisible: formIsVisible,
          organizationId: formOrganizationId || null,
        });

        setSavingForm(false);
        if (res.success) {
          setEntries((prev) =>
            prev.map((item) =>
              item.id === createdEntryId
                ? {
                    ...item,
                    displayName: formDisplayName.trim(),
                    country: formCountry.trim(),
                    websiteUrl: formWebsiteUrl.trim(),
                    relationshipStatus: formRelationshipStatus,
                    displayOrder: formDisplayOrder,
                    displayConsentConfirmed: formConsent,
                    isVisible: formIsVisible,
                    organizationId: formOrganizationId || null,
                    updatedAt: new Date().toISOString(),
                  }
                : item
            )
          );
          startTransition(() => {
            router.refresh();
          });
          closeModal();
        } else {
          setFormError(res.error || "Failed to update entry.");
        }
      }
    } catch {
      setSavingForm(false);
      setFormError("An unexpected error occurred while saving.");
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteSubmitting(true);

    try {
      const res = await deleteShowcaseEntryAction(deletingId);
      setDeleteSubmitting(false);

      if (res.success) {
        setEntries((prev) => prev.filter((item) => item.id !== deletingId));
        setDeletingId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || "Failed to delete entry.");
      }
    } catch {
      setDeleteSubmitting(false);
      alert("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-navy)] font-display">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-orange)] hover:bg-[#d45300] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm shrink-0 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {t.metricTotal}
          </span>
          <span className="text-2xl font-extrabold text-[var(--color-navy)] block mt-1 font-display">
            {metrics.total}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            {t.metricVisible}
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 block mt-1 font-display">
            {metrics.visible}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
            {t.metricInvited}
          </span>
          <span className="text-2xl font-extrabold text-amber-700 block mt-1 font-display">
            {metrics.invited}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200/60 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            {t.metricConfirmed}
          </span>
          <span className="text-2xl font-extrabold text-blue-700 block mt-1 font-display">
            {metrics.confirmed}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200/60 shadow-xs">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">
            {t.metricNetwork}
          </span>
          <span className="text-2xl font-extrabold text-purple-700 block mt-1 font-display">
            {metrics.network}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "ALL", label: t.tabAll },
            { key: "INVITED", label: t.tabInvited },
            { key: "CONFIRMED", label: t.tabConfirmed },
            { key: "NETWORK_PARTNER", label: t.tabNetwork },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatusTab === tab.key
                  ? "bg-[var(--color-navy)] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visibility Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setSelectedVisibilityTab("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedVisibilityTab === "ALL" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"
              }`}
            >
              {t.tabAll}
            </button>
            <button
              type="button"
              onClick={() => setSelectedVisibilityTab("VISIBLE")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedVisibilityTab === "VISIBLE" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              {t.tabVisible}
            </button>
            <button
              type="button"
              onClick={() => setSelectedVisibilityTab("HIDDEN")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedVisibilityTab === "HIDDEN" ? "bg-slate-700 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              {t.tabHidden}
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-800 placeholder-slate-400"
            />
            <svg
              className="absolute left-2.5 top-2 text-slate-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table of Showcase Entries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <svg
              className="w-12 h-12 mx-auto text-slate-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-medium">{t.emptyList}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">{t.colLogo}</th>
                  <th className="py-3 px-4">{t.colName}</th>
                  <th className="py-3 px-4">{t.colCountry}</th>
                  <th className="py-3 px-4">{t.colStatus}</th>
                  <th className="py-3 px-4">{t.colVisibility}</th>
                  <th className="py-3 px-4 text-center">{t.colOrder}</th>
                  <th className="py-3 px-4">{t.colLinkedOrg}</th>
                  <th className="py-3 px-4">{t.colUpdatedAt}</th>
                  <th className="py-3 px-4 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => {
                  const linkedOrg = organizationOptions.find((org) => org.id === entry.organizationId);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Logo Preview */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center p-1 border border-slate-200 overflow-hidden shrink-0">
                          {entry.logo?.secureUrl ? (
                            <Image
                              src={entry.logo.secureUrl}
                              alt={`${entry.displayName} logo`}
                              width={56}
                              height={40}
                              className="max-h-full max-w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No logo</span>
                          )}
                        </div>
                      </td>

                      {/* Display Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{entry.displayName}</div>
                        {entry.websiteUrl && (
                          <a
                            href={entry.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[var(--color-blue)] hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{entry.websiteUrl.replace(/^https?:\/\//, "")}</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {entry.country || "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {entry.relationshipStatus === "INVITED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {t.statusInvited}
                          </span>
                        )}
                        {entry.relationshipStatus === "CONFIRMED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t.statusConfirmed}
                          </span>
                        )}
                        {entry.relationshipStatus === "NETWORK_PARTNER" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {t.statusNetwork}
                          </span>
                        )}
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleVisibility(entry)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            entry.isVisible
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              entry.isVisible ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span>{entry.isVisible ? t.visibilityVisible : t.visibilityHidden}</span>
                        </button>
                      </td>

                      {/* Order */}
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {entry.displayOrder}
                      </td>

                      {/* Linked Org */}
                      <td className="py-3 px-4">
                        {linkedOrg ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
                              {linkedOrg.type}
                            </span>
                            <span className="truncate max-w-[140px] font-medium text-slate-800" title={linkedOrg.name}>
                              {linkedOrg.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">{t.noOrgLinked}</span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(entry)}
                            className="p-1.5 text-slate-500 hover:text-[var(--color-navy)] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Entry"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Entry"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-navy)] font-display">
                {editingEntry ? t.modalEditTitle : t.modalAddTitle}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
                  {formSuccess}
                </div>
              )}

              {/* Institution Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.fieldName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="e.g. National University of Singapore"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                />
              </div>

              {/* Country & Official Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldCountry}</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="e.g. Singapore"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldWebsite}</label>
                  <input
                    type="url"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                  />
                </div>
              </div>

              {/* Relationship Status & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.fieldStatus} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRelationshipStatus}
                    onChange={(e) => setFormRelationshipStatus(e.target.value as ShowcaseRelationshipStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                  >
                    <option value="INVITED">{t.statusInvited}</option>
                    <option value="CONFIRMED">{t.statusConfirmed}</option>
                    <option value="NETWORK_PARTNER">{t.statusNetwork}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldOrder}</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                  />
                </div>
              </div>

              {/* Optional Organization Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldLinkedOrg}</label>
                <select
                  value={formOrganizationId}
                  onChange={(e) => setFormOrganizationId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] text-slate-900"
                >
                  <option value="">{t.noOrgLinked}</option>
                  {organizationOptions.map((org) => (
                    <option key={org.id} value={org.id}>
                      [{org.type}] {org.name} ({org.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Logo Section */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">{t.fieldLogo}</label>

                {currentLogo?.secureUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-20 h-14 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-200 shrink-0">
                      <Image
                        src={currentLogo.secureUrl}
                        alt="Current logo"
                        width={80}
                        height={56}
                        className="max-h-full max-w-full object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {currentLogo.publicId.split("/").pop()}
                      </span>
                      <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
                        ✓ Verified on Cloudinary
                      </span>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleLogoUpload(f);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-3 py-1.5 text-xs font-bold text-[var(--color-blue)] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {uploadingLogo ? t.uploadingLogo : t.changeLogoBtn}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleLogoUpload(f);
                      }}
                    />
                    {editingEntry || createdEntryId ? (
                      <div>
                        <svg
                          className="w-8 h-8 mx-auto text-slate-400 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="px-4 py-2 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {uploadingLogo ? t.uploadingLogo : t.uploadLogoBtn}
                        </button>
                        <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5 MB</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Please save the entry details below first, then you can upload the logo.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Public Display Consent Checkbox */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formConsent}
                    onChange={(e) => {
                      setFormConsent(e.target.checked);
                      if (!e.target.checked) setFormIsVisible(false);
                    }}
                    className="mt-0.5 rounded text-[var(--color-orange)] focus:ring-[var(--color-orange)] h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{t.fieldConsent}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{t.consentNotice}</span>
                  </div>
                </label>
              </div>

              {/* Visibility on Homepage Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{t.fieldVisible}</span>
                    {(!formConsent || !currentLogo) && (
                      <span className="text-[11px] text-amber-600 block mt-0.5">
                        Requires verified logo and consent confirmation.
                      </span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    disabled={!formConsent || !currentLogo}
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-5 w-5 disabled:opacity-40"
                  />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={savingForm || uploadingLogo}
                  className="px-5 py-2 text-xs font-bold bg-[var(--color-orange)] hover:bg-[#d45300] text-white rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingForm ? t.savingBtn : t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">{t.deleteBtn}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.deleteConfirm}</p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleteSubmitting ? "Deleting..." : t.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
