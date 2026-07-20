import { BookOpen, HelpCircle, PlusCircle, Award, CheckCircle2 } from "lucide-react";
import { CertType, CertLevel } from "../types";
import Logo from "./Logo";

interface NavbarProps {
  activeTab: "practice" | "syllabus" | "custom";
  setActiveTab: (tab: "practice" | "syllabus" | "custom") => void;
  selectedCert: CertType;
  setSelectedCert: (cert: CertType) => void;
  selectedLevel: CertLevel;
  setSelectedLevel: (level: CertLevel) => void;
  questionCount: number;
  score: { correct: number; total: number };
}

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedCert,
  setSelectedCert,
  selectedLevel,
  setSelectedLevel,
  questionCount,
  score,
}: NavbarProps) {
  const certs: CertType[] = ["CMT", "CFA", "CFP", "FRM"];
  const levels: CertLevel[] = ["Level 1", "Level 2", "Level 3"];

  const getSuccessRate = () => {
    if (score.total === 0) return 0;
    return Math.round((score.correct / score.total) * 100);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 w-full" id="navbar-header">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo & Description */}
        <div className="flex items-center gap-3">
          <Logo variant="horizontal" />
        </div>

        {/* Global Controls: Cert & Level */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Certificate Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200" id="cert-selector">
            {certs.map((c) => (
              <button
                key={c}
                id={`cert-btn-${c}`}
                onClick={() => setSelectedCert(c)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedCert === c
                    ? "bg-white text-blue-700 shadow-sm font-bold border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Level Selector */}
          <select
            id="level-selector"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as CertLevel)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Stats or Accuracy */}
        {score.total > 0 && (
          <div className="hidden lg:flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5" id="stats-badge">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div className="text-xs font-semibold text-emerald-800">
              Accuracy: <span className="font-bold">{getSuccessRate()}%</span> ({score.correct}/{score.total})
            </div>
          </div>
        )}
      </div>

      {/* Primary Sub-Navigation Segmented Tabs */}
      <div className="max-w-6xl mx-auto px-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <nav className="flex gap-1 py-1" id="nav-tabs">
          <button
            id="tab-practice"
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "practice"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Practice Arena
            <span className="bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {questionCount}
            </span>
          </button>

          <button
            id="tab-syllabus"
            onClick={() => setActiveTab("syllabus")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "syllabus"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Syllabus Explorer
          </button>

          <button
            id="tab-custom"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "custom"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Custom MCQ
          </button>
        </nav>

        {/* Small badge displaying current selection on mobile */}
        <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
          {selectedCert} • {selectedLevel}
        </div>
      </div>
    </header>
  );
}
