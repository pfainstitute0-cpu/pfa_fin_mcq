import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Award, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "./components/Navbar";
import MCQEngine from "./components/MCQEngine";
import SyllabusViewer from "./components/SyllabusViewer";
import LeadGate from "./components/LeadGate";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";
import ServerHealthMonitor from "./components/ServerHealthMonitor";
import PaymentModal from "./components/PaymentModal";
import { CertType, CertLevel, Question, StudentInfo } from "./types";
import { defaultQuestions } from "./data/defaultQuestions";
import { logTelemetryEvent } from "./lib/telemetry";

export default function App() {
  const [activeTab, setActiveTab] = useState<"practice" | "syllabus" | "analytics" | "custom">("practice");
  const [selectedCert, setSelectedCert] = useState<CertType>("CMT");
  const [selectedLevel, setSelectedLevel] = useState<CertLevel>("Level 1");

  // Telemetry page transition tracking
  useEffect(() => {
    logTelemetryEvent({
      eventType: "page_click",
      eventTarget: `Tab View: ${activeTab}`,
      metadata: { cert: selectedCert, level: selectedLevel }
    });
  }, [activeTab]);

  // Telemetry context changes
  useEffect(() => {
    logTelemetryEvent({
      eventType: "button_click",
      eventTarget: `Selected Exam: ${selectedCert} - ${selectedLevel}`,
    });
  }, [selectedCert, selectedLevel]);

  // Load student information from local storage for lead generation gatekeeping
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(() => {
    const saved = localStorage.getItem("finance_prep_student_info");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse student info", e);
      }
    }
    return null;
  });

  // Verify student paid status on mount
  useEffect(() => {
    if (studentInfo && studentInfo.email && studentInfo.email.trim().toLowerCase() !== "pfainstitute0@gmail.com") {
      fetch("/api/student/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentInfo.email }),
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          if (!data.isPaid) {
            // Update local state to mark unpaid/expired
            const updated = { ...studentInfo, isPaid: false };
            setStudentInfo(updated);
            localStorage.setItem("finance_prep_student_info", JSON.stringify(updated));
          } else if (data.subscriptionEndsAt && data.subscriptionEndsAt !== studentInfo.subscriptionEndsAt) {
            const updated = { ...studentInfo, isPaid: true, subscriptionEndsAt: data.subscriptionEndsAt };
            setStudentInfo(updated);
            localStorage.setItem("finance_prep_student_info", JSON.stringify(updated));
          }
        }
      })
      .catch(err => console.warn("Failed to verify active student subscription:", err));
    }
  }, []);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Lifted Admin state management
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Sync admin authentication session on mount and when studentInfo changes
  useEffect(() => {
    const savedToken = localStorage.getItem("finance_prep_admin_token");
    const savedEmail = localStorage.getItem("finance_prep_admin_email") || "pfainstitute0@gmail.com";
    
    // Admin access is strictly limited to pfainstitute0@gmail.com
    if (savedToken && studentInfo && studentInfo.email.trim().toLowerCase() === "pfainstitute0@gmail.com") {
      setAdminToken(savedToken);
      setIsAdmin(true);
      setAdminEmail("pfainstitute0@gmail.com");
    } else {
      setAdminToken(null);
      setIsAdmin(false);
      setAdminEmail("");
      localStorage.removeItem("finance_prep_admin_token");
      localStorage.removeItem("finance_prep_admin_email");
    }
  }, [studentInfo]);

  const handleAdminLoginSuccess = (token: string, email: string) => {
    const cleanEmail = "pfainstitute0@gmail.com";
    localStorage.setItem("finance_prep_admin_token", token);
    localStorage.setItem("finance_prep_admin_email", cleanEmail);
    setAdminToken(token);
    setIsAdmin(true);
    setAdminEmail(cleanEmail);
    
    // Force set student info to the admin's user profile so everything in the app lines up correctly
    const adminStudent = { name: "PFA Admin", email: cleanEmail, phone: "" };
    setStudentInfo(adminStudent);
    localStorage.setItem("finance_prep_student_info", JSON.stringify(adminStudent));
    setActiveTab("custom"); // direct the authenticated admin immediately to the custom MCQ panel
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("finance_prep_admin_token");
    localStorage.removeItem("finance_prep_admin_email");
    localStorage.removeItem("finance_prep_student_info"); // Also logout student session to clean state
    setAdminToken(null);
    setIsAdmin(false);
    setStudentInfo(null);
    setActiveTab("practice");
  };

  const handleUpdateAdminEmail = (newEmail: string) => {
    // Admin email is locked to pfainstitute0@gmail.com
    setAdminEmail("pfainstitute0@gmail.com");
    localStorage.setItem("finance_prep_admin_email", "pfainstitute0@gmail.com");
  };

  const handleAdminPortalTrigger = () => {
    if (isAdmin) {
      setActiveTab("custom");
    } else {
      setShowAdminLoginModal(true);
    }
  };

  // Load questions from local storage cache, or fall back to static high-fidelity defaults
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("finance_prep_questions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Question[];
        // Sync check: Ensure all defaultQuestions are in the active questions array
        const parsedIds = new Set(parsed.map((q) => q.id));
        const missingDefaults = defaultQuestions.filter((q) => !parsedIds.has(q.id));
        if (missingDefaults.length > 0) {
          return [...parsed, ...missingDefaults];
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse cached questions list", e);
      }
    }
    return defaultQuestions;
  });

  // Load cumulative score state
  const [score, setScore] = useState<{ correct: number; total: number }>(() => {
    const savedScore = localStorage.getItem("finance_prep_cumulative_score");
    if (savedScore) {
      try {
        return JSON.parse(savedScore);
      } catch (e) {
        console.error("Failed to parse score", e);
      }
    }
    return { correct: 0, total: 0 };
  });

  // Save questions to cache whenever updated
  useEffect(() => {
    localStorage.setItem("finance_prep_questions", JSON.stringify(questions));
  }, [questions]);

  // Fetch questions from the server pool on startup to stay synchronized
  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.questions)) {
          // Avoid overwriting with empty if something goes wrong, but sync server questions
          if (data.questions.length > 0) {
            setQuestions(data.questions);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not sync with server-side question pool, using local defaults:", err);
      });
  }, []);

  // Save cumulative score to cache
  useEffect(() => {
    localStorage.setItem("finance_prep_cumulative_score", JSON.stringify(score));
  }, [score]);

  // Handler to append generated questions from Gemini API
  const handleAddQuestions = (newQs: Question[]) => {
    setQuestions((prev) => {
      // Avoid duplicate question IDs
      const prevIds = new Set(prev.map((q) => q.id));
      const filteredNew = newQs.filter((q) => !prevIds.has(q.id));
      return [...filteredNew, ...prev]; // insert new questions at the beginning
    });
    // Sync with server pool
    fetch("/api/questions/add-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: newQs })
    }).catch((err) => console.warn("Failed to sync new batch questions to server:", err));
  };

  // Handler to append a single custom question
  const handleAddSingleQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
    // Sync with server pool
    fetch("/api/questions/add-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: [newQ] })
    }).catch((err) => console.warn("Failed to sync new single question to server:", err));
  };

  // Handler to clear questions for a specific certification context (e.g. reset back to defaults)
  const handleClearQuestionsByContext = (cert: CertType, level: CertLevel) => {
    setQuestions((prev) => {
      // Keep other certifications, but remove the current target's non-default questions
      const defaultIds = new Set(defaultQuestions.map((q) => q.id));
      return prev.filter((q) => {
        // If it's a different cert/level, keep it
        if (q.cert !== cert || q.level !== level) return true;
        // If it's in the original static defaults, keep it so the pool is never totally blank
        return defaultIds.has(q.id);
      });
    });
  };

  // Handler to log scoring event with detailed log histories for diagnostic analytics
  const handleAddScore = (isCorrect: boolean, question: Question, selectedIndex: number) => {
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    try {
      const savedLogs = localStorage.getItem("finance_prep_attempts_log");
      let logs = [];
      if (savedLogs) {
        logs = JSON.parse(savedLogs);
      }
      const newAttempt = {
        questionId: question.id,
        questionText: question.text,
        cert: question.cert,
        level: question.level,
        category: question.category,
        selectedIndex,
        correctIndex: question.correctAnswerIndex,
        isCorrect,
        timestamp: Date.now(),
      };
      logs.unshift(newAttempt);
      localStorage.setItem("finance_prep_attempts_log", JSON.stringify(logs));

      // Sync attempt to the backend server in real-time
      if (studentInfo) {
        fetch("/api/submit-attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentEmail: studentInfo.email,
            studentName: studentInfo.name,
            attempt: newAttempt
          })
        }).catch((err) => {
          console.warn("Backend attempt sync failed:", err);
        });

        // Also track telemetry for this question attempt
        logTelemetryEvent({
          studentEmail: studentInfo.email,
          studentName: studentInfo.name,
          eventType: "practice_attempt",
          eventTarget: `MCQ Answer: ${question.cert} - ${question.level}`,
          metadata: {
            questionId: question.id,
            category: question.category,
            isCorrect,
            selectedIndex,
          }
        });
      }
    } catch (e) {
      console.error("Failed to save attempt log", e);
    }
  };

  const handleResetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

  const handleStudentLogout = () => {
    setStudentInfo(null);
    localStorage.removeItem("finance_prep_student_info");
  };

  const handlePaymentSuccess = (updatedStudent: StudentInfo) => {
    setStudentInfo(updatedStudent);
    localStorage.setItem("finance_prep_student_info", JSON.stringify(updatedStudent));
  };

  const isStudentPaid = studentInfo && (
    studentInfo.isPaid || 
    studentInfo.email.trim().toLowerCase() === "pfainstitute0@gmail.com"
  );

  if (!studentInfo || !isStudentPaid) {
    return (
      <>
        <LeadGate
          initialStudent={studentInfo}
          onUnlock={(info) => {
            setStudentInfo(info);
            localStorage.setItem("finance_prep_student_info", JSON.stringify(info));
            logTelemetryEvent({
              studentEmail: info.email,
              studentName: info.name,
              eventType: "login",
              eventTarget: "Portal Unlock / Signup Successful",
              metadata: { phone: info.phone }
            });
          }}
          onAdminTrigger={() => setShowAdminLoginModal(true)}
          onLogout={handleStudentLogout}
        />
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      </>
    );
  }

  const currentContextQuestions = questions.filter(
    (q) => q.cert === selectedCert && q.level === selectedLevel
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white" id="app-root">
      {/* Premium Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCert={selectedCert}
        setSelectedCert={setSelectedCert}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        questionCount={currentContextQuestions.length}
        score={score}
        isAdmin={isAdmin}
        studentInfo={studentInfo}
        onStudentLogout={handleStudentLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Highlighted MBA/Interview Prep banner for Free/Logged-in Users */}
        {!studentInfo?.isPaid && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-md space-y-3 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in slide-in-from-top-4" id="app-promo-header">
            {/* Background design elements */}
            <div className="absolute right-[-5%] top-[-20%] w-[35%] h-[150%] rounded-full bg-white/5 blur-[50px] pointer-events-none"></div>
            
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 text-white border border-white/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" /> Best for Interview & MBA Prep
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                Not able to clear your finance exam or MBA interview? Use this tool to crack it and feel confident!
              </h3>
              <p className="text-xs text-slate-100 leading-relaxed font-normal">
                Don't have time to read books? Directly attempt customized, high-yield practice questions using our powerful AI-powered MCQ generator and master concepts instantly.
              </p>
            </div>
            
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-all cursor-pointer shrink-0 text-center flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Upgrade 1-Year (₹99)
            </button>
          </div>
        )}

        {/* If premium is active, show a premium status indicator */}
        {studentInfo?.isPaid && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3" id="premium-active-banner">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                Premium student license active
              </h4>
              <p className="text-[11px] text-emerald-700">
                You have unlimited access to AI-powered MCQ generators, syllabus trackers, and analytics for 1 full year. Happy prepping!
              </p>
            </div>
          </div>
        )}

        {activeTab === "practice" && (
          <MCQEngine
            cert={selectedCert}
            level={selectedLevel}
            allQuestions={questions}
            onAddGeneratedQuestions={handleAddQuestions}
            onClearQuestionsByContext={handleClearQuestionsByContext}
            onAddScore={handleAddScore}
            isAdmin={isAdmin}
            isPaid={!!studentInfo?.isPaid}
            onUpgradeTrigger={() => setIsPaymentModalOpen(true)}
          />
        )}

        {activeTab === "syllabus" && (
          <SyllabusViewer cert={selectedCert} level={selectedLevel} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard isAdmin={isAdmin} adminToken={adminToken} studentInfo={studentInfo} />
        )}

        {activeTab === "custom" && (
          <AdminPanel
            currentCert={selectedCert}
            currentLevel={selectedLevel}
            isAdmin={isAdmin}
            adminToken={adminToken}
            adminEmail={adminEmail}
            questions={questions}
            onLogout={handleAdminLogout}
            onUpdateAdminEmail={handleUpdateAdminEmail}
            onAddQuestion={handleAddSingleQuestion}
            onAddBatchQuestions={handleAddQuestions}
            onDeleteQuestion={(qId) => {
              setQuestions(prev => prev.filter(q => q.id !== qId));
            }}
          />
        )}
      </main>

      {/* Aesthetic Footer - Simple & Humble (No margin clutter, no simulated logs) */}
      <footer className="border-t border-slate-200 bg-white py-10 mt-12" id="app-footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              PRACTICAL FINANCIAL ANALYST INSTITUTE
            </div>
            <p className="text-xs text-slate-400 font-medium">
              A comprehensive study ecosystem built to aid technical market analysis, financial research, risk management, and personal planning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider justify-center md:justify-end">
            {isAdmin && score.total > 0 && (
              <button
                onClick={handleResetScore}
                className="text-[10px] text-rose-500 hover:text-rose-700 transition-all uppercase tracking-wider font-mono cursor-pointer"
                id="btn-reset-score"
              >
                Reset Stats
              </button>
            )}
            <span className="text-slate-200">|</span>
            <span>CMT Association®</span>
            <span className="text-slate-200">•</span>
            <span>CFA Institute®</span>
            <span className="text-slate-200">•</span>
            <span>CFP Board®</span>
            <span className="text-slate-200">•</span>
            <span>GARP® (FRM)</span>
            <span className="text-slate-200">|</span>
            <button
              id="admin-footer-trigger"
              onClick={handleAdminPortalTrigger}
              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline transition-all uppercase tracking-wider font-bold cursor-pointer shrink-0"
            >
              {isAdmin ? "Admin Panel" : "Admin Login"}
            </button>
          </div>
        </div>
      </footer>

      {/* Payment Upgrade Modal */}
      {studentInfo && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          studentEmail={studentInfo.email}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Admin Login Modal (Hidden by default, secure layout) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Render cold-start helper monitor */}
      <ServerHealthMonitor />
    </div>
  );
}
