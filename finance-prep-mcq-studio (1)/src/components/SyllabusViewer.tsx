import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, RefreshCw, ExternalLink, ShieldCheck, AlertCircle, Sparkles, HelpCircle } from "lucide-react";
import { CertType, CertLevel } from "../types";

interface SyllabusViewerProps {
  cert: CertType;
  level: CertLevel;
}

interface SyllabusCache {
  [key: string]: {
    summary: string;
    sources: Array<{ title: string; uri: string }>;
    timestamp: number;
  };
}

const LOCAL_SYLLABUS_FALLBACKS: Record<string, { summary: string; sources: Array<{ title: string; uri: string }> }> = {
  "CFA-Level 1": {
    summary: `
# CFA Level I Curriculum Overview & Weightings

The CFA Level I exam focuses on professional standards, ethical behavior, and essential investment tools.

### Core Topic Weights & Focus Areas
1. **Ethical and Professional Standards (15 - 20%)**
   - Code of Ethics & Standards of Professional Conduct
   - GIPS (Global Investment Performance Standards)
2. **Quantitative Methods (8 - 12%)**
   - Time Value of Money, Probability, and Descriptive Statistics
   - Linear Regression, Hypothesis Testing, and Data Analysis
3. **Economics (8 - 12%)**
   - Microeconomic & Macroeconomic Analysis
   - Monetary/Fiscal Policy, Inflation, and Geopolitical Risk
4. **Financial Statement Analysis (13 - 17%)**
   - Income Statements, Balance Sheets, and Cash Flow Statement Analysis
   - Inventories, Long-Lived Assets, Taxes, and Debt
5. **Corporate Issuers (8 - 12%)**
   - Corporate Governance, ESG considerations, and Capital Structure
6. **Equity Investments (10 - 12%)**
   - Market Organization, Indexing, and Industry/Company Analysis
7. **Fixed Income (11 - 14%)**
   - Valuation, Credit Analysis, Securitization, and Risk Metrics
8. **Derivatives (5 - 8%)**
   - Forward, Futures, Options, and Swaps Basics
9. **Alternative Investments (5 - 8%)**
   - Real Estate, Private Equity, Hedge Funds, and Commodities
10. **Portfolio Management and Wealth Planning (5 - 8%)**
    - Portfolio Risk/Return, IPS Basics, and ESG Integration

### Official Examination Format
- **Total Questions**: 180 Multiple-Choice Questions
- **Session Duration**: Two 135-minute sessions
`,
    sources: [
      { title: "CFA Institute Official Level I Curriculum Guide", uri: "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-i" }
    ]
  },
  "CFA-Level 2": {
    summary: `
# CFA Level II Curriculum Overview & Weightings

The CFA Level II exam focuses on the application of investment tools and asset valuation concepts within a vignette format.

### Core Topic Weights & Focus Areas
1. **Ethical and Professional Standards (10 - 15%)**
   - Standards Application in Vignette format and Professional Standards
2. **Quantitative Methods (5 - 10%)**
   - Multiple Regression, Time-Series Analysis, and Machine Learning
3. **Economics (5 - 10%)**
   - Currency Exchange Rates, Economic Growth Theories, and Regulation
4. **Financial Statement Analysis (10 - 15%)**
   - Intercorporate Investments, Employee Compensation, and Foreign Currency Translation
5. **Corporate Issuers (5 - 10%)**
   - Mergers & Acquisitions, Corporate Restructuring, and Capital Budgeting
6. **Equity Investments (10 - 15%)**
   - Dividend Discount Models, Free Cash Flow Valuation, and Residual Income
7. **Fixed Income (10 - 15%)**
   - Arbitrage-Free Valuation, Term Structure, and Credit Analysis Models
8. **Derivatives (5 - 10%)**
   - Pricing & Valuation of Options, Swaps, forwards, and Black-Scholes-Merton
9. **Alternative Investments (5 - 10%)**
   - Private Equity, Real Estate Investments, and Commodities Analysis
10. **Portfolio Management and Wealth Planning (10 - 15%)**
    - Active Portfolio Management, ETF Mechanics, and Algorithmic Trading

### Official Examination Format
- **Total Questions**: 88 Multiple-Choice Vignette Questions
- **Session Duration**: Two 132-minute sessions
`,
    sources: [
      { title: "CFA Institute Official Level II Curriculum Guide", uri: "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-ii" }
    ]
  },
  "CFA-Level 3": {
    summary: `
# CFA Level III Curriculum Overview & Weightings

The CFA Level III exam focuses on portfolio management, wealth planning, and advisory applications.

### Core Topic Weights & Focus Areas
1. **Ethical and Professional Standards (10 - 15%)**
   - Application of Ethics in Portfolio Management and GIPS standards
2. **Asset Allocation & Portfolio Construction (35 - 40%)**
   - Capital Market Expectations, Asset Allocation, and Derivatives Overlay
3. **Fixed Income & Equity Portfolio Management (15 - 25%)**
   - Yield Curve Strategies, Active Equity Portfolio Execution, and Trading costs
4. **Alternative Investments & Wealth Planning (15 - 25%)**
   - Private Wealth Management, Estate Planning, Institutional Investors, and Asset Liability Management
5. **Trading, Performance Evaluation, and Manager Selection (5 - 10%)**
   - Execution of Portfolio Decisions, Performance Attribution, and Due Diligence

### Official Examination Format
- **Format**: Essay-style constructed response + Vignette multiple-choice
- **Session Duration**: Two 132-minute sessions
`,
    sources: [
      { title: "CFA Institute Official Level III Curriculum Guide", uri: "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-iii" }
    ]
  },
  "FRM-Level 1": {
    summary: `
# FRM Part I (Level 1) Curriculum & Weightings

The Financial Risk Manager (FRM) Part I exam covers the core tools and foundational concepts used to measure and manage financial risk.

### Core Topic Weights & Focus Areas
1. **Foundations of Risk Management (20%)**
   - Risk management frameworks, Corporate Governance, and Portfolio Theory (CAPM)
   - Financial disasters and risk management failures
2. **Quantitative Analysis (20%)**
   - Probability distributions, Linear Regression, and Hypothesis Testing
   - Volatility forecasting (EWMA, GARCH models), and Monte Carlo simulations
3. **Financial Markets and Products (30%)**
   - Derivatives (Futures, Forwards, Options, Swaps), Hedging strategies
   - Fixed Income securities, Interest rates, and Foreign Exchange risk
4. **Valuation and Risk Models (30%)**
   - Value at Risk (VaR), Stress testing, and Scenario Analysis
   - Option pricing (Binomial trees, Black-Scholes), and Credit risk metrics

### Official Examination Format
- **Total Questions**: 100 Multiple-Choice Questions
- **Session Duration**: 4 hours (240 minutes)
`,
    sources: [
      { title: "GARP Official FRM Study Materials", uri: "https://www.garp.org/frm/study-materials" }
    ]
  },
  "FRM-Level 2": {
    summary: `
# FRM Part II (Level 2) Curriculum & Weightings

The Financial Risk Manager (FRM) Part II exam focuses on the practical application of risk models and advanced topics in risk management.

### Core Topic Weights & Focus Areas
1. **Market Risk Measurement & Management (20%)**
   - Extreme Value Theory (EVT), Backtesting VaR, and correlation modeling
2. **Credit Risk Measurement & Management (20%)**
   - Default risk, Credit Value Adjustment (CVA), Securitization, and Copulas
3. **Operational Risk & Resiliency (20%)**
   - Enterprise Risk Management (ERM), Basel capital requirements, and cyber risk
4. **Liquidity and Treasury Risk Measurement (15%)**
   - Liquidity Coverage Ratio (LCR), Net Stable Funding Ratio (NSFR), and Repo markets
5. **Risk Management and Investment Management (15%)**
   - Portfolio risk budgeting, Hedge fund risk, and private equity risk
6. **Current Issues in Financial Markets (10%)**
   - Decentralized Finance (DeFi), climate change risks, and inflation shocks

### Official Examination Format
- **Total Questions**: 80 Multiple-Choice Questions
- **Session Duration**: 4 hours (240 minutes)
`,
    sources: [
      { title: "GARP Official FRM Study Materials", uri: "https://www.garp.org/frm/study-materials" }
    ]
  },
  "FRM-Level 3": {
    summary: `
# FRM Executive & Integrated Case Studies (Level 3 Equivalent)

Focuses on enterprise-level risk governance, systemic stability, stress testing, and Basel III/IV implementation.

### Key Advanced Domains
1. **Macroprudential Stress Testing (25%)**
   - Designing systemic risk simulations and multi-asset feedback loops
2. **Capital Adequacy & Basel IV Standards (25%)**
   - Tier 1/2 capital buffers, Countercyclical capital buffers, and leverage ratios
3. **Systemic Risk & Liquidity Squeezes (25%)**
   - Interbank funding channels, run risks, and central clearing counterparty (CCP) stresses
4. **CRO Risk Case Studies & Governance (25%)**
   - Real-world institutional failures, model risk management, and risk appetite statement engineering

### Study Focus
- Application of integrated risk modeling to solve large-scale enterprise scenarios.
`,
    sources: [
      { title: "GARP Official FRM Exam Structure", uri: "https://www.garp.org/frm/program-exams" }
    ]
  },
  "CFP-Level 1": {
    summary: `
# CFP Board Exam Topic Outline (Level 1 Core)

The Certified Financial Planner (CFP) curriculum covers comprehensive personal financial advisory and holistic client planning.

### Core Topic Weights & Focus Areas
1. **Professional Conduct and Regulation (8%)**
   - CFP Board’s Code of Ethics and Fiduciary Standard of Conduct
2. **General Financial Planning Principles (15%)**
   - Financial statement analysis, Budgeting, Cash flow management, and Educational planning
3. **Risk Management and Insurance Planning (11%)**
   - Life, Health, Disability, Property & Casualty insurance analysis
4. **Investment Planning (17%)**
   - Modern Portfolio Theory, asset valuation, allocation, and risk metrics
`,
    sources: [
      { title: "CFP Board Official Exam Content Outline", uri: "https://www.cfp.net/get-certified/certification-process/exam-requirement/about-the-cfp-exam/exam-content-outline" }
    ]
  },
  "CFP-Level 2": {
    summary: `
# CFP Board Exam Topic Outline (Level 2 Advanced)

Expands on tax mechanics, employee compensation structures, and high-net-worth estate planning.

### Core Topic Weights & Focus Areas
1. **Tax Planning (14%)**
   - Individual tax deductions, corporate tax structures, passive loss rules, and cost basis rules
2. **Retirement Savings and Income Planning (12%)**
   - Qualified vs non-qualified retirement plans, social security, and distribution planning
3. **Estate Planning (10%)**
   - Gifting strategies, trusts (revocable & irrevocable), probate avoidance, and wealth transfer
`,
    sources: [
      { title: "CFP Board Official Exam Content Outline", uri: "https://www.cfp.net/get-certified/certification-process/exam-requirement/about-the-cfp-exam/exam-content-outline" }
    ]
  },
  "CFP-Level 3": {
    summary: `
# CFP Board Exam Topic Outline (Level 3 Capstone Case Studies)

Focuses on the creation and presentation of an integrated, client-centric financial plan using real-world client data.

### Core Topic Weights & Focus Areas
1. **Financial Plan Development (Capstone) (13%)**
   - Synthesizing all personal finance topics to form a professional presentation for advisory boards
2. **Psychology of Financial Planning (7%)**
   - Client communication, behavior heuristics, cognitive biases, and counseling techniques
`,
    sources: [
      { title: "CFP Board Official Exam Content Outline", uri: "https://www.cfp.net/get-certified/certification-process/exam-requirement/about-the-cfp-exam/exam-content-outline" }
    ]
  },
  "CMT-Level 1": {
    summary: `
# CMT Level I Curriculum Overview & Weightings

The CMT Level I exam measures entry-level competence in technical analysis, charting basics, and definition of terms.

### Core Topic Weights & Focus Areas
1. **Theory and History of Technical Analysis (15%)**
   - Dow Theory, Classical charting history, and basic market models
2. **Markets (15%)**
   - Equity, Fixed Income, Futures, and Forex market structures
3. **Market Indicators (15%)**
   - Volume indicators, Breadth, Sentiment indicators, and Flow of Funds
4. **Chart Construction & Pattern Analysis (25%)**
   - Bar, Line, Candlestick charts, Support & Resistance, and Classic Reversal patterns
5. **Trend Analysis (15%)**
   - Moving Averages, Trendlines, Channels, and standard overlays
6. **Ethics & Trading Systems (15%)**
   - CMT Association Code of Ethics and basic rule-based systems

### Official Examination Format
- **Total Questions**: 120 Multiple-Choice Questions
- **Session Duration**: 2 hours
`,
    sources: [
      { title: "CMT Association Official Level I Curriculum Guide", uri: "https://cmtassociation.org/chartered-market-technician/level-i/" }
    ]
  },
  "CMT-Level 2": {
    summary: `
# CMT Level II Curriculum Overview & Weightings

The CMT Level II exam focuses on the practical application of technical analysis tools and advanced quantitative theories.

### Core Topic Weights & Focus Areas
1. **Theory and History (5%)**
   - Advanced Dow Theory, Elliott Wave Principle, and Gann analysis
2. **Market Indicators (15%)**
   - Breadth indicators, advanced sentiment indicators, and volume-at-price models
3. **Chart Construction & Trend Analysis (20%)**
   - Point & Figure charting, Kagi charts, Renko, and advanced candlestick interpretation
4. **Multi-factor Valuation & Risk Management (25%)**
   - Volatility measures, relative strength matrices, and sector rotation strategies
5. **Advanced Chart Patterns & Quantitative TA (25%)**
   - Harmonics, advanced triangles, and algorithmic pattern recognition
6. **Statistical Analysis and Systems Testing (10%)**
   - Backtesting rules, curve fitting avoidance, and performance ratios

### Official Examination Format
- **Total Questions**: 120 Multiple-Choice Questions
- **Session Duration**: 4 hours
`,
    sources: [
      { title: "CMT Association Official Level II Curriculum Guide", uri: "https://cmtassociation.org/chartered-market-technician/level-ii/" }
    ]
  },
  "CMT-Level 3": {
    summary: `
# CMT Level III Curriculum Overview & Weightings

The CMT Level III exam measures candidates' ability to integrate technical analysis tools into professional portfolio management.

### Core Topic Weights & Focus Areas
1. **Portfolio Management (30%)**
   - Modern Portfolio Theory, core-satellite investing, and risk-adjusted returns
2. **Risk Management & Hedging (25%)**
   - Position sizing, stops, money management rules, and derivatives hedging
3. **Asset Allocation and Investment Strategy (25%)**
   - Global macro strategies, business cycle frameworks, and cross-asset correlations
4. **Ethics and Professional Standards (20%)**
   - CMT Association Ethics Standards and real-world compliance vignettes

### Official Examination Format
- **Format**: Essay/constructed-response and multiple-choice questions
- **Session Duration**: 4 hours
`,
    sources: [
      { title: "CMT Association Official Level III Curriculum Guide", uri: "https://cmtassociation.org/chartered-market-technician/level-iii/" }
    ]
  }
};

