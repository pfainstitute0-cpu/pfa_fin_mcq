import { useState, useEffect } from "react";
import { 
  Lock, Mail, ShieldAlert, KeyRound, LogOut, Download, 
  Users, PlusCircle, Settings, Search, Trash2, CheckCircle2, Sparkles, ShieldCheck,
  BookOpen, TrendingUp
} from "lucide-react";
import CustomQuestionForm from "./CustomQuestionForm";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { CertType, CertLevel, Question } from "../types";

interface AdminPanelProps {
  currentCert: CertType;
  currentLevel: CertLevel;
  isAdmin: boolean;
  adminToken: string | null;
  adminEmail: string;
  questions?: Question[];
  onLogout: () => void;
  onUpdateAdminEmail: (email: string) => void;
  onAddQuestion: (question: Question) => void;
  onAddBatchQuestions?: (questions: Question[]) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

interface StudentLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  isPaid?: boolean;
  utr?: string;
  subscriptionEndsAt?: number;
  paymentStatus?: string;
}

export default function AdminPanel({
  currentCert,
  currentLevel,
  isAdmin,
  adminToken,
  adminEmail,
  questions = [],
  onLogout,
  onUpdateAdminEmail,
  onAddQuestion,
  onAddBatchQuestions,
  onDeleteQuestion,
}: AdminPanelProps) {
  // Admin section sub-tabs
  const [adminTab, setAdminTab] = useState<"add" | "questions" | "leads" | "analytics" | "settings">("add");

  // Lead manager states
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

  // Q&A Pool Inspector states
  const [qSearch, setQSearch] = useState("");
  const [qCertFilter, setQCertFilter] = useState<"ALL" | CertType>("ALL");
  const [qLevelFilter, setQLevelFilter] = useState<"ALL" | CertLevel>("ALL");
  const [deletingQId, setDeletingQId] = useState<string | null>(null);

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

  const handleTogglePayment = async (studentEmail: string, currentIsPaid?: boolean) => {
    if (!adminToken) return;
    try {
      const action = currentIsPaid ? "revoke" : "approve";
      const response = await fetch("/api/admin/verify-student-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: adminToken,
          email: studentEmail,
          action,
          days: 364
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        fetchRegisteredLeads();
      } else {
        alert(data.error || "Failed to update payment status.");
      }
    } catch (err) {
      console.error("Failed to toggle payment:", err);
      alert("Error contacting admin server.");
    }
  };

  const handleResetStudentPassword = async (studentEmail: string, studentName: string) => {
    if (!adminToken) return;
    const newPass = window.prompt(`Enter new password for student ${studentName} (${studentEmail}):`);
    if (!newPass || newPass.trim().length < 4) {
      if (newPass !== null) alert("Password must be at least 4 characters long.");
      return;
    }

    try {
      const response = await fetch("/api/admin/reset-student-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          token: adminToken,
          studentEmail: studentEmail,
          newPassword: newPass.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(`Password for ${studentName} (${studentEmail}) successfully reset!`);
      } else {
        alert(data.error || "Failed to reset student password.");
      }
    } catch (err) {
      console.error("Reset student password error:", err);
      alert("Network failure while contacting admin server.");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!adminToken) return;
    if (!window.confirm("Are you sure you want to delete this question from the official pool?")) return;

    setDeletingQId(qId);
    try {
      const res = await fetch("/api/admin/delete-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          token: adminToken,
          questionId: qId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onDeleteQuestion) onDeleteQuestion(qId);
      } else {
        alert(data.error || "Failed to delete question from server.");
      }
    } catch (err) {
      console.error("Delete question error:", err);
      alert("Network error deleting question.");
    } finally {
      setDeletingQId(null);
    }
  };

  const handleResetAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    
    if (newGmail.trim().toLowerCase() !== "pfainstitute0@gmail.com") {
      setSettingsStatus({ type: "error", msg: "Admin access is strictly limited to pfainstitute0@gmail.com." });
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

  // Questions filtering logic for Seeing Q&A tab
  const filteredQuestions = questions.filter((q) => {
    const matchesCert = qCertFilter === "ALL" || q.cert === qCertFilter;
    const matchesLevel = qLevelFilter === "ALL" || q.level === qLevelFilter;
    const matchesQuery = !qSearch.trim() || 
      q.text.toLowerCase().includes(qSearch.toLowerCase()) || 
      q.category.toLowerCase().includes(qSearch.toLowerCase());
    return matchesCert && matchesLevel && matchesQuery;
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
              Upload Q&A
            </button>

            <button
              onClick={() => setAdminTab("questions")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "questions"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Seeing Q&A ({questions.length})
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
              Student Leads & Payments
              {leads.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {leads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab("analytics")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === "analytics"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Student Data Analytics
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

      {adminTab === "questions" && (
        /* Q&A POOL INSPECTOR & MANAGEMENT */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="admin-questions-tab">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Question Database Pool Inspector</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Review, filter, inspect choices, rationales, and remove MCQs across all certification curricula.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Pool: {questions.length} MCQs
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search question text or category..."
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={qCertFilter}
              onChange={(e) => setQCertFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Certifications ({questions.length})</option>
              <option value="CMT">CMT Questions</option>
              <option value="CFA">CFA Questions</option>
              <option value="CFP">CFP Questions</option>
              <option value="FRM">FRM Questions</option>
            </select>

            <select
              value={qLevelFilter}
              onChange={(e) => setQLevelFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Syllabus Levels</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
            </select>
          </div>

          {/* Questions Pool List */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No questions match your filter parameters.</p>
              <p className="text-[10px] text-slate-400">Try adjusting your search query or certification dropdowns.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-mono">
                          {q.cert} • {q.level}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs leading-relaxed mt-1">
                        {q.text}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={deletingQId === q.id}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingQId === q.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>

                  {/* Option choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                            isCorrect 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold" 
                              : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}
                        >
                          <span className="truncate max-w-[220px]">
                            <strong>{String.fromCharCode(65 + optIdx)}:</strong> {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-[9px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] text-slate-600 space-y-0.5">
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Curriculum Explanation:</span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adminTab === "analytics" && (
        /* ADMIN DATA ANALYTICS MODULE */
        <AnalyticsDashboard isAdmin={true} adminToken={adminToken} />
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

          {/* Synchronize Spreadsheet Input Zone */}
          <LeadImporter adminToken={adminToken} onSyncComplete={fetchRegisteredLeads} />

          {/* Real-time Google Sheets Live Webhook Sync Guide */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Live Google Sheets Sync Active</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase">
                Realtime Webhook Ready
              </span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Every time a student pays via UPI/Razorpay or when you manually verify or revoke an account, the server automatically transmits a webhook payload containing:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Student Name", "Email", "Phone Number", "12-Digit UTR", "Payment Status (Paid/Unpaid)", "Subscription Valid Until", "Days Remaining"].map((col) => (
                <span key={col} className="bg-white/80 border border-emerald-200 text-emerald-900 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold">
                  ✓ {col}
                </span>
              ))}
            </div>
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
            <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">12-Digit UPI UTR</th>
                    <th className="py-3.5 px-4">Payment & Expiry</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLeads.map((lead) => {
                    const endsAt = lead.subscriptionEndsAt;
                    const daysLeft = endsAt 
                      ? Math.max(0, Math.ceil((endsAt - Date.now()) / (1000 * 60 * 60 * 24)))
                      : null;
                    const expiryFormatted = endsAt
                      ? new Date(endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : null;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 transition-all">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-950">{lead.name}</div>
                          <div className="text-[10px] text-slate-400">Reg: {new Date(lead.registeredAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700 font-mono text-[11px]">{lead.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{lead.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          {lead.utr ? (
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md inline-block select-all">
                              {lead.utr}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not Submitted</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {lead.isPaid ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified Active
                              </span>
                              {expiryFormatted && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Limit: {expiryFormatted} ({daysLeft}d left)
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                              Unpaid / Locked
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResetStudentPassword(lead.email, lead.name)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Reset Student Password"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Reset Pwd</span>
                            </button>

                            <button
                              onClick={() => handleTogglePayment(lead.email, lead.isPaid)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                lead.isPaid 
                                  ? "bg-slate-100 text-rose-600 hover:bg-rose-100 border border-slate-200"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                              }`}
                            >
                              {lead.isPaid ? "Revoke Access" : "Grant 364-Day Access"}
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
      )}

      {adminTab === "settings" && (
        /* SECURITY CREDENTIALS SETTINGS */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-lg mx-auto space-y-6" id="admin-settings-tab">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">Security & Reset Options</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Reset the administrator master password. Admin access is strictly limited to <strong>pfainstitute0@gmail.com</strong>.
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Locked Admin Gmail ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="reset-gmail-field"
                  type="email"
                  required
                  readOnly
                  disabled
                  placeholder="pfainstitute0@gmail.com"
                  value="pfainstitute0@gmail.com"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-500 cursor-not-allowed select-none"
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

interface LeadImporterProps {
  adminToken: string | null;
  onSyncComplete: () => void;
}

function LeadImporter({ adminToken, onSyncComplete }: LeadImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFeedback(null);
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setFeedback({ type: "error", msg: "Invalid file type. Please upload a standard Excel or Google Sheets CSV file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setFeedback({ type: "error", msg: "Empty spreadsheet file or headers only." });
          return;
        }

        // Clean BOM and parse headers
        const headers = lines[0]
          .replace(/^\uFEFF/, "")
          .split(",")
          .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

        // Match variations of headers
        const nameIdx = headers.findIndex((h) => h === "name" || h === "student name" || h === "full name" || h === "studentname");
        const emailIdx = headers.findIndex((h) => h === "email" || h === "gmail id / email" || h === "email address" || h === "emailaddress");
        const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("whatsapp") || h.includes("number") || h === "phone number");
        const dateIdx = headers.findIndex((h) => h.includes("date") || h.includes("time") || h.includes("registered") || h === "registration date");
        const idIdx = headers.indexOf("id");

        if (nameIdx === -1 || emailIdx === -1) {
          setFeedback({ 
            type: "error", 
            msg: "Missing required headers. Please make sure your CSV contains at least 'Name' and 'Email' columns." 
          });
          return;
        }

        const studentsList: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split cells respecting quotes for escaped commas
          const cells: string[] = [];
          let currentCell = "";
          let inQuotes = false;
          for (let charIdx = 0; charIdx < line.length; charIdx++) {
            const char = line[charIdx];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cells.push(currentCell.trim().replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"'));
              currentCell = "";
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell.trim().replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"'));

          const name = cells[nameIdx] || "";
          const email = cells[emailIdx] || "";
          const phone = phoneIdx !== -1 ? cells[phoneIdx] : "";
          const registeredAt = dateIdx !== -1 && cells[dateIdx] ? cells[dateIdx] : new Date().toISOString();
          const id = idIdx !== -1 ? cells[idIdx] : "";

          if (email && name) {
            studentsList.push({ id, name, email, phone, registeredAt });
          }
        }

        if (studentsList.length === 0) {
          setFeedback({ type: "error", msg: "No valid student profiles could be parsed from the file." });
        } else {
          setParsedLeads(studentsList);
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: "error", msg: "Failed to parse spreadsheet file. Ensure the file encoding is UTF-8." });
      }
    };
    reader.readAsText(file);
  };

  const handleSyncSubmit = async () => {
    if (parsedLeads.length === 0 || !adminToken) return;

    setImporting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/import-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ importedStudents: parsedLeads })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFeedback({ type: "success", msg: data.message });
        setParsedLeads([]);
        onSyncComplete();
      } else {
        setFeedback({ type: "error", msg: data.error || "Failed to synchronize leads list." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", msg: "Network connection lost. Failed to submit spreadsheet sync request." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4" id="lead-importer-container">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-xs">Spreadsheet Synchronization Dashboard</h4>
          <p className="text-[10px] text-slate-500 font-medium font-sans">Synchronize, update, or append registered leads using an exported Google Sheets CSV spreadsheet report.</p>
        </div>
        {parsedLeads.length > 0 && (
          <button
            onClick={() => setParsedLeads([])}
            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider cursor-pointer"
          >
            Cancel Upload
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
          feedback.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          {feedback.msg}
        </div>
      )}

      {parsedLeads.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer ${
            isDragging 
              ? "border-blue-500 bg-blue-50/40" 
              : "border-slate-200 bg-white hover:bg-slate-50/20 hover:border-slate-300"
          }`}
          id="csv-drag-drop-zone"
          onClick={() => document.getElementById("csv-file-input")?.click()}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">Drag & drop your Google Sheets CSV report here</p>
            <p className="text-[10px] text-slate-400 font-medium">Or click here to browse files on your computer</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
            <span>📋 Parsed Spreadsheet Preview ({parsedLeads.length} student leads)</span>
            <span className="text-[10px] text-blue-600 font-mono font-bold">UTF-8 Encoded</span>
          </div>
          
          <div className="max-h-[120px] overflow-y-auto divide-y divide-slate-100 pr-1 text-[11px] font-sans">
            {parsedLeads.slice(0, 5).map((lead, idx) => (
              <div key={idx} className="py-2 flex justify-between">
                <div>
                  <span className="font-bold text-slate-800">{lead.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">{lead.email}</span>
                </div>
                <span className="text-slate-500 font-mono">{lead.phone || "No phone"}</span>
              </div>
            ))}
            {parsedLeads.length > 5 && (
              <p className="text-[10px] text-slate-400 italic pt-2 text-center">... and {parsedLeads.length - 5} more student profiles</p>
            )}
          </div>

          <button
            onClick={handleSyncSubmit}
            disabled={importing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {importing ? (
              <span>Synchronizing Leads Database...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Confirm & Merge {parsedLeads.length} Student Profiles to Server</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
