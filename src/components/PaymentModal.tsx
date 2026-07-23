import React, { useState } from "react";
import { 
  X, QrCode, ShieldCheck, CheckCircle2, Sparkles, CreditCard, 
  Smartphone, ArrowRight, Loader2
} from "lucide-react";
import RazorpayQrPoster from "./RazorpayQrPoster";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEmail: string;
  onPaymentSuccess: (updatedStudent: any) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  studentEmail, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [verifying, setVerifying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = "99";

  if (!isOpen) return null;

  // Auto polling while modal is open
  React.useEffect(() => {
    if (!isOpen || !studentEmail) return;

    let isMounted = true;
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch("/api/student/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: studentEmail }),
        });
        const data = await response.json();
        if (isMounted && response.ok && data.isPaid) {
          setPaymentDone(true);
          setTimeout(() => {
            onPaymentSuccess(data.student);
            onClose();
          }, 1500);
        }
      } catch (err) {
        // Silent catch
      }
    };

    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, studentEmail]);

  const handleAutoVerifyPayment = async () => {
    setError(null);
    setVerifying(true);
    try {
      const response = await fetch("/api/student/auto-verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmail }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPaymentDone(true);
        setTimeout(() => {
          onPaymentSuccess(data.student);
          onClose();
        }, 1200);
      } else {
        setError(data.error || "Could not verify transaction automatically. Please try again.");
      }
    } catch (err) {
      console.error("Auto verification error:", err);
      setError("Network error contacting payment server.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative max-h-[90vh]" id="payment-modal-card">
        
        {/* Modal Top Border Accent */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 w-full"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {paymentDone ? (
            <div className="text-center py-8 space-y-4 animate-in scale-in" id="payment-success-step">
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-slate-900 text-xl tracking-tight">Payment Verified!</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Congratulations! Your PFA Institute student account is now upgraded to <strong className="text-slate-900">364-Day Academic Access</strong>!
                </p>
              </div>
              <p className="text-xs text-emerald-600 font-bold tracking-widest uppercase animate-pulse font-mono">
                Activating active MCQ generators...
              </p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  364-Day Academic Subscription
                </div>
                <h2 className="font-display font-extrabold text-slate-900 text-xl sm:text-2xl tracking-tight">
                  Unlock Unlimited MCQ Generators
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Attempt premium exam and interview preparation questions continuously for 364 days.
                </p>
              </div>

              {/* Price Tag */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100" id="pricing-tag">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Access Fee</div>
                  <div className="text-xs text-slate-500 font-medium">Valid for 364 Days</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 font-mono">₹99</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">364-Day Subscription</div>
                </div>
              </div>

              {/* Razorpay Gateway Box */}
              <div className="space-y-4" id="payment-gateways">
                <RazorpayQrPoster
                  amount={amount}
                  merchantName="PFA Institute"
                  subText="1-Year Unlimited Practice Access"
                />

                {/* Gateway Status Banner */}
                <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 text-center space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-emerald-950">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Automatic Payment Verification Active
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                    Click the Razorpay button above to pay ₹99 via UPI, GPay, PhonePe, Cards, or NetBanking. Once completed, your 364-day subscription activates automatically.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl font-medium animate-in slide-in-from-top-1" id="payment-error-banner">
                  ⚠️ {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  id="confirm-payment-button"
                  onClick={handleAutoVerifyPayment}
                  disabled={verifying}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 transition-all cursor-pointer"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Activating Access...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Complete Payment & Activate (364 Days)
                    </>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

        </div>

        {/* Secure Checkout Footer bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE SSL ENCRYPTED GATEWAY
          </span>
          <span>RAZORPAY • UPI • GPAY</span>
        </div>

      </div>
    </div>
  );
}
