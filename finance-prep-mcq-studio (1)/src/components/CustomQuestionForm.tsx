import { useState } from "react";
import { 
  PlusCircle, 
  HelpCircle, 
  Check, 
  Eye, 
  AlertCircle, 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Sparkles, 
  Layers, 
  Trash2, 
  BookOpen 
} from "lucide-react";
import { CertType, CertLevel, Question } from "../types";

interface CustomQuestionFormProps {
  currentCert: CertType;
  currentLevel: CertLevel;
  onAddQuestion: (question: Question) => void;
  onAddBatchQuestions?: (questions: Question[]) => void;
}

const CURATED_MOCK_PACKS: Record<string, Array<{
  name: string;
  topic: string;
  questions: Omit<Question, "id" | "cert" | "level">[];
}>> = {
  "CFA-Level 1": [
    {
      name: "Ethics & Professional Standards Booster Pack",
      topic: "Ethics",
      questions: [
        {
          text: "An analyst receives an invitation from a client to attend a football match at the client's expense as a thank you for a successful quarter. Under the Standards of Professional Conduct, is the analyst permitted to accept?",
          options: [
            "Yes, provided she obtains written consent from her employer before attending if possible, or discloses it afterwards.",
            "Yes, without disclosure, as it is a standard business entertainment practice and has a minor value.",
            "No, because accepting any gift from a client compromises independent objectivity.",
            "No, unless the client is an immediate family member."
          ],
          correctAnswerIndex: 0,
          explanation: "According to Standard I(B) Independence and Objectivity, gifts from clients are permissible if disclosed and approved by the employer, as they are less likely to compromise objectivity than gifts from third-party brokerages seeking business.",
          category: "Ethics & Standards"
        },
        {
          text: "Which of the following is a GIPS (Global Investment Performance Standards) requirement regarding composite construction?",
          options: [
            "All actual, fee-paying, discretionary portfolios must be included in at least one composite.",
            "Non-discretionary portfolios must be included in composites.",
            "Composites must include mock or simulated portfolios to show historic potential.",
            "Portfolios must be removed from composites immediately if performance drops below average."
          ],
          correctAnswerIndex: 0,
          explanation: "Under GIPS, all actual, fee-paying, discretionary portfolios must be included in at least one composite to prevent cherry-picking of only top-performing accounts.",
          category: "Ethics & Standards"
        }
      ]
    },
    {
      name: "Financial Statement Analysis (FSA) Core Pack",
      topic: "FSA",
      questions: [
        {
          text: "A company changes its inventory valuation method from LIFO to FIFO in a period of steadily rising prices. Which of the following financial statement impacts is most likely?",
          options: [
            "An increase in ending inventory and a decrease in cost of goods sold (COGS).",
            "A decrease in ending inventory and an increase in cost of goods sold (COGS).",
            "An increase in cost of goods sold (COGS) and a decrease in net income.",
            "No impact on either ending inventory or cost of goods sold."
          ],
          correctAnswerIndex: 0,
          explanation: "In rising prices, FIFO assigns the older, lower costs to COGS (decreasing COGS) and the newer, higher costs to ending inventory (increasing ending inventory). This leads to higher reported profits.",
          category: "Financial Statement Analysis"
        },
        {
          text: "Which of the following is considered an operating cash flow under US GAAP but can be operating or financing under IFRS?",
          options: [
            "Interest paid",
            "Interest received",
            "Dividends received",
            "Dividends paid"
          ],
          correctAnswerIndex: 0,
          explanation: "Under US GAAP, interest paid is strictly classified as an operating cash flow. Under IFRS, interest paid can be classified as either operating or financing cash flows.",
          category: "Financial Statement Analysis"
        }
      ]
    }
  ],
  "CFA-Level 2": [
    {
      name: "FSA & Valuation Vignette Mock Pack",
      topic: "Valuation",
      questions: [
        {
          text: "A company acquires a 35% stake in another firm and exercises significant influence. Under IFRS, how should this investment be accounted for on the balance sheet?",
          options: [
            "Equity method, where the investment is initially recorded at cost and adjusted for the post-acquisition share of profits.",
            "Consolidation method, combining all assets and liabilities line-by-line.",
            "Fair value through profit or loss (FVTPL) at market prices.",
            "Amortized cost with annual impairment testing."
          ],
          correctAnswerIndex: 0,
          explanation: "An ownership interest between 20% and 50% usually signifies significant influence, which mandates the use of the equity method of accounting on the parent company's balance sheet.",
          category: "Financial Statement Analysis"
        }
      ]
    }
  ],
  "FRM-Level 1": [
    {
      name: "Risk Valuation & Credit Metrics Pack",
      topic: "Risk Models",
      questions: [
        {
          text: "If a financial institution's 1-day Value at Risk (VaR) is $10 million at a 99% confidence level, what does this state?",
          options: [
            "There is a 1% probability that the daily loss will exceed $10 million.",
            "The firm is guaranteed to lose exactly $10 million on 1% of the trading days.",
            "The expected loss on any typical bad day is exactly $10 million.",
            "There is a 99% probability that the daily loss will exceed $10 million."
          ],
          correctAnswerIndex: 0,
          explanation: "A 99% confidence VaR of $10 million means that there is a 1% chance (the tail probability) that the realized loss over a single day will be greater than $10 million.",
          category: "Valuation & Risk Models"
        }
      ]
    }
  ],
  "CFP-Level 1": [
    {
      name: "Fiduciary Standards & Estate Planning Pack",
      topic: "Fiduciary",
      questions: [
        {
          text: "Under the CFP Board's Code of Ethics and Standards of Conduct, when is a CFP professional required to act as a fiduciary?",
          options: [
            "At all times when providing Financial Advice to a Client.",
            "Only when actively managing a client's discretionary trading account.",
            "Only if specified in the written engagement contract.",
            "Only when recommending life insurance or annuity policies."
          ],
          correctAnswerIndex: 0,
          explanation: "The CFP Board Fiduciary Duty standard applies at all times when providing Financial Advice, requiring the CFP professional to act in the best interest of the client.",
          category: "Professional Conduct & Ethics"
        }
      ]
    }
  ],
  "CMT-Level 1": [
    {
      name: "Trend Indicators & Oscillators Booster Pack",
      topic: "Oscillators",
      questions: [
        {
          text: "Which of the following momentum oscillators is bounded between 0 and 100, and is typically considered overbought when it crosses above 70?",
          options: [
            "Relative Strength Index (RSI)",
            "Moving Average Convergence Divergence (MACD)",
            "Simple Moving Average (SMA)",
            "On-Balance Volume (OBV)"
          ],
          correctAnswerIndex: 0,
          explanation: "The Relative Strength Index (RSI) is a bounded oscillator running between 0 and 100. Traditionally, RSI values above 70 indicate overbought conditions, while values below 30 indicate oversold conditions.",
          category: "Technical Indicators"
        }
      ]
    }
  ]
};

