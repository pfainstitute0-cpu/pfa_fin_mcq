import { useState } from "react";
import { Lock, Mail, ShieldAlert, KeyRound, X, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, email: string) => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid admin email or password.");
      }

      const data = await response.json();
      if (data.success && data.token) {
        onLoginSuccess(data.token, email.trim());
        setEmail("");
        setPassword("");
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || "Network credentials verification failed.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setAuthError("Please enter your registered admin Gmail address.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError("New passwords do not match.");
      return;
    }
    if (newPassword.trim().length < 4) {
      setAuthError("Master password must be at least 4 characters long.");
      return;
    }

    setLoggingIn(true);
    try {
      const response = await fetch("/api/admin/forgot-reset-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Email verification failed.");
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || "Master password successfully reset!");
        setNewPassword("");
        setConfirmPassword("");
        // Automatically switch back to login mode after a brief timeout
        setTimeout(() => {
          setIsResetMode(false);
          setSuccessMsg(null);
          setAuthError(null);
        }, 3000);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to reset password.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" id="admin-login-modal">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
          id="btn-close-admin-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1 border border-blue-100">
            {isResetMode ? <RefreshCw className="w-6 h-6 animate-spin-slow" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
            {isResetMode ? "Reset Admin Password" : "Admin Authentication"}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isResetMode
              ? "Verify your registered administrator Gmail ID to establish a new secure master password."
              : "Please authenticate with your administrator credentials to access student leads and customize practice MCQs."}
          </p>
        </div>

        {authError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-4 animate-in slide-in-from-top-1">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{authError}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl flex items-start gap-2 mb-4 animate-in slide-in-from-top-1">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {/* Form Selection */}
        {!isResetMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="admin-login-form">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Email ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="admin-email-field"
                  type="email"
                  required
                  placeholder="administrator@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-sans font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="admin-password-field"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setAuthError(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
              
              <span className="text-[10px] text-slate-400 font-mono">
                Default credentials active
              </span>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer mt-2"
            >
              {loggingIn ? "Verifying..." : "Sign In to Admin Panel"}
            </button>

            {/* Default credential helper banner */}
            <div className="p-3 bg-amber-50 border border-amber-100/60 rounded-xl text-[10px] text-amber-800 leading-relaxed font-sans">
              ⚙️ <strong>First-Time Access:</strong> Use the default initial credentials below:
              <div className="mt-1 font-mono text-[9px] flex justify-between">
                <span>Email: <strong className="select-all">pfainstitute0@gmail.com</strong></span>
                <span>Pass: <strong className="select-all">admin</strong></span>
              </div>
            </div>
          </form>
        ) : (
          /* RESET PASSWORD FORM */
          <form onSubmit={handleResetSubmit} className="space-y-4" id="admin-reset-form">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Admin Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="admin-reset-email"
                  type="email"
                  required
                  placeholder="e.g. pfainstitute0@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-sans font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Master Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="admin-new-password"
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="admin-confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setAuthError(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>

            <button
              id="admin-reset-submit"
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer mt-2"
            >
              {loggingIn ? "Resetting Password..." : "Establish New Master Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
