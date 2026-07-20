import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, RefreshCw, AlertCircle, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, RotateCcw, Award, Trash2, SlidersHorizontal, BookOpen 
} from "lucide-react";
import { CertType, CertLevel, Question } from "../types";

interface MCQEngineProps {
  cert: CertType;
  level: CertLevel;
  allQuestions: Question[];
  onAddGeneratedQuestions: (questions: Question[]) => void;
  onClearQuestionsByContext: (cert: CertType, level: CertLevel) => void;
  onAddScore: (isCorrect: boolean) => void;
}

export default function MCQEngine({
  cert,
  level,
  allQuestions,
  onAddGeneratedQuestions,
  onClearQuestionsByContext,
  onAddScore,
}: MCQEngineProps) {
  // State for Generation Form
  const [generateCount, setGenerateCount] = useState(5);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Filter States
  const [filterType, setFilterType] = useState<"all" | "ai" | "custom">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Quiz Navigation States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  // Reset quiz state when cert or level changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setGenError(null);
  }, [cert, level]);

  // Filter the questions based on active cert, level, filterType, and category
  const filteredQuestions = allQuestions.filter((q) => {
    if (q.cert !== cert || q.level !== level) return false;
    if (filterType === "ai" && q.isCustom) return false;
    if (filterType === "custom" && !q.isCustom) return false;
    if (selectedCategory !== "all" && q.category !== selectedCategory) return false;
    return true;
  });

  // Unique categories list for filters
  const categories = Array.from(
    new Set(allQuestions.filter((q) => q.cert === cert && q.level === level).map((q) => q.category))
  );

  const activeQuestion = filteredQuestions[currentIndex];

  // Trigger Gemini dynamic generation
  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cert,
          level,
          topic: generateTopic.trim() || undefined,
          count: generateCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate questions. Please ensure your Gemini API Key is configured.");
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        onAddGeneratedQuestions(data.questions);
        setGenerateTopic(""); // reset topic filter
        setCurrentIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
      } else {
        throw new Error("No questions were returned. Try again.");
      }
    } catch (err: any) {
      setGenError(err.message || "An unexpected error occurred during generation");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (selectedAnswers[activeQuestion.id] !== undefined) return; // already answered

    const isCorrect = optIdx === activeQuestion.correctAnswerIndex;
    setSelectedAnswers({
      ...selectedAnswers,
      [activeQuestion.id]: optIdx,
    });

    onAddScore(isCorrect);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleClearContext = () => {
    if (window.confirm(`Are you sure you want to clear all ${cert} ${level} questions?`)) {
      onClearQuestionsByContext(cert, level);
      handleResetQuiz();
    }
  };

  // Score summary
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.keys(selectedAnswers).reduce((acc, qId) => {
    const q = filteredQuestions.find((fq) => fq.id === qId);
    if (q && selectedAnswers[qId] === q.correctAnswerIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6" id="mcq-engine-root">
      {/* Upper Control Grid: Filters & Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MCQ Generator Controller */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="generator-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600 animate-pulse" />
              AI MCQ Question Generator
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Gemini 3.5 Flash</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Syllabus Section (Optional)</label>
              <input
                id="gen-topic-input"
                type="text"
                placeholder="e.g. Portfolio Theory, Option Pricing, Fiduciary Rules"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Batch Size</label>
              <select
                id="gen-count-select"
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer bg-slate-50/50 font-medium"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-normal max-w-sm font-medium">
              Generates high-fidelity, peer-reviewed standard practice questions incorporating updated concepts of {cert} {level}.
            </p>
            <button
              id="btn-trigger-generation"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating..." : "Generate MCQs"}
            </button>
          </div>

          {genError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5 text-rose-800" id="gen-error-banner">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Generation Error:</strong> {genError}
              </div>
            </div>
          )}
        </div>

        {/* Study Filter Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="filter-sidebar">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            Arena Filters
          </h3>

          <div className="space-y-4">
            {/* Filter by Question Source */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Question Source</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                {(["all", "ai", "custom"] as const).map((t) => (
                  <button
                    key={t}
                    id={`filter-source-${t}`}
                    onClick={() => {
                      setFilterType(t);
                      setCurrentIndex(0);
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filterType === t ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t === "all" ? "All" : t === "ai" ? "Gemini" : "Custom"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Syllabus Domain */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Syllabus Domain</span>
              <select
                id="filter-category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer bg-slate-50/50 font-medium"
              >
                <option value="all">All Syllabus Subjects ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-100">
            <span>Pool Size: {filteredQuestions.length} Questions</span>
            {filteredQuestions.length > 0 && (
              <button
                id="btn-clear-questions"
                onClick={handleClearContext}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Pool
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Testing Arena Card */}
      {generating ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4" id="arena-generating">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin absolute" />
            <Sparkles className="w-4 h-4 text-blue-500 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-slate-900">Synthesizing Core Concepts...</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our Express engine is securely contacting Google Gemini to pull syllabus guides and construct challenging multiple choice items.
            </p>
          </div>
          <div className="inline-flex gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
            <span>Syllabus: {cert} {level}</span>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        /* Empty Pool State */
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center" id="arena-empty">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-display font-extrabold text-slate-900 text-base">Study Pool Empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            There are currently no MCQ questions for {cert} {level} in the active filter. Tap "Generate MCQs" above to build a fresh, high-quality exam batch!
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              Generate 5 Practice Questions
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Quiz Engine */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6" id="arena-active">
          {/* Header Area */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-mono font-extrabold tracking-wider px-2.5 py-0.5 rounded-md uppercase">
                {activeQuestion.cert} {activeQuestion.level}
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-md">
                {activeQuestion.category}
              </span>
              {activeQuestion.isCustom && (
                <span className="bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                  My Question
                </span>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              Question {currentIndex + 1} <span className="text-slate-300">/ {filteredQuestions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden" id="quiz-progress-bar">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans font-semibold text-slate-800 text-base leading-relaxed sm:text-[18px]">
              {activeQuestion.text}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-4 pt-2" id="options-grid">
            {activeQuestion.options.map((option, idx) => {
              const selectedIdx = selectedAnswers[activeQuestion.id];
              const isAnswered = selectedIdx !== undefined;
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === activeQuestion.correctAnswerIndex;

              let btnStyle = "border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 text-slate-700";
              let badgeStyle = "border-2 border-slate-200 text-slate-400 group-hover:border-blue-300 group-hover:text-blue-600";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                  badgeStyle = "bg-emerald-500 border-2 border-emerald-600 text-white";
                } else if (isSelected) {
                  btnStyle = "border-2 border-rose-500 bg-rose-50 text-rose-950 font-bold";
                  badgeStyle = "bg-rose-500 border-2 border-rose-600 text-white";
                } else {
                  btnStyle = "border-2 border-slate-100 bg-slate-50/50 text-slate-400 opacity-50";
                  badgeStyle = "border-2 border-slate-100 text-slate-300";
                }
              }

              return (
                <button
                  key={idx}
                  id={`option-btn-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full flex items-center gap-4 p-4.5 rounded-xl text-left text-sm transition-all group ${btnStyle} cursor-pointer`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 font-mono transition-all ${badgeStyle}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed font-medium">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Answer Status & Pedagogical Explanation */}
          <AnimatePresence>
            {selectedAnswers[activeQuestion.id] !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-5 rounded-2xl border ${
                  selectedAnswers[activeQuestion.id] === activeQuestion.correctAnswerIndex
                    ? "bg-emerald-50/60 border-emerald-100"
                    : "bg-rose-50/60 border-rose-100"
                }`}
                id="explanation-block"
              >
                <div className="flex items-start gap-3">
                  {selectedAnswers[activeQuestion.id] === activeQuestion.correctAnswerIndex ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <h4
                      className={`text-sm font-bold ${
                        selectedAnswers[activeQuestion.id] === activeQuestion.correctAnswerIndex
                          ? "text-emerald-950"
                          : "text-rose-950"
                      }`}
                    >
                      {selectedAnswers[activeQuestion.id] === activeQuestion.correctAnswerIndex
                        ? "Excellent! Correct Answer."
                        : `Incorrect. The correct choice is option ${String.fromCharCode(
                            65 + activeQuestion.correctAnswerIndex
                          )}.`}
                    </h4>
                    <p className="text-xs text-zinc-700 leading-relaxed font-sans font-normal whitespace-pre-line">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls & Stats Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100">
            {/* Quick status counters */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Answered: <span className="font-extrabold text-slate-800">{answeredCount}/{filteredQuestions.length}</span></span>
              {answeredCount > 0 && (
                <span className="text-emerald-600 font-extrabold">
                  Score: {correctCount}/{answeredCount} ({Math.round((correctCount / answeredCount) * 100)}%)
                </span>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                id="btn-quiz-prev"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              
              <button
                id="btn-quiz-reset"
                onClick={handleResetQuiz}
                title="Restart quiz"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {currentIndex < filteredQuestions.length - 1 ? (
                <button
                  id="btn-quiz-next"
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
                >
                  Next Question
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="btn-quiz-finish"
                  onClick={() => setShowResults(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  View Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Modal or Overlay Sheet */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            id="results-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-6"
              id="results-modal"
            >
              <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-2xl font-bold text-slate-900">Exam Batch Results</h3>
                <p className="text-xs text-blue-600 uppercase font-mono font-bold tracking-wider">
                  {cert} {level} Exam Prep
                </p>
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {Math.round((correctCount / filteredQuestions.length) * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Accuracy</div>
                </div>
                <div className="text-center border-l border-slate-200">
                  <div className="text-3xl font-bold text-slate-900">
                    {correctCount}/{filteredQuestions.length}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Correct Questions</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed px-2">
                {correctCount === filteredQuestions.length
                  ? "Flawless score! You have masterfully retained these certification topics. Keep up this magnificent momentum!"
                  : correctCount >= filteredQuestions.length * 0.7
                  ? "Exceptional work! You are comfortably passing this topic batch. Go over the explanations for any missed questions to solidify concepts."
                  : "Good effort! Practice makes perfect. Check the explanations, generate a fresh batch of questions, and target your weak areas."}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  id="btn-modal-review"
                  onClick={() => setShowResults(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  id="btn-modal-restart"
                  onClick={() => {
                    handleResetQuiz();
                    setShowResults(false);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
                >
                  Restart Practice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
