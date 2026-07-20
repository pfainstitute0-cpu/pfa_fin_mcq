import { useState, useEffect } from "react";
import { 
  Lock, Mail, ShieldAlert, KeyRound, LogOut, Download, 
  Users, PlusCircle, Settings, Search, Trash2, CheckCircle2, Sparkles 
} from "lucide-react";
import CustomQuestionForm from "./CustomQuestionForm";
import { CertType, CertLevel, Question } from "../types";

interface AdminPanelProps {
  currentCert: CertType;
  currentLevel: CertLevel;
  isAdmin: boolean;
  adminToken: string | null;
  adminEmail: string;
  onLogout: () => void;
  onUpdateAdminEmail: (email: string) => void;
  onAddQuestion: (question: Question) => void;
  onAddBatchQuestions?: (questions: Question[]) => void;
}

interface StudentLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export default function AdminPanel({
  currentCert,
  currentLevel,
  isAdmin,
  adminToken,
  adminEmail,
  onLogout,
  onUpdateAdminEmail,
  onAddQuestion,
  onAddBatchQuestions,
}: AdminPanelProps) {
  // Admin section sub-tabs
  const [adminTab, setAdminTab] = useState<"add" | "leads" | "settings">("add");

  // Lead manager states
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

  // Settings update states
  const [newGmail, setNewGmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState("");
  const [settingsStatus, setSettingsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sync newGmail input state when adminEmail prop changes
  useEffect(() => {
    setNewGmail(adminEmail);
  }, [adminEmail]);

  // Fetch leads when admin clicks the leads tab
  useEffect(() => {
    if (isAdmin && adminToken && adminTab === "leads") {
      fetchRegisteredLeads();
    }
  }, [isAdmin, adminToken, adminTab]);

  const fetchRegisteredLeads = async () => {
    if (!adminToken) return;
    setFetchingLeads(true);
    try {
      const response = await fetch("/api/registered-students", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve leads. Session may have expired.");
      }

      const data = await response.json();
      if (data.success && data.students) {
        setLeads(data.students);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingLeads(false);
    }
  };

  const handleResetAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    
    if (!newGmail.trim() || !newGmail.includes("@")) {
      setSettingsStatus({ type: "error", msg: "Please enter a valid Gmail ID / Email address." });
      return;
    }
    if (newPassword.trim().length < 4) {
      setSettingsStatus({ type: "error", msg: "Password must be at least 4 characters long." });
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: adminToken,
          newEmail: newGmail.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update credentials. Session expired or unauthorized.");
      }

      const data = await response.json();
      if (data.success) {
        setSettingsStatus({ type: "success", msg: "Admin Gmail ID & Password successfully updated! Please use these credentials next time you log in." });
        onUpdateAdminEmail(newGmail.trim());
        setNewPassword("");
      }
    } catch (err: any) {
      setSettingsStatus({ type: "error", msg: err.message || "Failed to update security settings." });
    } finally {
      setSavingSettings(false);
    }
  };

  // Lead searching/filtering logic
  const filteredLeads = leads.filter((l) => {
    const q = leadSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  });

  if (!isAdmin) {
    /* ACCESS RESTRICTED SCREEN */
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4" id="admin-restricted-wrapper">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl mb-1 border border-amber-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          You are not currently authenticated as an administrator. Please click the <strong>Admin Login</strong> button in the bottom-right corner to authenticate.
        </p>
      </div>
    );
  }

  /* LOGGED-IN ADMIN PORTAL VIEWS */
  return (
    <div className="space-y-6" id="admin-portal-root">
      {/* Admin Quick Menu Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="admin-navbar">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider">
              PFA Institute Administration
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Logged in as: <span className="font-bold text-slate-800">{adminEmail}</span>
            </p>
          </div>
        </div>

        {/* Sub-tabs segment control + logout */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setAdminTab("add")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "add"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Manage MCQs
            </button>

            <button
              onClick={() => setAdminTab("leads")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "leads"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Student Leads
              {leads.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {leads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab("settings")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "settings"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Security Settings
            </button>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all cursor-pointer"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER THE CORRESPONDING SUB-TAB */}
      {adminTab === "add" && (
        <CustomQuestionForm
          currentCert={currentCert}
          currentLevel={currentLevel}
          onAddQuestion={onAddQuestion}
          onAddBatchQuestions={onAddBatchQuestions}
        />
      )}

      {adminTab === "leads" && (
        /* REGISTERED STUDENT LEADS MANAGEMENT */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="admin-leads-tab">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Registered Student Leads</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Roster of student accounts collected at the dashboard entryway. Synchronize this data with Google Sheets by importing the downloaded spreadsheet report.
              </p>
            </div>

            {/* Direct CSV Spreadsheet Download */}
            <a
              href={`/api/download-leads-csv?token=${adminToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all cursor-pointer w-fit"
              id="btn-download-leads-csv"
            >
              <Download className="w-4 h-4" />
              Export to Google Sheets (CSV)
            </a>
          </div>

          {/* Search bar & info row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="search-leads-field"
                type="text"
                placeholder="Search by Name, Email, Phone..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
          </div>

          {fetchingLeads ? (
            <div className="py-12 text-center text-slate-500 text-xs font-bold animate-pulse">
              Retrieving registered leads database...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic border border-dashed border-slate-100 rounded-2xl bg-slate-50">
              No registered student leads found matching the filter query.
            </div>
          ) : (
            /* Lead Roster Table */
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Gmail ID / Email</th>
                    <th className="py-3 px-4">WhatsApp / Phone</th>
                    <th className="py-3 px-4">Registration Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3 px-4 font-bold text-slate-950">{lead.name}</td>
                      <td className="py-3 px-4 font-medium text-slate-600 font-mono">{lead.email}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{lead.phone}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(lead.registeredAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === "settings" && (
        /* SECURITY CREDENTIALS SETTINGS */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-lg mx-auto space-y-6" id="admin-settings-tab">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">Security & Reset Options</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Reset the administrator email ID and credentials. Ensure you have access to the newly specified Gmail address before updating.
            </p>
          </div>

          {settingsStatus && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
              settingsStatus.type === "success" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}>
              {settingsStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <p className="font-medium leading-relaxed">{settingsStatus.msg}</p>
            </div>
          )}

          <form onSubmit={handleResetAdminConfig} className="space-y-4" id="reset-admin-form">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Admin Gmail ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="reset-gmail-field"
                  type="email"
                  required
                  placeholder="new-email@gmail.com"
                  value={newGmail}
                  onChange={(e) => setNewGmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="reset-password-field"
                  type="password"
                  required
                  placeholder="Set secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {savingSettings ? "Updating..." : "Update Credentials"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
