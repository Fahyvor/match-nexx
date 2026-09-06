import { useState } from "react";
import api from "../utils/api";
import SleekToast, { toast } from "sleek-toast";
import { FaTimes } from "react-icons/fa";

interface CvPaywallModalProps {
  onSuccess?: () => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  badgeText?: string;
  buttonText?: string;
}

export default function CvPaywallModal({
  onSuccess,
  onClose,
  title = "Download Your Professional CV",
  description = "Pay a one-time fee of ₦2,000 to unlock and download your personal, ATS-optimized CV in high-resolution PDF format.",
  badgeText = "PAYMENT REQUIRED TO DOWNLOAD",
  buttonText = "Pay ₦2,000 to Download CV →",
}: CvPaywallModalProps) {
  void onSuccess;
  const [loading, setLoading] = useState(false);

  const handlePayCv = async () => {
    try {
      setLoading(true);

      const res = (await api.payments.initializeCvPayment()) as {
        success?: boolean;
        message?: string;
        data?: {
          checkoutUrl?: string;
          checkout_url?: string;
          authorizationUrl?: string;
        };
      };

      console.log("CV PAYMENT INITIALIZE RESPONSE:", res);

      if (!res?.success) {
        toast.error(
          res?.message || "Unable to initialize CV payment."
        );
        return;
      }

      /**
       * Bachs should return the checkout URL.
       */
      const checkoutUrl =
        res?.data?.checkoutUrl ||
        res?.data?.checkout_url ||
        res?.data?.authorizationUrl;

      if (!checkoutUrl) {
        console.error(
          "Bachs checkout URL missing:",
          res
        );

        toast.error(
          "Payment initialized but checkout URL was not returned."
        );

        return;
      }

      /**
       * Redirect user to Bachs checkout.
       */
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      console.error(
        "CV PAYMENT INITIALIZATION ERROR:",
        err
      );

      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const message =
        errorObj?.response?.data?.message ||
        errorObj?.response?.data?.error ||
        errorObj?.message ||
        "CV Payment initialization failed.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="w-full max-w-lg bg-panel-bg border border-accent-cyan/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button if in overlay mode */}
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/60 transition-colors z-20 cursor-pointer"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      )}

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan text-xs font-mono tracking-widest uppercase rounded-full">
        <span className="w-2 h-2 bg-accent-cyan animate-ping rounded-full" />
        {badgeText}
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm text-white leading-relaxed max-w-md mx-auto">
        {description}
      </p>

      {/* Payment Information */}
      <div className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-white">
            CV Download & ATS Export Fee
          </span>

          <span className="text-accent-cyan font-bold text-base">
            ₦2,000
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 text-left leading-normal">
          ✓ High resolution PDF export ready for job applications.
          <br />
          ✓ ATS-optimized formatting for recruiter platforms.
          <br />
          ✓ Permanent access to update and download your CV.
        </p>
      </div>

      {/* Pay */}
      <button
        onClick={handlePayCv}
        disabled={loading}
        className="w-full py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-accent-cyan via-teal-400 to-accent-pink text-black rounded-xl shadow-lg hover:shadow-accent-cyan/30 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Initializing Payment..." : buttonText}
      </button>

      {/* Footer */}
      <p className="text-[11px] text-zinc-500 font-mono">
        Non-transferable • Tied strictly to your authenticated profile
      </p>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <SleekToast />
        {modalContent}
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-black flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
      <SleekToast />
      {modalContent}
    </div>
  );
}