import React from "react";

interface LogoProps {
  variant?: "horizontal" | "icon" | "stacked";
  className?: string;
}

export default function Logo({ variant = "horizontal", className = "" }: LogoProps) {
  // SVG Graphic: Three Owls on a Candlestick Branch
  const GraphicSvg = (
    <svg
      viewBox="0 0 500 250"
      className="w-full h-full text-slate-900"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* --- CANDLESTICK BRANCH LINE --- */}
      {/* The main horizontal wire/branch */}
      <path d="M 40 160 L 460 160" stroke="currentColor" strokeWidth="4" />
      <path d="M 120 160 L 220 180 L 340 150" stroke="currentColor" strokeWidth="4" />

      {/* Candlestick Wicks & Bodies (Red and Green Candlesticks along the bottom of the wire) */}
      {/* Green Candles (e.g. represented with stroke emerald-500/emerald-600) */}
      {/* Candle 1 (Green) */}
      <line x1="80" y1="180" x2="80" y2="220" stroke="#10b981" strokeWidth="2" />
      <rect x="73" y="190" width="14" height="20" fill="#10b981" stroke="#10b981" strokeWidth="1" rx="1" />

      {/* Candle 2 (Green) */}
      <line x1="110" y1="170" x2="110" y2="210" stroke="#10b981" strokeWidth="2" />
      <rect x="103" y="178" width="14" height="22" fill="#10b981" stroke="#10b981" strokeWidth="1" rx="1" />

      {/* Candle 3 (Red) */}
      <line x1="145" y1="190" x2="145" y2="240" stroke="#ef4444" strokeWidth="2" />
      <rect x="138" y="200" width="14" height="28" fill="#ef4444" stroke="#ef4444" strokeWidth="1" rx="1" />

      {/* Candle 4 (Green) */}
      <line x1="260" y1="180" x2="260" y2="215" stroke="#10b981" strokeWidth="2" />
      <rect x="253" y="185" width="14" height="18" fill="#10b981" stroke="#10b981" strokeWidth="1" rx="1" />

      {/* Candle 5 (Red) */}
      <line x1="300" y1="190" x2="300" y2="235" stroke="#ef4444" strokeWidth="2" />
      <rect x="293" y="198" width="14" height="24" fill="#ef4444" stroke="#ef4444" strokeWidth="1" rx="1" />

      {/* Candle 6 (Green) */}
      <line x1="340" y1="175" x2="340" y2="210" stroke="#10b981" strokeWidth="2" />
      <rect x="333" y="180" width="14" height="18" fill="#10b981" stroke="#10b981" strokeWidth="1" rx="1" />

      {/* Candle 7 (Red) */}
      <line x1="380" y1="165" x2="380" y2="225" stroke="#ef4444" strokeWidth="2" />
      <rect x="373" y="175" width="14" height="35" fill="#ef4444" stroke="#ef4444" strokeWidth="1" rx="1" />

      {/* Candle 8 (Green) */}
      <line x1="420" y1="185" x2="420" y2="220" stroke="#10b981" strokeWidth="2" />
      <rect x="413" y="190" width="14" height="15" fill="#10b981" stroke="#10b981" strokeWidth="1" rx="1" />


      {/* --- OWL 1 (LEFT) --- */}
      <g id="owl-left" transform="translate(110, 35)">
        {/* Body outline */}
        <path d="M 15 110 C 15 40, 95 40, 95 110 C 95 125, 15 125, 15 110 Z" fill="white" />
        {/* Tufted Ears / Horns */}
        <path d="M 20 52 L 10 40 L 35 48" />
        <path d="M 90 52 L 100 40 L 75 48" />
        {/* Eyebrows */}
        <path d="M 20 62 Q 35 52, 50 62" />
        <path d="M 90 62 Q 75 52, 60 62" />
        {/* Big Eyes (Circles) */}
        <circle cx="37" cy="72" r="14" fill="white" />
        <circle cx="37" cy="72" r="6" fill="currentColor" />
        <circle cx="73" cy="72" r="14" fill="white" />
        <circle cx="73" cy="72" r="6" fill="currentColor" />
        {/* Beak */}
        <polygon points="55,75 50,88 60,88" fill="currentColor" />
        {/* Wings */}
        <path d="M 15 100 Q 30 110, 25 120" />
        <path d="M 95 100 Q 80 110, 85 120" />
        {/* Chest Feathers (Vertical Stripes) */}
        <line x1="45" y1="100" x2="45" y2="115" strokeWidth="2.5" />
        <line x1="55" y1="98" x2="55" y2="118" strokeWidth="2.5" />
        <line x1="65" y1="100" x2="65" y2="115" strokeWidth="2.5" />
        {/* Feet */}
        <path d="M 35 125 L 35 130" strokeWidth="4" />
        <path d="M 45 125 L 45 130" strokeWidth="4" />
        <path d="M 65 125 L 65 130" strokeWidth="4" />
        <path d="M 75 125 L 75 130" strokeWidth="4" />
      </g>


      {/* --- OWL 2 (MIDDLE) --- */}
      <g id="owl-middle" transform="translate(205, 50)">
        {/* Body outline */}
        <path d="M 15 100 C 15 35, 95 35, 95 100 C 95 115, 15 115, 15 100 Z" fill="white" />
        {/* Tufted Ears / Horns */}
        <path d="M 22 46 Q 10 32, 28 40" />
        <path d="M 88 46 Q 100 32, 82 40" />
        {/* Big Eyes */}
        <circle cx="36" cy="68" r="13" fill="white" />
        <circle cx="36" cy="68" r="5" fill="currentColor" />
        <circle cx="74" cy="68" r="13" fill="white" />
        <circle cx="74" cy="68" r="5" fill="currentColor" />
        {/* Beak */}
        <polygon points="55,70 50,82 60,82" fill="currentColor" />
        {/* Scale feathers on belly */}
        <path d="M 45 92 Q 55 98, 65 92" strokeWidth="2.5" />
        <path d="M 40 100 Q 55 108, 70 100" strokeWidth="2.5" />
        {/* Feet */}
        <circle cx="42" cy="115" r="3" fill="currentColor" />
        <circle cx="68" cy="115" r="3" fill="currentColor" />
      </g>


      {/* --- OWL 3 (RIGHT) --- */}
      <g id="owl-right" transform="translate(300, 20)">
        {/* Body outline (slightly taller, tilted) */}
        <path d="M 20 120 C 10 40, 90 30, 95 120 C 95 135, 20 135, 20 120 Z" fill="white" />
        {/* Head crest */}
        <path d="M 25 50 Q 15 32, 40 38" />
        <path d="M 85 45 Q 98 28, 80 38" />
        {/* Big Eyes */}
        <circle cx="40" cy="65" r="14" fill="white" />
        <circle cx="40" cy="65" r="6" fill="currentColor" />
        <circle cx="76" cy="65" r="14" fill="white" />
        <circle cx="76" cy="65" r="6" fill="currentColor" />
        {/* Beak */}
        <polygon points="58,68 53,80 63,80" fill="currentColor" />
        {/* Belly contour feathers */}
        <path d="M 28 100 Q 58 115, 88 100" strokeWidth="2.5" />
        {/* Feet */}
        <line x1="42" y1="130" x2="42" y2="136" strokeWidth="4" />
        <line x1="72" y1="130" x2="72" y2="136" strokeWidth="4" />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={`w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs ${className}`}>
        {GraphicSvg}
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm ${className}`} id="logo-stacked">
        {/* Visual Graphic */}
        <div className="w-56 h-32 flex items-center justify-center">
          {GraphicSvg}
        </div>

        {/* Branding Typography */}
        <div className="space-y-1.5">
          <h2 className="font-sans font-black tracking-widest text-slate-900 text-lg sm:text-xl leading-none">
            PRACTICAL FINANCIAL
          </h2>
          <h3 className="font-sans font-light tracking-widest text-slate-800 text-md sm:text-lg uppercase leading-none">
            ANALYST INSTITUTE
          </h3>
          <p className="font-serif italic text-slate-500 text-xs sm:text-sm pt-0.5">
            by <span className="font-semibold text-slate-700">Puratan Bharti</span>
          </p>
        </div>

        {/* Purpose / Slogan */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest border-t border-slate-100 pt-3 w-full justify-center">
          <span>Practice</span>
          <span className="text-slate-300">•</span>
          <span>Perform</span>
          <span className="text-slate-300">•</span>
          <span>Profit</span>
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center gap-4 ${className}`} id="logo-horizontal">
      {/* Icon portion */}
      <div className="w-20 h-12 flex items-center justify-center shrink-0">
        {GraphicSvg}
      </div>

      {/* Label portion */}
      <div className="border-l border-slate-200 pl-4">
        <h2 className="font-sans font-extrabold tracking-wider text-slate-900 text-sm leading-tight">
          PRACTICAL FINANCIAL
        </h2>
        <h3 className="font-sans font-medium tracking-widest text-slate-500 text-[10px] uppercase leading-tight">
          ANALYST INSTITUTE
        </h3>
        <p className="font-serif italic text-slate-400 text-[10px] leading-tight">
          by <span className="font-bold text-slate-600">Puratan Bharti</span>
        </p>
      </div>
    </div>
  );
}
