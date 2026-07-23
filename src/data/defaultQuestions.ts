import { Question } from "../types";

export const defaultQuestions: Question[] = [
  // --- CMT LEVEL 1 ---
  {
    id: "cmt-l1-def1",
    cert: "CMT",
    level: "Level 1",
    category: "Technical Analysis Theory",
    text: "According to the Dow Theory, which of the following is considered the most critical price of the trading day?",
    options: [
      "The opening price",
      "The closing price",
      "The intraday high price",
      "The intraday low price"
    ],
    correctAnswerIndex: 1,
    explanation: "In Dow Theory, the closing price is considered the most significant price of the trading day because it represents the final consensus value after all intraday speculative movements have settled. Dow theorists disregard intraday highs and lows, focusing exclusively on closing prices to identify trend line penetrations and trend confirmations.",
  },
  {
    id: "cmt-l1-def2",
    cert: "CMT",
    level: "Level 1",
    category: "Chart Patterns",
    text: "Which of the following describes a classical 'Head and Shoulders' top pattern breakdown confirmation?",
    options: [
      "When the right shoulder price exceeds the head price",
      "When the closing price breaks below the neckline support on expansion of volume",
      "When the opening price breaks above the left shoulder on high volume",
      "When the price reaches a Fibonacci retracement of 61.8%"
    ],
    correctAnswerIndex: 1,
    explanation: "A classic Head and Shoulders top pattern is only fully confirmed and completed when the price falls through and closes below the 'neckline' support line connecting the two troughs. A surge in volume on the breakout further validates the pattern shift from bullish accumulation to bearish distribution.",
  },

  // --- CMT LEVEL 2 ---
  {
    id: "cmt-l2-def1",
    cert: "CMT",
    level: "Level 2",
    category: "Moving Averages & Oscillators",
    text: "When utilizing the Relative Strength Index (RSI) oscillator developed by J. Welles Wilder, what does a 'failure swing' in an oversold area signify?",
    options: [
      "A confirmation of a strong continuing bearish trend",
      "A strong warning of an impending bullish trend reversal",
      "A signal that the market is in a structural trading range",
      "An indication of high historical volatility"
    ],
    correctAnswerIndex: 1,
    explanation: "A failure swing occurs when the RSI enters an extreme oversold region (usually below 30), rallies, pulls back but stays above 30 (forming a higher low), and then rallies again to break above its previous peak. This demonstrates a clear shift in underlying momentum and acts as a strong precursor to a bullish reversal.",
  },

  // --- CMT LEVEL 3 ---
  {
    id: "cmt-l3-def1",
    cert: "CMT",
    level: "Level 3",
    category: "System Testing & Asset Allocation",
    text: "In systematic technical system design, what does a Walk-Forward Optimization (WFO) primarily guard against?",
    options: [
      "High transaction execution slippage",
      "Over-fitting or curve-fitting historical backtest data",
      "Underestimating maximum drawdown durations",
      "Executing trades against regulatory dark pools"
    ],
    correctAnswerIndex: 1,
    explanation: "Walk-Forward Optimization evaluates a trading system by optimizing parameters on a segment of historical data (in-sample) and testing it on subsequent unseen data (out-of-sample). Repeatedly rolling this window forward tests system stability on fresh data, directly guarding against curve-fitting/over-optimization.",
  },

  // --- CFA LEVEL 1 ---
  {
    id: "cfa-l1-def1",
    cert: "CFA",
    level: "Level 1",
    category: "Ethical and Professional Standards",
    text: "An analyst discovers material nonpublic information regarding an upcoming corporate buyout. Under the CFA Standards of Professional Conduct, the analyst is permitted to:",
    options: [
      "Share the information with their firm's high-net-worth clients only",
      "Execute personal trades before publishing a general research report",
      "Encourage the corporation's management to release the information publicly",
      "Trade on the information solely on behalf of standard mutual fund accounts"
    ],
    correctAnswerIndex: 2,
    explanation: "Under Standard II(A) Material Nonpublic Information, members who possess material nonpublic information must not trade or cause others to trade on it. The best course of action is to encourage the issuer to make the information public. You cannot trade on it for clients, yourself, or share it selectively.",
  },
  {
    id: "cfa-l1-def2",
    cert: "CFA",
    level: "Level 1",
    category: "Quantitative Methods",
    text: "If the probability of Event A is 0.40 and the probability of Event B is 0.50, and the joint probability of A and B is 0.20, what can be concluded about Events A and B?",
    options: [
      "They are mutually exclusive",
      "They are independent events",
      "They are perfectly negatively correlated",
      "They are dependent events"
    ],
    correctAnswerIndex: 1,
    explanation: "Two events are independent if P(A and B) = P(A) * P(B). Here, P(A) * P(B) = 0.40 * 0.50 = 0.20, which exactly matches the joint probability of 0.20. Therefore, the events are statistically independent.",
  },
  {
    id: "cfa-l1-def3",
    cert: "CFA",
    level: "Level 1",
    category: "Financial Statement Analysis",
    text: "Under IFRS, interest paid can be classified as either an operating activity or a financing activity, whereas under US GAAP, interest paid is classified as:",
    options: [
      "Operating activities only",
      "Financing activities only",
      "Investing activities only",
      "Operating or financing activities"
    ],
    correctAnswerIndex: 0,
    explanation: "Under US GAAP, interest paid must be classified as an operating activity. Under IFRS, interest paid can be classified as either an operating or a financing activity, providing firms with greater accounting flexibility.",
  },
  {
    id: "cfa-l1-def4",
    cert: "CFA",
    level: "Level 1",
    category: "Corporate Issuers",
    text: "Which of the following is most likely to decrease a company's weighted average cost of capital (WACC)?",
    options: [
      "An increase in the marginal corporate tax rate",
      "An increase in the risk-free rate of return",
      "An increase in the company's beta",
      "A decrease in the proportion of debt financing"
    ],
    correctAnswerIndex: 0,
    explanation: "Since interest expense is tax-deductible, the after-tax cost of debt is rd * (1 - t). An increase in the marginal corporate tax rate (t) decreases the after-tax cost of debt, which directly decreases the company's WACC, holding all other components constant.",
  },
  {
    id: "cfa-l1-def5",
    cert: "CFA",
    level: "Level 1",
    category: "Fixed Income",
    text: "A 5-year coupon bond has a yield to maturity of 6%. If interest rates suddenly increase by 100 basis points, which of the following measures is most appropriate to estimate the percentage price change of the bond?",
    options: [
      "Modified Duration",
      "Macaulay Duration",
      "Effective Duration",
      "Convexity alone"
    ],
    correctAnswerIndex: 0,
    explanation: "Modified duration measures the percentage price sensitivity of a bond to a change in its own yield to maturity, assuming cash flows do not change when interest rates change. Effective duration is used for bonds with embedded options. Macaulay duration measures weighted average time to receive cash flows.",
  },
  {
    id: "cfa-l1-def6",
    cert: "CFA",
    level: "Level 1",
    category: "Derivatives",
    text: "Which of the following derivative contracts is best described as an over-the-counter (OTC) agreement that is highly customizable and carries counterparty credit risk?",
    options: [
      "A forward contract",
      "A futures contract",
      "An exchange-traded option",
      "A cleared swap contract"
    ],
    correctAnswerIndex: 0,
    explanation: "Forward contracts are private, custom-tailored agreements traded over-the-counter (OTC) and are subject to counterparty credit risk because they lack a central clearinghouse. Futures contracts are standardized and traded on regulated exchanges with a clearinghouse acting as counterparty, virtually eliminating credit risk.",
  },
  {
    id: "cfa-l1-def7",
    cert: "CFA",
    level: "Level 1",
    category: "Alternative Investments",
    text: "In private equity, the fee structure typically includes a management fee and carried interest. Carried interest represents:",
    options: [
      "The general partner's share of the fund's profits",
      "The limited partner's return of initial capital",
      "The transaction fees paid to external advisory boards",
      "The annual fee for managing the fund's assets"
    ],
    correctAnswerIndex: 0,
    explanation: "Carried interest is the share of profits (typically 20%) that general partners (GPs) receive from the fund's capital gains once a hurdle rate (preferred return) has been returned to the limited partners (LPs). This aligns the GPs' incentives with the LPs' investment outcomes.",
  },
  {
    id: "cfa-l1-def8",
    cert: "CFA",
    level: "Level 1",
    category: "Economics",
    text: "If a central bank carries out open market operations by purchasing government bonds, the most likely immediate impact on the money supply and short-term interest rates is:",
    options: [
      "Money supply increases, short-term interest rates decrease",
      "Money supply decreases, short-term interest rates increase",
      "Money supply increases, short-term interest rates increase",
      "Money supply decreases, short-term interest rates decrease"
    ],
    correctAnswerIndex: 0,
    explanation: "When a central bank buys government bonds, it injects reserves/liquidity into the banking system, which increases the money supply. This expansion of credit reserves drives down short-term interest rates (such as the interbank lending rate).",
  },

  // --- CFA LEVEL 2 ---
  {
    id: "cfa-l2-def1",
    cert: "CFA",
    level: "Level 2",
    category: "Equity Valuation",
    text: "An analyst is using a Free Cash Flow to Firm (FCFF) model to value a company with a complex leverage structure. Which discount rate is most appropriate to value the equity of the firm using FCFF?",
    options: [
      "The Cost of Equity",
      "The Weighted Average Cost of Capital (WACC)",
      "The Risk-Free Rate of Return",
      "The Pre-Tax Cost of Debt"
    ],
    correctAnswerIndex: 1,
    explanation: "FCFF represents the cash available to all suppliers of capital (both debt and equity). Therefore, the cash flows must be discounted at the Weighted Average Cost of Capital (WACC), which reflects the blended required return of both financing groups. Discounting FCFF by WACC yields the total firm value; subtracting debt then gives the equity value.",
  },

  // --- CFA LEVEL 3 ---
  {
    id: "cfa-l3-def1",
    cert: "CFA",
    level: "Level 3",
    category: "Portfolio Management and Wealth Planning",
    text: "Which of the following behavioral biases is characterized by an investor holding on to losing investments too long while selling winning investments too quickly?",
    options: [
      "Loss Aversion (The Disposition Effect)",
      "Availability Bias",
      "Overconfidence Bias",
      "Mental Accounting"
    ],
    correctAnswerIndex: 0,
    explanation: "The Disposition Effect, rooted in Loss Aversion (Prospect Theory), describes the tendency of investors to lock in paper gains quickly to experience pride, while holding onto losing positions for prolonged periods hoping to break even, avoiding the emotional pain of realizing a loss.",
  },

  // --- CFP LEVEL 1 ---
  {
    id: "cfp-l1-def1",
    cert: "CFP",
    level: "Level 1",
    category: "General Financial Planning Principles",
    text: "Which of the following represents a primary duty under the CFP Board's 'Fiduciary Duty' standard when providing financial advice?",
    options: [
      "Duty of Loyalty, Duty of Care, and Duty to Follow Client Instructions",
      "Duty of absolute profitability, Duty of low fees, and Duty of disclosure",
      "Duty of arbitration, Duty of marketing, and Duty of client screening",
      "Duty of non-compete, Duty of relative performance, and Duty of trade execution"
    ],
    correctAnswerIndex: 0,
    explanation: "According to the CFP Board's Code of Ethics and Standards of Conduct, a CFP professional acting as a fiduciary owes three core duties to the client: (1) Duty of Loyalty, (2) Duty of Care, and (3) Duty to Follow Client Instructions.",
  },

  // --- CFP LEVEL 2 ---
  {
    id: "cfp-l2-def1",
    cert: "CFP",
    level: "Level 2",
    category: "Retirement Savings & Income Planning",
    text: "What is the penalty for an individual who fails to take their Required Minimum Distribution (RMD) from a traditional IRA by the applicable deadline, under SECURE 2.0 legislation?",
    options: [
      "An excise tax equal to 50% of the undistributed RMD amount",
      "An excise tax equal to 25% of the undistributed RMD amount (reducible to 10% if corrected timely)",
      "A complete forfeiture of the traditional IRA balance to the IRS",
      "No penalty, only standard income tax on the amount that should have been withdrawn"
    ],
    correctAnswerIndex: 1,
    explanation: "Under SECURE Act 2.0, the penalty for failing to take a Required Minimum Distribution (RMD) from a tax-qualified retirement plan is reduced from the historical 50% to 25%. This penalty can be further reduced to 10% if the individual corrects the shortfall and files an updated return within the designated correction window.",
  },

  // --- CFP LEVEL 3 ---
  {
    id: "cfp-l3-def1",
    cert: "CFP",
    level: "Level 3",
    category: "Estate Planning",
    text: "A client wishes to establish an irrevocable trust that removes assets from their gross estate while allowing the grantor's spouse to receive discretionary distributions during their lifetime. Which structure is most appropriate?",
    options: [
      "A Revocable Living Trust",
      "A Spousal Lifetime Access Trust (SLAT)",
      "A Qualified Personal Residence Trust (QPRT)",
      "A Grantor Retained Annuity Trust (GRAT)"
    ],
    correctAnswerIndex: 1,
    explanation: "A Spousal Lifetime Access Trust (SLAT) is an irrevocable trust where one spouse makes a completed gift of assets to the trust for the benefit of the other spouse (and potentially children). This removes the asset from the grantor's gross taxable estate while maintaining indirect spousal access to the trust distributions."
  },

  // --- FRM LEVEL 1 ---
  {
    id: "frm-l1-def1",
    cert: "FRM",
    level: "Level 1",
    category: "Valuation and Risk Models",
    text: "Under the Basel risk management frameworks, the Value at Risk (VaR) of a portfolio represents the maximum loss expected over a given time horizon at a specific confidence level. Which of the following describes a key theoretical limitation of VaR?",
    options: [
      "It is sub-additive, meaning the VaR of a combined portfolio is always greater than the sum of individual VaRs",
      "It does not provide information regarding the magnitude of losses exceeding the VaR threshold",
      "It strictly requires the assumption of a normal distribution for all underlying risk factors",
      "It is extremely computationally expensive compared to Expected Shortfall (ES)"
    ],
    correctAnswerIndex: 1,
    explanation: "Value at Risk (VaR) is defined as the maximum loss expected at a specific confidence level, but it is silent about the distribution of losses in the tail (beyond the VaR threshold). Expected Shortfall (ES) addresses this limitation by measuring the average loss in the tail. Additionally, VaR is not coherent because it lacks sub-additivity."
  },
  {
    id: "frm-l1-def2",
    cert: "FRM",
    level: "Level 1",
    category: "Quantitative Analysis",
    text: "An analyst is estimating the tracking error of an index fund. To model the volatility of asset returns where recent shocks have a persistent but decaying effect, which volatility model is most appropriate?",
    options: [
      "Simple Historical Volatility",
      "Exponentially Weighted Moving Average (EWMA)",
      "Standard Ordinary Least Squares (OLS)",
      "Linear Interpolation"
    ],
    correctAnswerIndex: 1,
    explanation: "The Exponentially Weighted Moving Average (EWMA) model (and GARCH models) allows the weights of past returns to decay exponentially over time. This captures the phenomenon of volatility clustering, where recent large shocks have a stronger, yet decaying, influence on current volatility estimates."
  },

  // --- FRM LEVEL 2 ---
  {
    id: "frm-l2-def1",
    cert: "FRM",
    level: "Level 2",
    category: "Market Risk Measurement & Management",
    text: "In extreme value theory (EVT), the Block Maxima method and the Peaks-Over-Threshold (POT) method are commonly used to model tail risk. Which distribution describes the asymptotic behavior of exceedances above a sufficiently high threshold in the POT method?",
    options: [
      "Generalized Extreme Value (GEV) Distribution",
      "Generalized Pareto Distribution (GPD)",
      "Lognormal Distribution",
      "Student's t-Distribution"
    ],
    correctAnswerIndex: 1,
    explanation: "According to the Balkema-de Haan-Pickands theorem, the distribution of excesses over a sufficiently high threshold asymptotically converges to a Generalized Pareto Distribution (GPD). The GEV distribution, by contrast, is associated with the Block Maxima approach."
  },

  // --- FRM LEVEL 3 ---
  {
    id: "frm-l3-def1",
    cert: "FRM",
    level: "Level 3",
    category: "Integrated Risk Management",
    text: "When assessing the liquidity coverage ratio (LCR) and structural funding stability under extreme systemic stress, which of the following is considered a key difference between High-Quality Liquid Assets (HQLA) Level 1 and Level 2 under Basel III?",
    options: [
      "Level 1 assets are subject to a minimum 15% haircut, whereas Level 2 assets have no haircuts",
      "Level 1 assets are capped at 40% of the total HQLA pool, whereas Level 2 assets are unlimited",
      "Level 1 assets include central bank reserves and sovereign debt with 0% haircut, whereas Level 2 assets are subject to haircuts and caps",
      "Level 1 assets only consist of physical gold and hard cash reserves in domestic custody"
    ],
    correctAnswerIndex: 2,
    explanation: "Under Basel III, Level 1 HQLA (such as cash, central bank reserves, and high-quality sovereign bonds) are included in the liquidity stock with a 0% haircut and no cap. Level 2 assets (such as high-quality corporate bonds and covered bonds) are subject to haircuts (15% for Level 2A, 50% for Level 2B) and a combined 40% cap of the total HQLA pool."
  }
];