const GENERAL_FINANCE_MOCK_PACKS = [
  {
    name: "Quantitative Methods & Portfolio Risk Pack",
    topic: "Quant",
    questions: [
      {
        text: "What does a high Sharpe Ratio indicate about a portfolio's performance?",
        options: [
          "The portfolio has delivered a high excess return per unit of total risk (standard deviation).",
          "The portfolio has high unsystematic risk which cannot be diversified.",
          "The portfolio has underperformed a risk-free cash deposit.",
          "The portfolio is heavily leveraged with junk-grade debt instruments."
        ],
        correctAnswerIndex: 0,
        explanation: "The Sharpe Ratio measures the excess return (above risk-free rate) per unit of total risk (standard deviation). A higher Sharpe ratio represents superior risk-adjusted return.",
        category: "Portfolio Risk Management"
      },
      {
        text: "According to the Capital Asset Pricing Model (CAPM), what is the beta of the overall market portfolio?",
        options: [
          "Exactly 1.0",
          "Exactly 0.0",
          "Dependent on the prevailing federal funds rate",
          "Variable between -1.0 and 0.0 depending on macroeconomic indicators"
        ],
        correctAnswerIndex: 0,
        explanation: "By definition, the beta of the market portfolio is exactly 1.0, representing the baseline systematic risk of the market.",
        category: "Investment Theory"
      }
    ]
  }
];

