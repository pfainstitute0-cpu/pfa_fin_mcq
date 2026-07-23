import React, { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

interface RazorpayQrPosterProps {
  amount?: string;
  merchantName?: string;
  subText?: string;
  paymentButtonId?: string;
  upiId?: string;
  posterImageUrl?: string;
}

export default function RazorpayQrPoster({
  amount = "99",
  merchantName = "PFA Institute",
  subText = "1-Year Unlimited Practice Access",
  paymentButtonId = "pl_SMNyU0d2QFc2Pb"
}: RazorpayQrPosterProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      // Clear existing children to avoid duplicate scripts on re-render
      formRef.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", paymentButtonId);
      script.async = true;

      formRef.current.appendChild(script);
    }
  }, [paymentButtonId]);

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xl overflow-hidden relative font-sans select-none" id="razorpay-checkout-container">
      {/* Top Header: Powered by Razorpay */}
      <div className="relative z-10 text-center mb-4">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Official Payment Gateway
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span className="font-black text-slate-900 text-2xl tracking-tighter italic font-display flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 rounded-xs transform -skew-x-12 shadow-sm">
              <span className="text-white font-black text-xs not-italic">R</span>
            </span>
            <span className="text-blue-950 font-black">Razorpay</span>
          </span>
        </div>
      </div>

      {/* Merchant & Access Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center space-y-1 mb-4">
        <h3 className="font-display font-extrabold text-slate-900 text-lg tracking-tight">
          {merchantName}
        </h3>
        <p className="text-xs text-slate-500 font-medium">{subText}</p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1 px-3.5 py-1 bg-emerald-600 text-white rounded-full text-xs font-black font-mono shadow-xs">
            Amount: ₹{amount} INR
          </span>
        </div>
      </div>

      {/* Official Razorpay Script Payment Button Container */}
      <div className="flex flex-col items-center justify-center py-3 px-2 bg-slate-50/50 rounded-2xl border border-slate-200/80 shadow-inner">
        <form ref={formRef} className="w-full flex justify-center items-center min-h-[48px]"></form>
      </div>

      {/* Supported Payment Options & Security */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Secured by Razorpay • Instant Access</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          <span>UPI</span>
          <span>•</span>
          <span>GPay</span>
          <span>•</span>
          <span>PhonePe</span>
          <span>•</span>
          <span>Cards & NetBanking</span>
        </div>
      </div>
    </div>
  );
}
