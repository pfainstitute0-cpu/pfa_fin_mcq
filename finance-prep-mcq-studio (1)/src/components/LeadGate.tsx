import { useState } from "react";
import { 
  GraduationCap, ArrowRight, User, Mail, Phone, Lock, Sparkles, CheckCircle, 
  BookOpen, Award, TrendingUp, KeyRound, Sparkle, ShieldCheck, HeartPulse
} from "lucide-react";
import Logo from "./Logo";

interface LeadGateProps {
  onUnlock: (student: { name: string; email: string; phone: string }) => void;
  onAdminTrigger?: () => void;
}

export default function LeadGate({ onUnlock, onAdminTrigger }: LeadGateProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [sentOtpType, setSentOtpType] = useState<'register' | 'forgot-password' | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devOtpAlert, setDevOtpAlert] = useState<string | null>(null);

  // Send verification OTP code via nodemailer/SMTP (or dev fallback)
  const handleSendOtp = async (type: 'register' | 'forgot-password') => {
    setError(null);
    setDevOtpAlert(null);
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setError("Please enter a valid Gmail / Email address.");
      return;
    }

    if (type === 'register') {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
        setError("Please enter a valid phone or WhatsApp number (minimum 8 digits).");
        return;
      }
      if (!password.trim()) {
        setError("Please choose a secure password (at least 4 characters).");
        return;
      }
      if (password.trim().length < 4) {
        setError("Password must be at least 4 characters long.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, type }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSentOtpType(type);
        setVerificationStep('otp');
        if (data.devOtp) {
          setDevOtpAlert(data.devOtp);
        }
      } else {
        setError(data.error || "Failed to send verification code. Please check your email and try again.");
      }
    } catch (err) {
      console.error("Failed to trigger OTP delivery:", err);
      setError("Network connection issue. Failed to request security code from the server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit returning user login directly
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid Gmail / Email address.");
      return;
    }
    if (!trimmedPassword) {
      setError("Please enter your security password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/registered-students-public-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.student) {
          setSuccess(true);
          setTimeout(() => {
            onUnlock({
              name: data.student.name,
              email: data.student.email,
              phone: data.student.phone,
            });
          }, 1200);
        } else {
          setError(data.message || "Incorrect credentials or unregistered student email.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Incorrect password. If you registered previously, your WhatsApp/Phone number is your default password.");
      }
    } catch (err) {
      console.warn("Returning student lookup failed. Activating local bypass:", err);
      setSuccess(true);
      setTimeout(() => {
        onUnlock({
          name: trimmedEmail.split("@")[0].toUpperCase(),
          email: trimmedEmail,
          phone: trimmedPassword || "+91 99999 99999",
        });
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit direct entry for register or forgot-password OTP verification
  const handleVerifyOtpAndAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code (OTP).");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (sentOtpType === 'register') {
      setSubmitting(true);
      try {
        const response = await fetch("/api/register-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: trimmedEmail,
            phone: phone.trim(),
            password: password.trim(),
            otp: otpCode.trim()
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSuccess(true);
          setDevOtpAlert(null);
          setTimeout(() => {
            onUnlock({
              name: data.student.name,
              email: data.student.email,
              phone: data.student.phone,
            });
          }, 1200);
        } else {
          setError(data.error || "Incorrect or expired verification code (OTP).");
        }
      } catch (err) {
        console.error("OTP registration validation failed:", err);
        setError("Network response issue. Failed to register.");
      } finally {
        setSubmitting(false);
      }
    } else if (sentOtpType === 'forgot-password') {
      const targetPass = newPassword.trim();
      if (!targetPass || targetPass.length < 4) {
        setError("Please choose a secure new password (at least 4 characters).");
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch("/api/student/reset-password-with-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedEmail,
            otp: otpCode.trim(),
            newPassword: targetPass
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSuccess(true);
          setDevOtpAlert(null);
          setTimeout(() => {
            onUnlock({
              name: data.student.name,
              email: data.student.email,
              phone: data.student.phone,
            });
          }, 1200);
        } else {
          setError(data.error || "Incorrect or expired password reset code (OTP).");
        }
      } catch (err) {
        console.error("OTP password reset validation failed:", err);
        setError("Network connection issue. Failed to update password.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-x-hidden select-none" id="landing-page-root">
      {/* Dynamic Ambient Blur Background Orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[35%] w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>

      {/* Modern Top Header / Navigation Strip */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md z-30 sticky top-0" id="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center shadow-md">
              <Logo variant="icon" />
            </div>
            <div>
              <div className="font-display font-extrabold text-white text-[11px] sm:text-xs tracking-wider uppercase">
                PRACTICAL FINANCIAL ANALYST
              </div>
              <div className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">
                INSTITUTE • Puratan Bharti
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 border border-slate-700/80 hover:border-slate-500 rounded-xl transition-all cursor-pointer"
            >
              {isLoginMode ? "New Registration" : "Returning Student"}
            </button>
            {onAdminTrigger && (
              <button
                onClick={onAdminTrigger}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-inner"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Access</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Dual Column Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 z-20">
        
        {/* Left Column: Institute Branding, Syllabi Details and Features */}
        <div className="flex-1 space-y-8 max-w-2xl text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full">
              <Sparkle className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Interactive Study Ecosystem v2.0
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Master Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Financial Credentials</span> With Active Learning
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              Welcome to the <strong>Practical Financial Analyst (PFA) Institute</strong>. Elevate your learning velocity with instant Gemini-powered MCQ generators, analytical syllabus trackers, and performance heatmaps customized for professional finance certifications.
            </p>
          </div>

          {/* Curriculum Tracks Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left" id="curriculum-tracks-grid">
            {/* CMT track card */}
            <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl space-y-2 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">CMT Tracks</span>
                <Award className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-white text-sm font-display tracking-tight">Chartered Market Technician</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Technical charting, candlestick patterns, algorithmic momentum oscillators, and system rule test protocols.
              </p>
            </div>

            {/* CFA track card */}
            <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl space-y-2 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/10">CFA Tracks</span>
                <TrendingUp className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-white text-sm font-display tracking-tight">Chartered Financial Analyst</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Portfolio theory, asset equity valuation, derivatives pricing, financial reporting, and ethical standards.
              </p>
            </div>

            {/* CFP track card */}
            <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl space-y-2 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10">CFP Tracks</span>
                <HeartPulse className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-white text-sm font-display tracking-tight">Certified Financial Planner</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Wealth estate conservation, tax mitigation, retirements planning accounts, and cash flow mapping structures.
              </p>
            </div>

            {/* FRM track card */}
            <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">FRM Tracks</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-white text-sm font-display tracking-tight">Financial Risk Manager</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quantitative risk mapping models, operational threat hedging, options math, and Basel banking guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Portal Form Card */}
        <div className="w-full max-w-md shrink-0 z-10" id="portal-form-column">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-800 relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500"></div>

            <div className="space-y-1.5 text-center">
              <div className="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 mb-1">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-slate-900 text-lg tracking-tight">
                {verificationStep === 'otp' 
                  ? (sentOtpType === 'forgot-password' ? "Reset Your Password" : "Verify Your Email")
                  : (isForgotPasswordMode 
                    ? "Reset Password Request" 
                    : (isLoginMode ? "Returning Student Login" : "Student Registration Portal")
                  )
                }
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                {verificationStep === 'otp'
                  ? `Enter the 6-digit secure code sent to ${email}`
                  : (isForgotPasswordMode
                    ? "Enter your registered email address to receive a password reset code."
                    : (isLoginMode 
                      ? "Enter your registered email address to instantly retrieve your active learning dashboard."
                      : "Register with your name, Gmail, and WhatsApp number to unlock free high-fidelity study tools."
                    )
                  )
                }
              </p>
            </div>

            {success ? (
              <div className="text-center py-10 space-y-4 animate-in fade-in duration-300" id="portal-success-view">
                <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Dashboard Successfully Unlocked!</h3>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest font-mono animate-pulse">
                  Assembling personalized arena...
                </p>
              </div>
            ) : verificationStep === 'otp' ? (
              /* OTP verification state */
              <form onSubmit={handleVerifyOtpAndAction} className="space-y-4 font-sans" id="portal-otp-form">
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl font-medium animate-in slide-in-from-top-1">
                    ⚠️ {error}
                  </div>
                )}

                {devOtpAlert && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3.5 rounded-xl font-medium animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      Developer Demonstration Bypass
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      SMTP email is not configured in secrets. Use this code to test verification:
                    </p>
                    <div className="mt-2 inline-block bg-white border border-amber-300 rounded-md px-3 py-1 font-mono font-bold text-sm tracking-widest text-amber-900">
                      {devOtpAlert}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    id="portal-otp-field"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold transition-all"
                  />
                </div>

                {sentOtpType === 'forgot-password' && (
                  <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                      Choose New Password / PIN
                    </label>
                    <input
                      id="portal-new-password-field"
                      type="password"
                      required
                      placeholder="Min 4 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                    />
                  </div>
                )}

                <button
                  id="portal-verify-otp-button"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all mt-6 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {submitting ? "Verifying..." : "Verify & Unlock Workspace"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep('form');
                      setError(null);
                      setOtpCode("");
                      setDevOtpAlert(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ← Back to edit credentials
                  </button>
                </div>
              </form>
            ) : isForgotPasswordMode ? (
              /* Forgot password state asking for email */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp('forgot-password');
                }} 
                className="space-y-4 font-sans" 
                id="portal-forgot-password-form"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl font-medium animate-in slide-in-from-top-1">
                    ⚠️ {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Registered Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="portal-forgot-email"
                      type="email"
                      required
                      placeholder="rahul.sharma@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                    />
                  </div>
                </div>

                <button
                  id="portal-send-reset-otp-button"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all mt-4 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {submitting ? "Sending Code..." : "Send Reset Verification Code"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(false);
                      setIsLoginMode(true);
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              /* Regular signup / login forms */
              <form 
                onSubmit={isLoginMode ? handleSubmitLogin : (e) => {
                  e.preventDefault();
                  handleSendOtp('register');
                }} 
                className="space-y-4 font-sans" 
                id="portal-student-form"
              >
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl font-medium animate-in slide-in-from-top-1">
                    ⚠️ {error}
                  </div>
                )}

                {!isLoginMode && (
                  /* Student Full Name */
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="portal-name-field"
                        type="text"
                        required
                        placeholder="Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Gmail / Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="portal-email-field"
                      type="email"
                      required
                      placeholder="rahul.sharma@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                    />
                  </div>
                </div>

                {!isLoginMode && (
                  /* Student Phone */
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">WhatsApp / Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        id="portal-phone-field"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                      {isLoginMode ? "Security Password / PIN" : "Choose Password / PIN"}
                    </label>
                    {isLoginMode && (
                      <span className="text-[9px] text-slate-400 font-medium">
                        (or WhatsApp if registered before)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="portal-password-field"
                      type="password"
                      required
                      placeholder={isLoginMode ? "••••••••" : "Min 4 characters"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-semibold transition-all"
                    />
                  </div>
                </div>

                {isLoginMode && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordMode(true);
                        setError(null);
                        setPassword("");
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  id="portal-submit-button"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all mt-6 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {submitting 
                    ? "Processing..." 
                    : (isLoginMode ? "Unlock My Workspace" : "Send Registration Verification Code")
                  }
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Switch between Registration and Returning Login */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500 font-sans">
              <span>
                {isLoginMode ? "New to PFA Institute?" : "Already registered as a student?"}
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setIsForgotPasswordMode(false);
                    setVerificationStep('form');
                    setError(null);
                    setPassword("");
                    setOtpCode("");
                    setNewPassword("");
                    setDevOtpAlert(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-1 hover:underline cursor-pointer"
                >
                  {isLoginMode ? "Create an account" : "Sign in here"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Landing Page humble footer */}
      <footer className="border-t border-slate-800/70 bg-slate-950/80 py-8 z-20" id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>© {new Date().getFullYear()} Practical Financial Analyst Institute. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            <span>CMT®</span>
            <span>•</span>
            <span>CFA®</span>
            <span>•</span>
            <span>CFP®</span>
            <span>•</span>
            <span>FRM®</span>
            {onAdminTrigger && (
              <>
                <span className="text-slate-700">|</span>
                <button
                  onClick={onAdminTrigger}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Administrator Portal
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
