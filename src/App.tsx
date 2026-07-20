import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Award } from "lucide-react";
import Navbar from "./components/Navbar";
import MCQEngine from "./components/MCQEngine";
import SyllabusViewer from "./components/SyllabusViewer";
import CustomQuestionForm from "./components/CustomQuestionForm";
import { CertType, CertLevel, Question } from "./types";
import { defaultQuestions } from "./data/defaultQuestions";

export default function App() {
  const [activeTab, setActiveTab] = useState<"practice" | "syllabus" | "custom">("practice");
  const [selectedCert, setSelectedCert] = useState<CertType>("CMT");
  const [selectedLevel, setSelectedLevel] = useState<CertLevel>("Level 1");

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

  // Handler to log scoring event
  const handleAddScore = (isCorrect: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleResetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

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
          />
        )}

        {activeTab === "syllabus" && (
          <SyllabusViewer cert={selectedCert} level={selectedLevel} />
        )}

        {activeTab === "custom" && (
          <CustomQuestionForm
            currentCert={selectedCert}
            currentLevel={selectedLevel}
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

          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {score.total > 0 && (
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
          </div>
        </div>
      </footer>
    </div>
  );
}
