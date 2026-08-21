"use client";

import { useState } from "react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { User, UserStatus } from "@/lib/db/models/user";
import { toggleUserStatusAction, resetPartnerTemporaryPasswordAction, resetStaffTemporaryPasswordAction } from "@/app/actions/auth-actions";
import { CreatePartnerModal } from "./CreatePartnerModal";
import { AdminCreateStaffModal } from "./AdminCreateStaffModal";

interface UserWithOrgName extends User {
  organizationName?: string;
}

interface AdminUsersListProps {
  initialUsers: UserWithOrgName[];
  locale: Locale;
  dict: Dictionary;
}

/**
 * Formats date deterministically as YYYY-MM-DD to avoid SSR vs client locale hydration mismatches.
 */
function formatDate(dateInput?: Date | string | null): string {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "-";
  }
}

export function AdminUsersList({ initialUsers, dict }: AdminUsersListProps) {
  const t = dict.adminPortal;
  const [users, setUsers] = useState<UserWithOrgName[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "SUMMIT_STAFF" | "PARTNER" | "MEMBER">("ALL");
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserWithOrgName | null>(null);
  const [resetCredentials, setResetCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copiedReset, setCopiedReset] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const orgMatch = u.organizationName?.toLowerCase().includes(q);
      return nameMatch || emailMatch || orgMatch;
    }
    return true;
  });

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus: UserStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionError("");
    setLoadingId(userId);
    setOpenMenuUserId(null);
    const res = await toggleUserStatusAction(userId, newStatus);
    setLoadingId(null);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (String(u._id) === userId ? { ...u, status: newStatus } : u))
      );
    } else {
      setActionError(res.error || "Failed to update user status.");
    }
  };

  const handleResetTempPassword = async (userId: string, role: string) => {
    setOpenMenuUserId(null);
    if (!window.confirm(dict.admin.resetConfirmMessage)) {
      return;
    }

    setActionError("");
    setLoadingId(userId);

    const res = role === "SUMMIT_STAFF"
      ? await resetStaffTemporaryPasswordAction(userId)
      : await resetPartnerTemporaryPasswordAction(userId);

    setLoadingId(null);

    if (res.success && res.credentials) {
      setResetCredentials(res.credentials);
    } else {
      setActionError(res.error || "Failed to reset temporary password.");
    }
  };

  const handleCopyResetCredentials = () => {
    if (!resetCredentials) return;
    const text = `Name: ${resetCredentials.name}\nEmail: ${resetCredentials.email}\nNew Temporary Password: ${resetCredentials.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedReset(true);
    setTimeout(() => setCopiedReset(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-800">{dict.admin.usersTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts, roles, and security credentials.</p>
        </div>

        <div className="flex items-center gap-2">
          <AdminCreateStaffModal />
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition shadow-xs"
          >
            {dict.admin.createPartnerBtn}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Role Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "ALL", label: t.filterAll },
            { key: "ADMIN", label: t.filterAdmin },
            { key: "SUMMIT_STAFF", label: "Staff" },
            { key: "PARTNER", label: t.filterPartner },
            { key: "MEMBER", label: t.filterMember },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRoleFilter(tab.key as typeof roleFilter)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === tab.key
                  ? "bg-[var(--color-navy)] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-2.5 text-slate-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Partner Type / Org</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Created Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                  No accounts match the active filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const userId = String(u._id);
                const isLoading = loadingId === userId;
                const isSelfAdmin = u.role === "ADMIN";
                const isPartner = u.role === "PARTNER";

                return (
                  <tr key={userId} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : u.role === "PARTNER"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {u.role === "PARTNER" && u.partnerType ? (
                        <div>
                          <span className="font-bold text-slate-800">{u.partnerType}</span>
                          {u.organizationName && (
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">{u.organizationName}</p>
                          )}
                        </div>
                      ) : u.role === "MEMBER" ? (
                        u.profile?.memberType === "FPT_CANTHO_STUDENT" ? (
                          <div>
                            <span className="font-bold text-blue-900">FPT University Can Tho</span>
                            {u.profile.studentId && (
                              <p className="text-[10px] font-mono text-slate-600">MSSV: {u.profile.studentId}</p>
                            )}
                          </div>
                        ) : u.profile?.memberType === "EXTERNAL_PARTICIPANT" ? (
                          <div>
                            <span className="font-bold text-emerald-900">External Participant</span>
                            {(u.profile.institution || u.profile.schoolOrUniversity) && (
                              <p className="text-[10px] text-slate-500 truncate max-w-xs">
                                {u.profile.institution || u.profile.schoolOrUniversity}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Member (Unclassified)</span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="p-3.5 text-right relative">
                      {/* Compact Overflow Actions Dropdown (...) */}
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setOpenMenuUserId(openMenuUserId === userId ? null : userId)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
                          aria-label="Actions menu"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>

                        {openMenuUserId === userId && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingUser(u);
                                setOpenMenuUserId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                              <span>View Account Details</span>
                            </button>

                            {(isPartner || u.role === "SUMMIT_STAFF") && u.status !== "DISABLED" && (
                              <button
                                type="button"
                                onClick={() => handleResetTempPassword(userId, u.role)}
                                className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 transition flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 2v6h-6" />
                                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                  <path d="M3 22v-6h6" />
                                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                </svg>
                                <span>Reset Temp Password</span>
                              </button>
                            )}

                            {!isSelfAdmin && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(userId, u.status)}
                                className={`w-full text-left px-3 py-2 transition flex items-center gap-2 ${
                                  u.status === "ACTIVE"
                                    ? "text-rose-600 hover:bg-rose-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                <span>{u.status === "ACTIVE" ? dict.admin.suspendBtn : dict.admin.reactivateBtn}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">User Account Details</h3>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-900">{viewingUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Email Address</span>
                  <span className="font-bold text-slate-900">{viewingUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Account Role</span>
                  <span className="font-bold text-slate-900">{viewingUser.role}</span>
                </div>
                {viewingUser.partnerType && (
                  <div>
                    <span className="text-slate-500 block font-medium">Partner Category</span>
                    <span className="font-bold text-slate-900">{viewingUser.partnerType}</span>
                  </div>
                )}
                {viewingUser.organizationName && (
                  <div>
                    <span className="text-slate-500 block font-medium">Linked Organization</span>
                    <span className="font-bold text-slate-900">{viewingUser.organizationName}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block font-medium">Account Status</span>
                  <span className="font-bold text-slate-900">{viewingUser.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Created Date</span>
                  <span className="font-bold text-slate-900">{formatDate(viewingUser.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Partner Account Modal */}
      {showCreateModal && (
        <CreatePartnerModal
          dict={dict}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Reset Temporary Password Credentials Modal */}
      {resetCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[var(--color-navy)]">
                {dict.admin.resetModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setResetCredentials(null);
                  window.location.reload();
                }}
                className="text-slate-400 hover:text-slate-600 font-semibold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg font-medium">
                {dict.admin.modalWarning}
              </div>

              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs">
                <div>
                  <span className="text-slate-500 block">Representative:</span>
                  <span className="font-bold text-slate-900">{resetCredentials.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Work Email:</span>
                  <span className="font-bold text-slate-900">{resetCredentials.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">New Temporary Password:</span>
                  <span className="font-bold text-emerald-700 select-all">{resetCredentials.temporaryPassword}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyResetCredentials}
                  className="flex-1 py-2.5 px-4 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
                >
                  {copiedReset ? "Copied!" : dict.admin.copyBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetCredentials(null);
                    window.location.reload();
                  }}
                  className="py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
                >
                  {dict.admin.closeBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
