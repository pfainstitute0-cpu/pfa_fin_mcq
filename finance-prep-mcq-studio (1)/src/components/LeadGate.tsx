import { useState } from "react";
import { GraduationCap, ArrowRight, User, Mail, Phone, Lock, Sparkles, CheckCircle } from "lucide-react";

interface LeadGateProps {
  onUnlock: (student: { name: string; email: string; phone: string }) => void;
}

export default function LeadGate({ onUnlock }: LeadGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid phone or WhatsApp number (minimum 8 digits).");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/register-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit registration. Please try again.");
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        // Micro-timeout for elegant screen change
        setTimeout(() => {
          onUnlock({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
          });
        }, 1200);
      } else {
        throw new Error(data.error || "An error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans" id="lead-gate-container">
      {/* Background Ambience elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative z-10" id="lead-gate-card">
        {/* Logo Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl shadow-inner mb-2" id="logo-badge">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold border border-blue-500/20">
            Digital Vidya Study Platform
          </span>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            Financial Analyst Prep Arena
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Gain complimentary access to real-time Gemini-powered MCQ generators, curriculum dashboards, and targeted analytics. Register below to unlock the dashboard.
          </p>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4 animate-pulse" id="lead-gate-success">
            <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-white text-lg">Verification Successful!</h3>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Preparing your personalized preparation workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" id="lead-gate-form">
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {/* Student Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="lead-name-input"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            {/* Student Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gmail / Email ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="lead-email-input"
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            {/* Student Phone */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="lead-phone-input"
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                />
              </div>
            </div>

            <button
              id="lead-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 transition-all mt-6 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {submitting ? "Unlocking Workspace..." : "Unlock Dashboard"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Humble Secure Banner */}
        <div className="mt-6 pt-5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Real-Time MCQ Engine
          </span>
          <span>Fiduciary Secure</span>
        </div>
      </div>
    </div>
  );
}