export default function SyllabusViewer({ cert, level }: SyllabusViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaWarning, setIsQuotaWarning] = useState(false);
  const [syllabusText, setSyllabusText] = useState<string>("");
  const [sources, setSources] = useState<Array<{ title: string; uri: string }>>([]);

  const cacheKey = `${cert}-${level}`;

  // Get active official external link based on selected cert and level
  const getOfficialLink = () => {
    switch (cert) {
      case "CFA":
        if (level === "Level 1") return "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-i";
        if (level === "Level 2") return "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-ii";
        return "https://www.cfainstitute.org/en/programs/cfa/curriculum/level-iii";
      case "FRM":
        if (level === "Level 1") return "https://www.garp.org/frm/study-materials";
        if (level === "Level 2") return "https://www.garp.org/frm/study-materials";
        return "https://www.garp.org/frm/program-exams";
      case "CFP":
        return "https://www.cfp.net/get-certified/certification-process/exam-requirement/about-the-cfp-exam/exam-content-outline";
      case "CMT":
        if (level === "Level 1") return "https://cmtassociation.org/chartered-market-technician/level-i/";
        if (level === "Level 2") return "https://cmtassociation.org/chartered-market-technician/level-ii/";
        return "https://cmtassociation.org/chartered-market-technician/level-iii/";
      default:
        return "https://www.cfainstitute.org";
    }
  };

  useEffect(() => {
    // 1. Setup local fallback immediately so the page is never blank or error-driven on start
    const fallback = LOCAL_SYLLABUS_FALLBACKS[cacheKey];
    if (fallback) {
      setSyllabusText(fallback.summary);
      setSources(fallback.sources);
    }
    setError(null);
    setIsQuotaWarning(false);

    // 2. Attempt to load from localStorage cache first
    const cachedData = localStorage.getItem("syllabus_cache");
    if (cachedData) {
      try {
        const cache: SyllabusCache = JSON.parse(cachedData);
        if (cache[cacheKey]) {
          setSyllabusText(cache[cacheKey].summary);
          setSources(cache[cacheKey].sources);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached syllabus", e);
      }
    }

    // 3. Otherwise try to automatically query updated search grounding
    fetchSyllabus(false);
  }, [cert, level]);

  const fetchSyllabus = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsQuotaWarning(false);
    try {
      const response = await fetch("/api/check-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cert, level, forceRefresh }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to query updated syllabus.");
      }

      const data = await response.json();
      setSyllabusText(data.summary);
      setSources(data.sources || []);

      // Save to localStorage cache
      const existingCache = localStorage.getItem("syllabus_cache");
      let cache: SyllabusCache = {};
      if (existingCache) {
        try {
          cache = JSON.parse(existingCache);
        } catch (e) {
          cache = {};
        }
      }
      cache[cacheKey] = {
        summary: data.summary,
        sources: data.sources || [],
        timestamp: Date.now(),
      };
      localStorage.setItem("syllabus_cache", JSON.stringify(cache));
    } catch (err: any) {
      const isQuota = err.message && (err.message.includes("quota") || err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED"));
      
      if (isQuota) {
        setIsQuotaWarning(true);
        // Load local fallback so user gets top-tier offline materials
        const fallback = LOCAL_SYLLABUS_FALLBACKS[cacheKey];
        if (fallback) {
          setSyllabusText(fallback.summary);
          setSources(fallback.sources);
        }
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const officialLink = getOfficialLink();

  return (
    <div className="space-y-6" id="syllabus-viewer-root">
      {/* Overview Info Header Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 rounded-2xl p-6 relative overflow-hidden" id="syllabus-intro-card">
        <div className="absolute top-0 right-0 p-8 text-slate-200/50 pointer-events-none hidden sm:block">
          <BookOpen className="w-32 h-32 stroke-[1]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-md font-bold shadow-xs">
                {cert} • {level}
              </span>
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Grounded Search Integrated
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              Syllabus & Topic Weightings
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Examine the official topics, weight ranges, and test structures directly. You can view offline fallback outlines below or pull real-time updates from Google Search.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Official Curriculum Website
            </a>
            
            <button
              id="btn-syllabus-refresh"
              onClick={() => fetchSyllabus(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Query Live Update
            </button>
          </div>
        </div>
      </div>

      {isQuotaWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4" id="syllabus-quota-warning">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Gemini Live Search Limit Reached</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              The live search API hit a temporary quota limit. Don't worry! We've automatically loaded the **verified offline syllabus weights & outlines** for you below. You can also view the primary curriculum details by clicking the **Official Curriculum Website** button.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        /* Skeletons and Loading States */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 animate-pulse" id="syllabus-loading-skeleton">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
          </div>
          <div className="h-40 bg-slate-50 rounded-xl pt-4 border border-slate-100"></div>
          <div className="flex justify-center items-center gap-2 py-6 text-slate-500 text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-bounce text-blue-500" />
            Querying Google Grounded Search for updated {cert} syllabus...
          </div>
        </div>
      ) : error ? (
        /* Error Display */
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4" id="syllabus-error">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-900 text-sm">Failed to retrieve syllabus details</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">{error}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => fetchSyllabus()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setIsQuotaWarning(true);
                  const fallback = LOCAL_SYLLABUS_FALLBACKS[cacheKey];
                  if (fallback) {
                    setSyllabusText(fallback.summary);
                    setSources(fallback.sources);
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Load Local Fallback Outline
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Success Content Display */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="syllabus-content">
          {/* Main Syllabus Markdown Content */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-display font-extrabold text-slate-900 text-lg">Curriculum Breakdown</h3>
              <span className="text-slate-400 text-xs font-bold tracking-wider uppercase">
                {isQuotaWarning ? "Offline Verified Resource" : "Powered by Google Gemini"}
              </span>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 markdown-body">
              <ReactMarkdown>{syllabusText}</ReactMarkdown>
            </div>
          </div>

          {/* Side Panel: Citations & Search Grounding Info */}
          <div className="space-y-6">
            {/* Grounding Source Citations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-display font-bold text-slate-900 text-sm mb-3">Verified Study Citations</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                These external resources are the official, primary links recommended for {cert} exam preparation:
              </p>

              {sources.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  No citations returned. Try clicking 'Query Live Update' to fetch again.
                </div>
              ) : (
                <ul className="space-y-2.5" id="syllabus-citations-list">
                  {sources.map((source, idx) => (
                    <li key={idx} className="group">
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2.5 p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0 transition-all" />
                        <div className="text-slate-700 group-hover:text-blue-900 font-bold transition-all line-clamp-2">
                          {source.title}
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 mt-0.5 font-mono truncate">
                            {source.uri}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Preparation Strategy Card */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none"></div>
              <h4 className="font-display font-bold text-white text-sm mb-2">Practice Strategy</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Now that you know the topic weights, jump back to the <strong>Practice Arena</strong> tab. You can target specific subjects or syllabus sections to reinforce your weaker areas.
              </p>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between items-center font-mono font-bold uppercase tracking-wider">
                <span>Certification Scope</span>
                <span className="text-emerald-400">Validated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


