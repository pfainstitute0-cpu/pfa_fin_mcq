import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Award } from "lucide-react";
import Navbar from "./components/Navbar";
import MCQEngine from "./components/MCQEngine";
import SyllabusViewer from "./components/SyllabusViewer";
import LeadGate from "./components/LeadGate";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";
import { CertType, CertLevel, Question } from "./types";
import { defaultQuestions } from "./data/defaultQuestions";

export default function App() {
  const [activeTab, setActiveTab] = useState<"practice" | "syllabus" | "analytics" | "custom">("practice");
  const [selectedCert, setSelectedCert] = useState<CertType>("CMT");
  const [selectedLevel, setSelectedLevel] = useState<CertLevel>("Level 1");

  // Lifted Admin state management
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Sync admin authentication session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("finance_prep_admin_token");
    const savedEmail = localStorage.getItem("finance_prep_admin_email") || "pfainstitute0@gmail.com";
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
      setAdminEmail(savedEmail);
    }
  }, []);

  const handleAdminLoginSuccess = (token: string, email: string) => {
    localStorage.setItem("finance_prep_admin_token", token);
    localStorage.setItem("finance_prep_admin_email", email);
    setAdminToken(token);
    setIsAdmin(true);
    setAdminEmail(email);
    setActiveTab("custom"); // direct the authenticated admin immediately to the custom MCQ panel
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("finance_prep_admin_token");
    localStorage.removeItem("finance_prep_admin_email");
    setAdminToken(null);
    setIsAdmin(false);
    setActiveTab("practice");
  };

  const handleUpdateAdminEmail = (newEmail: string) => {
    setAdminEmail(newEmail);
    localStorage.setItem("finance_prep_admin_email", newEmail);
  };

  const handleAdminPortalTrigger = () => {
    if (isAdmin) {
      setActiveTab("custom");
    } else {
      setShowAdminLoginModal(true);
    }
  };

  // Load student information from local storage for lead generation gatekeeping
  const [studentInfo, setStudentInfo] = useState<{ name: string; email: string; phone: string } | null>(() => {
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
  };

  // Handler to append a single custom question
  const handleAddSingleQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
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

  if (!studentInfo) {
    return (
      <>
        <LeadGate
          onUnlock={(info) => {
            setStudentInfo(info);
            localStorage.setItem("finance_prep_student_info", JSON.stringify(info));
          }}
          onAdminTrigger={() => setShowAdminLoginModal(true)}
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
        {activeTab === "practice" && (
          <MCQEngine
            cert={selectedCert}
            level={selectedLevel}
            allQuestions={questions}
            onAddGeneratedQuestions={handleAddQuestions}
            onClearQuestionsByContext={handleClearQuestionsByContext}
            onAddScore={handleAddScore}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === "syllabus" && (
          <SyllabusViewer cert={selectedCert} level={selectedLevel} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard isAdmin={isAdmin} adminToken={adminToken} />
        )}

        {activeTab === "custom" && (
          <AdminPanel
            currentCert={selectedCert}
            currentLevel={selectedLevel}
            isAdmin={isAdmin}
            adminToken={adminToken}
            adminEmail={adminEmail}
            onLogout={handleAdminLogout}
            onUpdateAdminEmail={handleUpdateAdminEmail}
            onAddQuestion={handleAddSingleQuestion}
            onAddBatchQuestions={handleAddQuestions}
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

      {/* Admin Login Modal (Hidden by default, secure layout) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
