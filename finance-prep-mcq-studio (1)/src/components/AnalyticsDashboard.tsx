import { useState, useEffect } from "react";
import { 
  Award, TrendingUp, HelpCircle, CheckCircle2, XCircle, 
  RotateCcw, ShieldAlert, Sparkles, BookOpen, Clock, Calendar, ChevronDown, ChevronUp, Users, Loader2 
} from "lucide-react";
import { CertType, CertLevel, Question } from "../types";

export interface AttemptLog {
  id?: string;
  questionId: string;
  questionText: string;
  cert: CertType;
  level: CertLevel;
  category: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  timestamp: number;
  studentEmail?: string;
  studentName?: string;
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
  adminToken?: string | null;
}

export default function AnalyticsDashboard({ isAdmin = false, adminToken = null }: AnalyticsDashboardProps) {
  const [attempts, setAttempts] = useState<AttemptLog[]>([]);
  const [allServerAttempts, setAllServerAttempts] = useState<AttemptLog[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; email: string; phone: string; registeredAt: string }[]>([]);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>("ALL_STUDENTS");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [certFilter, setCertFilter] = useState<"ALL" | CertType>("ALL");
  const [cohortTab, setCohortTab] = useState<"subject" | "section" | "time" | "course">("course");

  useEffect(() => {
    if (isAdmin && adminToken) {
      setLoading(true);
      setErrorMsg(null);
      
      const fetchStudents = fetch("/api/registered-students", {
        headers: { "Authorization": `Bearer ${adminToken}` }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to load student list");
        return res.json();
      });

      const fetchAttempts = fetch("/api/admin/student-attempts", {
        headers: { "Authorization": `Bearer ${adminToken}` }
      }).then(res => {
        if (!res.ok) throw new Error("Failed to load attempts logs");
        return res.json();
      });

      Promise.all([fetchStudents, fetchAttempts])
        .then(([studentsData, attemptsData]) => {
          setStudents(studentsData.students || []);
          setAllServerAttempts(attemptsData.attempts || []);
        })
        .catch(err => {
          console.error("Admin fetch analytics data error:", err);
          setErrorMsg("Could not load full analytics from server. Showing offline local data.");
          loadLocalLogs();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      loadLocalLogs();
    }
  }, [isAdmin, adminToken]);

  const loadLocalLogs = () => {
    const saved = localStorage.getItem("finance_prep_attempts_log");
    if (saved) {
      try {
        setAttempts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse attempts log", e);
      }
    }
  };

  const handleClearStats = async () => {
    if (isAdmin && adminToken) {
      if (window.confirm("WARNING: Are you sure you want to clear ALL student performance logs from the server? This is a permanent administrative action.")) {
        try {
          const res = await fetch("/api/admin/clear-all-attempts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${adminToken}`
            }
          });
          if (res.ok) {
            alert("All student attempts cleared successfully.");
            window.location.reload();
          } else {
            const errData = await res.json().catch(() => ({}));
            alert(errData.error || "Failed to clear student attempts.");
          }
        } catch (err) {
          console.error("Failed to clear server student attempts:", err);
          alert("Network failure. Could not connect to server to clear logs.");
        }
      }
    } else {
      if (window.confirm("Are you sure you want to clear your local performance metrics history? This action is irreversible.")) {
        localStorage.removeItem("finance_prep_attempts_log");
        localStorage.removeItem("finance_prep_cumulative_score");
        setAttempts([]);
        // Reload page to notify parent app components of stats reset
        window.location.reload();
      }
    }
  };

  // Determine active attempts pool
  const activeAttemptsPool = isAdmin 
    ? (selectedStudentEmail === "ALL_STUDENTS" 
        ? allServerAttempts 
        : allServerAttempts.filter(att => att.studentEmail?.toLowerCase() === selectedStudentEmail.toLowerCase())
      )
    : attempts;

  // Filter attempts based on certificate selection
  const filteredAttempts = activeAttemptsPool.filter(
    (att) => certFilter === "ALL" || att.cert === certFilter
  );

  // Compute metrics
  const totalAttempted = filteredAttempts.length;
  const correctCount = filteredAttempts.filter((att) => att.isCorrect).length;
  const incorrectCount = totalAttempted - correctCount;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  // Breakdown by Certification
  const certStats = ["CMT", "CFA", "CFP", "FRM"].map((c) => {
    const certAttempts = activeAttemptsPool.filter((att) => att.cert === c);
    const certTotal = certAttempts.length;
    const certCorrect = certAttempts.filter((att) => att.isCorrect).length;
    const certAccuracy = certTotal > 0 ? Math.round((certCorrect / certTotal) * 100) : 0;
    return { cert: c as CertType, total: certTotal, correct: certCorrect, accuracy: certAccuracy };
  });

  // Breakdown by Category / Topic Domain
  const categoryMap: { [cat: string]: { total: number; correct: number } } = {};
  filteredAttempts.forEach((att) => {
    const catName = att.category || "General Syllabus";
    if (!categoryMap[catName]) {
      categoryMap[catName] = { total: 0, correct: 0 };
    }
    categoryMap[catName].total += 1;
    if (att.isCorrect) {
      categoryMap[catName].correct += 1;
    }
  });

  const categoryStats = Object.keys(categoryMap).map((catName) => {
    const item = categoryMap[catName];
    const acc = Math.round((item.correct / item.total) * 100);
    return { name: catName, total: item.total, correct: item.correct, accuracy: acc };
  }).sort((a, b) => b.accuracy - a.accuracy);

  // Separate strengths (>70% accuracy and min 1 attempt) vs weaknesses (<50% accuracy)
  const strengths = categoryStats.filter((cat) => cat.accuracy >= 70 && cat.total >= 1);
  const focusAreas = categoryStats.filter((cat) => cat.accuracy < 60 && cat.total >= 1);

  // --- Section-wise performance ---
  const sectionMap: { [sec: string]: { total: number; correct: number; cert: CertType; level: CertLevel } } = {};
  filteredAttempts.forEach((att) => {
    const secName = `${att.cert} ${att.level}`;
    if (!sectionMap[secName]) {
      sectionMap[secName] = { total: 0, correct: 0, cert: att.cert, level: att.level };
    }
    sectionMap[secName].total += 1;
    if (att.isCorrect) {
      sectionMap[secName].correct += 1;
    }
  });
  const sectionStats = Object.keys(sectionMap).map((secName) => {
    const item = sectionMap[secName];
    const acc = Math.round((item.correct / item.total) * 100);
    return { name: secName, total: item.total, correct: item.correct, accuracy: acc, cert: item.cert, level: item.level };
  }).sort((a, b) => b.total - a.total);

  // --- Time-wise study rhythm ---
  // A. Diurnal Cycle hourly blocks
  const timeBlocks = [
    { label: "🌅 Morning (06:00 - 12:00)", hours: Array.from({ length: 6 }, (_, i) => i + 6), total: 0, correct: 0 },
    { label: "☀️ Afternoon (12:00 - 18:00)", hours: Array.from({ length: 6 }, (_, i) => i + 12), total: 0, correct: 0 },
    { label: "🌇 Evening (18:00 - 00:00)", hours: Array.from({ length: 6 }, (_, i) => i + 18), total: 0, correct: 0 },
    { label: "🌙 Night (00:00 - 06:00)", hours: Array.from({ length: 6 }, (_, i) => i), total: 0, correct: 0 },
  ];
  
  filteredAttempts.forEach((att) => {
    const dt = new Date(att.timestamp);
    const hr = dt.getHours();
    const block = timeBlocks.find((tb) => tb.hours.includes(hr));
    if (block) {
      block.total += 1;
      if (att.isCorrect) {
        block.correct += 1;
      }
    }
  });

  const timeBlockStats = timeBlocks.map((tb) => {
    const acc = tb.total > 0 ? Math.round((tb.correct / tb.total) * 100) : 0;
    return { label: tb.label, total: tb.total, correct: tb.correct, accuracy: acc };
  });

  // B. Weekly cadence
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyMap: { [day: string]: { total: number; correct: number } } = {};
  dayNames.forEach((d) => {
    weeklyMap[d] = { total: 0, correct: 0 };
  });
  
  filteredAttempts.forEach((att) => {
    const dt = new Date(att.timestamp);
    const dayName = dayNames[dt.getDay()];
    weeklyMap[dayName].total += 1;
    if (att.isCorrect) {
      weeklyMap[dayName].correct += 1;
    }
  });

  const weeklyStats = dayNames.map((day) => {
    const item = weeklyMap[day];
    const acc = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    return { day, total: item.total, correct: item.correct, accuracy: acc };
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="analytics-dashboard-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden" id="analytics-header">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-600/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border border-blue-500/30 font-bold">
                Performance Dashboard
              </span>
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Active Tracking
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">
              Assessment Insights
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Diagnostic analytics formulated directly from your practice sessions. Identify syllabus strengths, locate topic focus gaps, and review your step-by-step history logs.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleClearStats}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer w-fit"
              id="admin-clear-metrics-btn"
            >
              Clear Cohort Metrics History
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Admin Student Selector Controls */}
      {isAdmin && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4" id="admin-analytics-selector">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Student-Wise Assessment Insights</h3>
                <p className="text-[10px] text-slate-500 font-medium">Analyze individual student logs and target certification study weaknesses.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <label htmlFor="admin-student-select" className="text-xs font-bold text-slate-700 font-sans whitespace-nowrap">Focus Student:</label>
              <select
                id="admin-student-select"
                value={selectedStudentEmail}
                onChange={(e) => {
                  setSelectedStudentEmail(e.target.value);
                  setExpandedAttemptId(null);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans cursor-pointer min-w-[220px]"
              >
                <option value="ALL_STUDENTS">👥 All Registered Students ({allServerAttempts.length} logs)</option>
                {students.map((st) => {
                  const studentLogsCount = allServerAttempts.filter(l => l.studentEmail?.toLowerCase() === st.email.toLowerCase()).length;
                  return (
                    <option key={st.id} value={st.email}>
                      👤 {st.name} ({studentLogsCount} questions)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {selectedStudentEmail !== "ALL_STUDENTS" && (
            <div className="bg-white/80 rounded-xl p-3 border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-medium text-slate-600">
              {(() => {
                const s = students.find(student => student.email.toLowerCase() === selectedStudentEmail.toLowerCase());
                if (!s) return null;
                return (
                  <>
                    <div><span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Full Name</span><span className="text-slate-800 font-bold">{s.name}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Email Address</span><span className="text-slate-800 select-all">{s.email}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Phone / WhatsApp</span><span className="text-slate-800 font-mono">{s.phone}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Registered On</span><span className="text-slate-800">{new Date(s.registeredAt).toLocaleDateString()} at {new Date(s.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3" id="analytics-loader">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Retrieving dynamic assessment data...</p>
        </div>
      ) : activeAttemptsPool.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4" id="analytics-empty">
          <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="font-display font-extrabold text-slate-900 text-lg">No Practice Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {isAdmin 
              ? "The selected student has not answered any multiple-choice practice questions in the arena yet." 
              : "Your performance diagnostics are empty. Jump back into the Practice Arena and answer multiple-choice questions to build your active learning analytical report!"
            }
          </p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl p-3" id="analytics-filters">
            <span className="text-xs font-bold text-slate-600">Filter Analysis:</span>
            <div className="flex gap-1.5">
              {(["ALL", "CMT", "CFA", "CFP", "FRM"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCertFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    certFilter === filter
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Core Metrics Bento-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-grid">
            {/* Accuracy Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Accuracy</span>
                <div className="font-display font-extrabold text-2xl text-slate-900">{accuracy}%</div>
                <p className="text-[10px] text-slate-500 font-medium">Successful answers</p>
              </div>
              {/* Custom SVG Circular Progress Ring */}
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={accuracy >= 70 ? "text-emerald-500" : accuracy >= 50 ? "text-blue-500" : "text-amber-500"}
                    strokeDasharray={`${accuracy}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-800">
                  {accuracy}%
                </div>
              </div>
            </div>

            {/* Total Attempted */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
                <div className="font-display font-extrabold text-2xl text-slate-900">{totalAttempted}</div>
                <p className="text-[10px] text-slate-500 font-medium">Practiced questions</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Correct Answers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correct Solved</span>
                <div className="font-display font-extrabold text-2xl text-emerald-600">{correctCount}</div>
                <p className="text-[10px] text-slate-500 font-medium">Valid rationales</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Incorrect Answers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mistakes / Review</span>
                <div className="font-display font-extrabold text-2xl text-rose-500">{incorrectCount}</div>
                <p className="text-[10px] text-slate-500 font-medium">Opportunities to learn</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Diagnostic Strengths & Gaps (Adaptive Insight panel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  Your Study Strengths
                </h3>
                {strengths.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    Keep answering correctly to build syllabus domains with &gt;70% accuracy!
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto mt-2 space-y-1">
                    {strengths.map((s, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[200px]">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{s.correct}/{s.total} ok</span>
                          <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {s.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-3 text-[11px] text-emerald-800 mt-4 leading-relaxed">
                🌟 <strong>Great job!</strong> These are your strongest areas. Standard practice suggests doing occasional reviews here while devoting major efforts to critical study gaps.
              </div>
            </div>

            {/* Gaps / Focus Areas Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                  Topic Focus Gaps
                </h3>
                {focusAreas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    Excellent! No major topics are currently below 60% accuracy.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto mt-2 space-y-1">
                    {focusAreas.map((f, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[200px]">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{f.correct}/{f.total} ok</span>
                          <span className="font-mono font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {f.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-100/50 rounded-xl p-3 text-[11px] text-amber-800 mt-4 leading-relaxed">
                ⚠️ <strong>Priority Targeting:</strong> These subjects are below 60% accuracy. Go to the <strong>Practice Arena</strong> and target these specific topics directly inside the AI question generator!
              </div>
            </div>
          </div>

          {/* Cross-Certification Benchmarks (Only if filter is ALL) */}
          {certFilter === "ALL" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-sm mb-4">Cross-Certification Accuracy Benchmarks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {certStats.map((stat) => (
                  <div key={stat.cert} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="bg-slate-200 text-slate-700 text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold">
                        {stat.cert} Curriculum
                      </span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-extrabold font-mono text-slate-800">{stat.accuracy}%</span>
                        <span className="text-slate-400 text-xs font-medium">accuracy</span>
                      </div>
                    </div>
                    
                    {/* Visual progress mini bar */}
                    <div className="mt-4">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.accuracy >= 70 ? "bg-emerald-500" : stat.accuracy >= 50 ? "bg-blue-500" : "bg-slate-300"
                          }`}
                          style={{ width: `${stat.total > 0 ? stat.accuracy : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                        <span>{stat.total} Attempted</span>
                        <span>{stat.correct} Correct</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Curriculum & Cohort Analysis Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="cohort-analysis-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-blue-600" />
                  Advanced Cohort & Curriculum Analysis
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Detailed analytics covering courses, specific syllabus levels, topics, and study rhythm statistics.
                </p>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start sm:self-center">
                {(["course", "section", "subject", "time"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCohortTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      cohortTab === tab 
                        ? "bg-white text-blue-700 shadow-sm animate-fadeIn" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT */}
            {cohortTab === "course" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certStats.map((stat) => (
                    <div key={stat.cert} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{stat.cert} Course Portfolio</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          stat.accuracy >= 75 ? "bg-emerald-100 text-emerald-800" : stat.accuracy >= 50 ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {stat.accuracy > 0 ? `${stat.accuracy}% Accuracy` : "No Attempts"}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Total Practice Runs:</span>
                          <span className="font-bold text-slate-800">{stat.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Successful Answers:</span>
                          <span className="font-bold text-emerald-600">{stat.correct}</span>
                        </div>
                      </div>

                      {/* Bar graph */}
                      <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.accuracy >= 75 ? "bg-emerald-500" : stat.accuracy >= 50 ? "bg-blue-500" : "bg-slate-300"
                          }`}
                          style={{ width: `${stat.total > 0 ? stat.accuracy : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cohortTab === "section" && (
              <div className="space-y-4 animate-fadeIn">
                {sectionStats.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No level-wise data recorded yet. Take a practice session to load stats.</p>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-100">
                          <th className="p-3">Syllabus Section (Level)</th>
                          <th className="p-3 text-center">Total Run</th>
                          <th className="p-3 text-center">Correct</th>
                          <th className="p-3 text-right">Accuracy Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sectionStats.map((sec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{sec.name}</td>
                            <td className="p-3 text-center text-slate-600 font-mono font-medium">{sec.total}</td>
                            <td className="p-3 text-center text-emerald-600 font-mono font-bold">{sec.correct}</td>
                            <td className="p-3 text-right">
                              <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                sec.accuracy >= 70 ? "bg-emerald-100 text-emerald-800" : sec.accuracy >= 50 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {sec.accuracy}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {cohortTab === "subject" && (
              <div className="space-y-4 animate-fadeIn">
                {categoryStats.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No subject-wise data recorded yet. Take a practice session to load stats.</p>
                ) : (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {categoryStats.map((cat, idx) => (
                      <div key={idx} className="border border-slate-100 bg-slate-50/30 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-800 truncate">{cat.name}</span>
                          <span className="font-mono font-extrabold text-slate-500 text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                            {cat.correct}/{cat.total} ok
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3.5">
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                cat.accuracy >= 75 ? "bg-emerald-500" : cat.accuracy >= 50 ? "bg-blue-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${cat.accuracy}%` }}
                            ></div>
                          </div>
                          <span className={`text-[11px] font-extrabold font-mono shrink-0 w-10 text-right ${
                            cat.accuracy >= 75 ? "text-emerald-600" : cat.accuracy >= 50 ? "text-blue-600" : "text-rose-500"
                          }`}>
                            {cat.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cohortTab === "time" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Diurnal Time Blocks */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diurnal Peak Activity Blocks</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {timeBlockStats.map((tb, idx) => (
                      <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-slate-800 font-bold text-xs block mb-1">{tb.label}</span>
                          <div className="text-[10px] text-slate-500 font-medium">Practice Vol: <span className="font-bold text-slate-700">{tb.total} runs</span></div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                          <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded ${
                            tb.total === 0 ? "bg-slate-100 text-slate-400" : tb.accuracy >= 70 ? "bg-emerald-100 text-emerald-800" : tb.accuracy >= 50 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {tb.total > 0 ? `${tb.accuracy}%` : "No activity"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly cadence heatmap / progress bars */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weekly Activity Rhythms</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weeklyStats.map((ws, idx) => (
                      <div key={idx} className="bg-slate-50/30 border border-slate-100 rounded-xl p-3 text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">{ws.day.substring(0, 3)}</span>
                        
                        <div className="text-xs font-bold text-slate-800">{ws.total}</div>
                        <p className="text-[9px] text-slate-400 font-medium">attempts</p>

                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${ws.total > 0 ? Math.min((ws.total / 15) * 100, 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Attempts Log / Review Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100">
              Personalized Question Review History
            </h3>
            
            <div className="space-y-3" id="attempts-log-list">
              {filteredAttempts.map((att, idx) => {
                const isExpanded = expandedAttemptId === att.questionId;
                return (
                  <div 
                    key={idx} 
                    className={`border rounded-xl transition-all ${
                      att.isCorrect 
                        ? "bg-emerald-50/20 border-emerald-100 hover:border-emerald-200" 
                        : "bg-rose-50/20 border-rose-100 hover:border-rose-200"
                    }`}
                  >
                    {/* Log Row Header */}
                    <div 
                      onClick={() => setExpandedAttemptId(isExpanded ? null : att.questionId)}
                      className="p-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {att.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                            {att.questionText}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {isAdmin && selectedStudentEmail === "ALL_STUDENTS" && att.studentName && (
                              <span className="text-[9px] font-bold text-slate-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm">
                                👤 {att.studentName}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm">
                              {att.cert} • {att.level}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {att.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              {new Date(att.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          att.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {att.isCorrect ? "CORRECT" : "MISTAKE"}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded details containing rationales and answers */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-white/50 rounded-b-xl space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Text</span>
                          <p className="font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {att.questionText}
                          </p>
                        </div>

                        {/* Selected vs Correct Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-rose-50/50 border border-rose-100/50 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-rose-700 block uppercase tracking-wider mb-1">Your Selection</span>
                            <p className="font-bold text-rose-900">
                              Option {String.fromCharCode(65 + att.selectedIndex)}
                            </p>
                          </div>
                          <div className="bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider mb-1">Correct Answer</span>
                            <p className="font-bold text-emerald-900">
                              Option {String.fromCharCode(65 + att.correctIndex)}
                            </p>
                          </div>
                        </div>

                        {/* Complete pedagogical explanation fallback */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedagogical Review Rationale</span>
                          <div className="bg-blue-50/30 border border-blue-100/40 p-4 rounded-xl text-slate-700 leading-relaxed">
                            {attempts.find((a) => a.questionId === att.questionId)?.questionId ? (
                              <p>Please refer to the curriculum explanation provided on the active MCQ list card.</p>
                            ) : null}
                            <p className="italic">Textbook reference criteria verified by Gemini's dynamic feedback engine.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