export default function CustomQuestionForm({
  currentCert,
  currentLevel,
  onAddQuestion,
  onAddBatchQuestions,
}: CustomQuestionFormProps) {
  // Dual Tab state
  const [activeSubTab, setActiveSubTab] = useState<"single" | "bulk">("single");

  // Single Question Form State
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [category, setCategory] = useState("");
  const [cert, setCert] = useState<CertType>(currentCert);
  const [level, setLevel] = useState<CertLevel>(currentLevel);

  // Bulk Import State
  const [bulkText, setBulkText] = useState("");
  const [importFormat, setImportFormat] = useState<"delimited" | "json">("delimited");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync state if selections change globally
  useState(() => {
    setCert(currentCert);
    setLevel(currentLevel);
  });

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const resetForm = () => {
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setExplanation("");
    setCategory("");
    setNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!text.trim()) {
      setNotification({ type: "error", message: "Please enter the question text." });
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setNotification({ type: "error", message: "Please fill out all 4 option slots." });
      return;
    }
    if (!category.trim()) {
      setNotification({ type: "error", message: "Please specify a category / syllabus topic." });
      return;
    }
    if (!explanation.trim()) {
      setNotification({ type: "error", message: "Please add an explanation for students." });
      return;
    }

    const newQuestion: Question = {
      id: `custom-${cert}-${level.replace(/\s+/g, "")}-${Date.now()}`,
      text: text.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex,
      explanation: explanation.trim(),
      category: category.trim(),
      cert,
      level,
      isCustom: true,
    };

    onAddQuestion(newQuestion);
    setNotification({
      type: "success",
      message: `Successfully added your custom question to ${cert} ${level}!`,
    });

    // Reset inputs but keep context
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setExplanation("");
    setCategory("");
  };

  // Quick seed button to populate mock finance questions so users have a fast playground
  const handleQuickSeed = () => {
    const sampleText = cert === "CMT" 
      ? "Which classical chart pattern is considered a bearish reversal pattern after a prolonged uptrend, verified by diminishing volume on the pattern peaks?"
      : cert === "CFA"
      ? "Under the CFA Institute Code of Ethics and Standards of Professional Conduct, if a Member suspects a colleague is violating securities law, what is the recommended first course of action?"
      : "Under the rules for CFP Professional Standards of Conduct, which of the following is most accurate regarding a planner's fiduciary obligation?";

    const sampleOptions = cert === "CMT"
      ? ["Double Top", "Ascending Triangle", "Bull Flag", "Inverse Head and Shoulders"]
      : cert === "CFA"
      ? ["Dissociate from the activity and report to the firm's compliance officer", "Report immediately to regulatory authorities", "Keep silent unless sub-poenaed", "Confront the colleague directly"]
      : ["It applies at all times when providing financial advice", "It only applies when managing discretionary assets", "It is optional depending on the client agreement", "It applies only to stock transactions"];

    const sampleExplanation = cert === "CMT"
      ? "A Double Top consists of two peaks with roughly similar heights, indicating resistance. Declining volume on the peaks followed by an increase on the breakdown of the confirmation line (trough) confirms the bearish reversal."
      : cert === "CFA"
      ? "Standard I(A) Knowledge of the Law states that when a member suspects or knows of illegal activity, they must dissociate from it and report to compliance. Regulatory reporting is not immediately mandated by the standard unless required by local law."
      : "The CFP Board Fiduciary Duty standard mandates that a CFP professional must act as a fiduciary at all times when providing financial advice to a client, prioritizing client interests above all.";

    const sampleCategory = cert === "CMT" ? "Chart Analysis" : cert === "CFA" ? "Ethics & Standards" : "Professional Conduct";

    setText(sampleText);
    setOptions(sampleOptions);
    setCorrectAnswerIndex(0);
    setExplanation(sampleExplanation);
    setCategory(sampleCategory);
    setNotification(null);
  };

  // Pre-packaged Curated Mock Pack direct importer
  const handleImportCuratedPack = (packQuestions: Omit<Question, "id" | "cert" | "level">[]) => {
    const prepared: Question[] = packQuestions.map((q, idx) => ({
      ...q,
      id: `imported-${cert}-${level.replace(/\s+/g, "")}-${idx}-${Date.now()}`,
      cert,
      level,
      isCustom: true
    }));

    if (onAddBatchQuestions) {
      onAddBatchQuestions(prepared);
    } else {
      prepared.forEach(onAddQuestion);
    }

    setNotification({
      type: "success",
      message: `Successfully imported ${prepared.length} verified premium questions directly into ${cert} ${level}!`
    });
  };

  // Raw copy-paste parsing algorithm
  const handleParseAndImportBulk = () => {
    if (!bulkText.trim()) {
      setNotification({ type: "error", message: "Please paste your custom MCQ data first." });
      return;
    }

    const importedQuestions: Question[] = [];

    if (importFormat === "json") {
      try {
        const parsed = JSON.parse(bulkText);
        const list = Array.isArray(parsed) ? parsed : [parsed];

        list.forEach((item: any, idx: number) => {
          if (!item.text || !Array.isArray(item.options) || item.options.length < 2) {
            throw new Error(`Item at position ${idx} is missing required fields (text or options).`);
          }

          // Pad options if less than 4
          let finalOpts = [...item.options];
          while (finalOpts.length < 4) {
            finalOpts.push(`Option ${String.fromCharCode(65 + finalOpts.length)}`);
          }
          if (finalOpts.length > 4) {
            finalOpts = finalOpts.slice(0, 4);
          }

          importedQuestions.push({
            id: `bulk-json-${cert}-${level.replace(/\s+/g, "")}-${idx}-${Date.now()}`,
            text: String(item.text).trim(),
            options: finalOpts.map((o) => String(o).trim()),
            correctAnswerIndex: typeof item.correctAnswerIndex === "number" ? item.correctAnswerIndex : 0,
            explanation: item.explanation ? String(item.explanation).trim() : "Textbook review rationale.",
            category: item.category ? String(item.category).trim() : "General Syllabus",
            cert,
            level,
            isCustom: true
          });
        });
      } catch (err: any) {
        setNotification({
          type: "error",
          message: `JSON Parsing Failed: ${err.message}. Ensure your structure matches the sample exactly.`
        });
        return;
      }
    } else {
      // Delimited parsing
      const lines = bulkText.split("\n");
      let parsedCount = 0;

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return; // skip blank lines

        // Split by pipeline or tab
        const parts = trimmed.includes("|") ? trimmed.split("|") : trimmed.split("\t");
        
        if (parts.length >= 2) {
          const rawText = parts[0]?.trim();
          const optA = parts[1]?.trim() || "Option A";
          const optB = parts[2]?.trim() || "Option B";
          const optC = parts[3]?.trim() || "Option C";
          const optD = parts[4]?.trim() || "Option D";
          
          let correctIdx = 0;
          if (parts[5]) {
            const parsedIdx = parseInt(parts[5].trim(), 10);
            if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < 4) {
              correctIdx = parsedIdx;
            }
          }

          const cat = parts[6]?.trim() || "Bulk Uploads";
          const exp = parts[7]?.trim() || "Directly imported question rationale.";

          importedQuestions.push({
            id: `bulk-delim-${cert}-${level.replace(/\s+/g, "")}-${idx}-${Date.now()}`,
            text: rawText,
            options: [optA, optB, optC, optD],
            correctAnswerIndex: correctIdx,
            explanation: exp,
            category: cat,
            cert,
            level,
            isCustom: true
          });
          parsedCount++;
        }
      });

      if (importedQuestions.length === 0) {
        setNotification({
          type: "error",
          message: "Could not parse any valid lines. Please use the pipe (|) delimiter or separate fields with a tab."
        });
        return;
      }
    }

    if (importedQuestions.length > 0) {
      if (onAddBatchQuestions) {
        onAddBatchQuestions(importedQuestions);
      } else {
        importedQuestions.forEach(onAddQuestion);
      }

      setNotification({
        type: "success",
        message: `Successfully parsed and directly imported ${importedQuestions.length} custom MCQs into your practice deck!`
      });
      setBulkText("");
    }
  };

  // Get active mock packs based on selected cert-level
  const activeKey = `${cert}-${level}`;
  const curatedPacks = CURATED_MOCK_PACKS[activeKey] || GENERAL_FINANCE_MOCK_PACKS;

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="custom-question-form-root">
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden" id="custom-intro">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Expand Practice Pool</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl font-medium">
              Augment your active study deck. You can either construct individual custom MCQs or instantly import batches of professional mock exam questions in a single click!
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickSeed}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Load Sample Question
          </button>
        </div>
      </div>

      {/* Segmented Sub-Tab Navigator */}
      <div className="flex border-b border-slate-200" id="custom-sub-tabs">
        <button
          onClick={() => {
            setActiveSubTab("single");
            setNotification(null);
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "single"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Add Single MCQ
        </button>
        <button
          onClick={() => {
            setActiveSubTab("bulk");
            setNotification(null);
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "bulk"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-500" />
          Direct Batch Import
        </button>
      </div>

      {notification && (
        <div
          id="form-notification"
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-xs font-bold">{notification.message}</p>
            {notification.type === "success" && (
              <p className="text-[10px] text-emerald-600 mt-1 font-bold uppercase tracking-wider">
                Head over to the <strong>Practice Arena</strong> to test it right now!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Target Certification Selector (Shared across both sub-tabs) */}
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Active Certification Program</label>
          <select
            id="custom-cert-select"
            value={cert}
            onChange={(e) => setCert(e.target.value as CertType)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="CMT">CMT (Chartered Market Technician)</option>
            <option value="CFA">CFA (Chartered Financial Analyst)</option>
            <option value="CFP">CFP (Certified Financial Planner)</option>
            <option value="FRM">FRM (Financial Risk Manager)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Target Exam Level</label>
          <select
            id="custom-level-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as CertLevel)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
          </select>
        </div>
      </div>

      {activeSubTab === "single" ? (
        /* SINGLE MCQ WRITER FORM */
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="add-mcq-form">
          {/* Category Domain */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Syllabus Topic Domain / Category</label>
            <input
              id="custom-category-input"
              type="text"
              placeholder="e.g. Portfolio Management, Chart Patterns, Ethical Principles"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Question Narrative</label>
            <textarea
              id="custom-text-input"
              rows={3}
              placeholder="Write the clear situation or theoretical scenario question here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 leading-relaxed bg-slate-50/50"
            />
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Answer Options (Exactly 4)</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 font-mono border border-slate-200/50">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  id={`custom-option-input-${idx}`}
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 bg-slate-50/50"
                />
                <button
                  type="button"
                  id={`custom-correct-btn-${idx}`}
                  onClick={() => setCorrectAnswerIndex(idx)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    correctAnswerIndex === idx
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200/60"
                  }`}
                  title="Mark as correct answer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Pedagogical Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Educational Explanation & Rationales</label>
            <textarea
              id="custom-explanation-input"
              rows={3}
              placeholder="Explain why the correct option is right, and summarize the relevant finance formula, principle, or textbook rule..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 leading-relaxed bg-slate-50/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              id="btn-form-clear"
              onClick={resetForm}
              className="px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Clear Fields
            </button>
            <button
              type="submit"
              id="btn-form-submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Save Practice MCQ
            </button>
          </div>
        </form>
      ) : (
        /* DIRECT BATCH IMPORT TAB */
        <div className="space-y-6" id="bulk-import-container">
          
          {/* OPTION 1: INSTANT BUNDLE IMPORTER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Option 1: Quick-Import Curated Mock Packs
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Verified Curriculums
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly seed your study arena with top-quality, expert-calibrated mock exam questions designed specifically for <strong>{cert} {level}</strong>. No typing required!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {curatedPacks.map((pack, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
                      {pack.topic}
                    </span>
                    <h4 className="font-display font-bold text-slate-800 text-xs mt-1.5 leading-snug">
                      {pack.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Contains {pack.questions.length} premium multiple-choice questions with complete rationales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImportCuratedPack(pack.questions)}
                    className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Import This Pack
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* OPTION 2: PASTE RAW BATCH TOOL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Option 2: Copy-Paste Bulk MCQ Importer
                </h3>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setImportFormat("delimited");
                    setBulkText(
                      `What is the main advantage of diversification in a portfolio? | It reduces unsystematic risk | It eliminates market systematic risk | It guarantees high capital gains | It converts bonds into equities | 0 | Portfolio Management | Diversification can virtually eliminate unsystematic risk while keeping systematic risk constant.\nHow is the current yield of a bond calculated? | Annual coupon payment divided by current market price | Coupon rate multiplied by par value | Total return divided by investment term | Face value divided by coupon rate | 0 | Fixed Income | Current yield is calculated by dividing the annual coupon payment by the bond's current market price.`
                    );
                    setNotification(null);
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                    importFormat === "delimited" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Use Delimited Sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportFormat("json");
                    setBulkText(
                      JSON.stringify([
                        {
                          "text": "Which of the following metrics acts as a primary gauge for a bank's capital adequacy?",
                          "options": ["Common Equity Tier 1 (CET1) Ratio", "Price to Earnings Ratio", "Dividend Payout Ratio", "Current Ratio"],
                          "correctAnswerIndex": 0,
                          "category": "Capital Adequacy",
                          "explanation": "The CET1 ratio measures a bank's core equity capital compared with its total risk-weighted assets, representing a primary metric for systemic solvency."
                        }
                      ], null, 2)
                    );
                    setNotification(null);
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                    importFormat === "json" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Use JSON Sample
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste your raw question datasets below. You can easily copy and paste columns directly from a spreadsheet (separated by tabs) or use the pipe delimiter (<code className="font-mono text-blue-600 bg-slate-100 px-1 py-0.5 rounded">|</code>).
            </p>

            {importFormat === "delimited" ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[10px] font-mono text-slate-600 leading-relaxed space-y-1">
                <span className="font-bold text-slate-700 block mb-1">Delimited Row Standard Format:</span>
                <code>Question | Option A | Option B | Option C | Option D | Correct Index (0-3) | Topic | Explanation</code>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[10px] font-mono text-slate-600 leading-relaxed space-y-1">
                <span className="font-bold text-slate-700 block mb-1">JSON Array Standard Format:</span>
                <code>{"[ { \"text\": \"...\", \"options\": [\"A\",\"B\",\"C\",\"D\"], \"correctAnswerIndex\": 0, \"category\": \"...\", \"explanation\": \"...\" } ]"}</code>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Paste Data Block</label>
              <textarea
                rows={8}
                placeholder={
                  importFormat === "delimited"
                    ? "Paste your pipe-delimited lines or spreadsheet rows here..."
                    : "Paste your valid JSON array of questions here..."
                }
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 bg-slate-50/50 leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setBulkText("")}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Import Board
              </button>
              <button
                type="button"
                onClick={handleParseAndImportBulk}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Parse & Import Batch
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
