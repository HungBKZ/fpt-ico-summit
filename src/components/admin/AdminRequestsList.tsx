"use client";

import { useState } from "react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { AccountRequest, AccountRequestStatus } from "@/lib/db/models/account-request";
import {
  approveAccountRequestAction,
  rejectAccountRequestAction,
  createAccountFromRequestAction,
} from "@/app/actions/auth-actions";

interface AdminRequestsListProps {
  initialRequests: AccountRequest[];
  locale: Locale;
  dict: Dictionary;
}

export function AdminRequestsList({
  initialRequests,
  dict,
}: AdminRequestsListProps) {
  const [requests, setRequests] = useState<AccountRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<AccountRequestStatus | "ALL">("PENDING");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalCredentials, setModalCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = requests.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.status === activeTab;
  });

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveAccountRequestAction(id);
    setLoadingId(null);
    if (res.success) {
      setRequests((prev) =>
        prev.map((r) => (String(r._id) === id ? { ...r, status: "APPROVED" } : r))
      );
    } else {
      alert(res.error || "Action failed.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason (optional):") || undefined;
    setLoadingId(id);
    const res = await rejectAccountRequestAction(id, reason);
    setLoadingId(null);
    if (res.success) {
      setRequests((prev) =>
        prev.map((r) => (String(r._id) === id ? { ...r, status: "REJECTED" } : r))
      );
    } else {
      alert(res.error || "Action failed.");
    }
  };

  const handleCreateAccount = async (id: string) => {
    setLoadingId(id);
    const res = await createAccountFromRequestAction(id);
    setLoadingId(null);
    if (res.success && res.credentials) {
      setRequests((prev) =>
        prev.map((r) => (String(r._id) === id ? { ...r, status: "ACCOUNT_CREATED" } : r))
      );
      setModalCredentials(res.credentials);
    } else {
      alert(res.error || "Account creation failed.");
    }
  };

  const handleCopyCredentials = () => {
    if (!modalCredentials) return;
    const text = `Email: ${modalCredentials.email}\nTemporary Password: ${modalCredentials.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {(["PENDING", "APPROVED", "REJECTED", "ACCOUNT_CREATED"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === status
                ? "bg-[var(--color-navy)] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {status === "PENDING" && dict.admin.pendingTab}
            {status === "APPROVED" && dict.admin.approvedTab}
            {status === "REJECTED" && dict.admin.rejectedTab}
            {status === "ACCOUNT_CREATED" && dict.admin.createdTab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="p-3">Type</th>
              <th className="p-3">Applicant Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Organization / Details</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No requests found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((req) => {
                const reqId = String(req._id);
                const isLoading = loadingId === reqId;
                return (
                  <tr key={reqId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          req.requestType === "PARTNER"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {req.requestType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-900">{req.name}</td>
                    <td className="p-3 text-slate-600">{req.email}</td>
                    <td className="p-3 text-slate-600">
                      {req.requestType === "PARTNER" ? (
                        <div>
                          <p className="font-semibold text-slate-800">{req.organizationName}</p>
                          <p className="text-[10px] text-slate-500">
                            {req.partnerType} • {req.country}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p>{req.schoolOrUniversity || "N/A"}</p>
                          {req.studentId && <p className="text-[10px] text-slate-500">ID: {req.studentId}</p>}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-[11px] text-slate-700">{req.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleApprove(reqId)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {dict.admin.approveBtn}
                            </button>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleReject(reqId)}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-50"
                            >
                              {dict.admin.rejectBtn}
                            </button>
                          </>
                        )}

                        {req.status === "APPROVED" && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleCreateAccount(reqId)}
                            className="px-2.5 py-1 bg-[var(--color-navy)] text-white rounded text-[11px] font-semibold hover:bg-slate-800 disabled:opacity-50"
                          >
                            {dict.admin.createAccountBtn}
                          </button>
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

      {/* One-Time Temporary Credentials Result Modal */}
      {modalCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">
              {dict.admin.modalTitle}
            </h3>
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg mb-4">
              {dict.admin.modalWarning}
            </div>

            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs mb-6">
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="font-bold text-slate-900">{modalCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Temporary Password:</span>
                <span className="font-bold text-emerald-700 select-all">{modalCredentials.temporaryPassword}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2 px-4 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800"
              >
                {copied ? "Copied!" : dict.admin.copyBtn}
              </button>
              <button
                type="button"
                onClick={() => setModalCredentials(null)}
                className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200"
              >
                {dict.admin.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
