import { useState, useEffect } from "react";
import { Zap, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function ServerHealthMonitor() {
  const [isAsleep, setIsAsleep] = useState(false);
  const [countdown, setCountdown] = useState(90);
  const [showStatus, setShowStatus] = useState(false);
  const [isWokenUp, setIsWokenUp] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const checkHealth = async (isFirstCheck = false) => {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 1800); // 1.8 seconds timeout

        const res = await fetch("/api/health", { signal: controller.signal });
        clearTimeout(id);

        if (res.ok) {
          // Server is awake!
          if (isAsleep) {
            setIsWokenUp(true);
            setIsAsleep(false);
            // Auto hide after 4 seconds of showing "Success"
            setTimeout(() => {
              setShowStatus(false);
              setIsWokenUp(false);
            }, 4000);
          } else if (isFirstCheck) {
            // If first check succeeds, server was already awake, no need to show any dialogs
            setShowStatus(false);
          }
          setErrorOccurred(false);
        } else {
          throw new Error("Server returned non-200");
        }
      } catch (err) {
        // Fetch failed or timed out -> Server is likely asleep
        if (isFirstCheck) {
          setIsAsleep(true);
          setShowStatus(true);
          setCountdown(90);
        }
      }
    };

    // Run first check on mount
    checkHealth(true);

    // Poll the backend every 5 seconds to see if it woke up
    checkInterval = setInterval(() => {
      checkHealth(false);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(countdownInterval);
      clearTimeout(timeoutId);
    };
  }, [isAsleep]);

  // Handle countdown decrement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAsleep && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAsleep, countdown]);

  if (!showStatus) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header section with status background */}
      <div className={`px-4 py-3 flex items-center justify-between text-white ${
        isWokenUp 
          ? "bg-emerald-600" 
          : "bg-amber-500 animate-pulse"
      }`}>
        <div className="flex items-center gap-2 font-medium text-sm">
          {isWokenUp ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Exam Engine Synced!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 shrink-0 animate-bounce" />
              <span>Optimizing Live Exam Engine...</span>
            </>
          )}
        </div>
        <button 
          onClick={() => setShowStatus(false)}
          className="text-white/80 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 bg-slate-50/50">
        {isWokenUp ? (
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1">Live Database Connected!</p>
            <p>The interactive testing system is fully synchronized. Custom questions, OTP verifications, and performance analytics are fully online.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Our advanced testing engine is currently <span className="font-semibold text-slate-800">initializing live databases</span> and populating the freshest practice question pools.
            </p>

            {/* Progress Bar & Countdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-800">
                  {countdown > 0 
                    ? `Synchronizing testing engine: ${countdown}s` 
                    : "Finalizing optimization... Any second now!"
                  }
                </span>
                <span className="text-slate-400 text-[10px]">
                  {Math.round(((90 - countdown) / 90) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.max(5, Math.min(100, ((90 - countdown) / 90) * 100))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 shrink-0" />
              <span>You can start practicing with the offline-ready question set right now!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
