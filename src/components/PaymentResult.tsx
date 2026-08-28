import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft, 
  FaHome, 
  FaRedoAlt
} from "react-icons/fa";
import api from "../utils/api";
import SleekToast, { toast } from "sleek-toast";

interface PaymentResultProps {
  onSuccess?: () => void;
  onRetry?: () => void;
}

interface PaymentDataDetails {
  transactionId?: string;
  chargeId?: string;
  paidAt?: string;
  [key: string]: unknown;
}

export default function PaymentResult({ onSuccess, onRetry }: PaymentResultProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "failure" | "unknown">("unknown");
  const [paymentData, setPaymentData] = useState<PaymentDataDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkoutId = searchParams.get("checkout_id");
  const chargeId = searchParams.get("charge_id");
  const statusParam = searchParams.get("status");
  // const plan = searchParams.get("plan");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        // If status is explicitly provided in URL
        if (statusParam === "success" || statusParam === "successful") {
          setStatus("success");
          setLoading(false);
          if (onSuccess) onSuccess();
          return;
        }

        if (statusParam === "failed" || statusParam === "cancelled") {
          setStatus("failure");
          setErrorMessage("Payment was cancelled or failed.");
          setLoading(false);
          return;
        }

        // If we have checkout_id, verify with backend
        if (checkoutId) {
          // Fix: Only include chargeId if it exists and is not null
          const verifyPayload: { checkoutId: string; chargeId?: string } = {
            checkoutId,
          };
          
          if (chargeId) {
            verifyPayload.chargeId = chargeId;
          }

          const response = (await api.payments.verifyPayment(verifyPayload)) as {
            status?: number;
            data?: { success?: boolean; message?: string; [key: string]: unknown };
          };

          console.log("Response after payment", response)

          if (response?.data?.success === true || response?.status === 200) {
            setStatus("success");
            setPaymentData(response.data as PaymentDataDetails);
            if (onSuccess) onSuccess();
          } else {
            setStatus("failure");
            setErrorMessage(response?.data?.message || "Payment verification failed.");
          }
        } else {
          // No parameters - check if user has already paid
          const statusResponse = (await api.payments.getCvStatus()) as {
            data?: { hasPaidCv?: boolean; [key: string]: unknown };
          };
          if (statusResponse?.data?.hasPaidCv) {
            setStatus("success");
            setPaymentData(statusResponse.data as PaymentDataDetails);
          } else {
            setStatus("unknown");
            setErrorMessage("No payment information found.");
          }
        }
      } catch (error: unknown) {
        console.error("Payment verification error:", error);
        setStatus("failure");
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        setErrorMessage(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to verify payment status."
        );
        toast.error("Payment verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [checkoutId, chargeId, statusParam, onSuccess]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate("/applicant/cv/payment");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-black flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
        <SleekToast />
        <div className="w-full max-w-lg bg-panel-bg border border-accent-cyan/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan text-xs font-mono tracking-widest uppercase rounded-full">
            <span className="w-2 h-2 bg-accent-cyan animate-ping rounded-full" />
            VERIFYING PAYMENT
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Please Wait</h3>
              <p className="text-sm text-zinc-400">
                Verifying your payment status...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <div className="min-h-[70vh] bg-black flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
        <SleekToast />
        
        <div className="w-full max-w-lg bg-panel-bg border border-green-500/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6 animate-in fade-in duration-500">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/40 text-green-400 text-xs tracking-widest uppercase rounded-full">
            <FaCheckCircle className="w-3 h-3" />
            PAYMENT SUCCESSFUL
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/40">
              <FaCheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
            CV Builder Unlocked! 🎉
          </h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Your payment of{" "}
            <strong className="text-green-400 font-bold">₦2,000</strong>{" "}
            was successful. You now have full access to the CV Builder.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="p-4 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded-xl space-y-2 text-left">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Transaction ID</span>
                <span className="text-zinc-300 truncate max-w-[200px]">
                  {paymentData.transactionId || paymentData.chargeId || checkoutId || "N/A"}
                </span>
              </div>
              {paymentData.paidAt && (
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Date</span>
                  <span className="text-zinc-300">
                    {new Date(paymentData.paidAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Amount</span>
                <span className="text-green-400 font-bold">₦2,000</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/applicant/cv/builder")}
              className="w-full py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 text-black rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <FaCheckCircle className="w-4 h-4" />
              Start Building Your CV →
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full py-3 px-6 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FaHome className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-zinc-500 font-mono">
            Your CV Builder is now permanently unlocked for this account
          </p>
        </div>
      </div>
    );
  }

  // Failure State
  if (status === "failure") {
    return (
      <div className="min-h-[70vh] bg-black flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
        <SleekToast />
        
        <div className="w-full max-w-lg bg-panel-bg border border-red-500/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6 animate-in fade-in duration-500">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono tracking-widest uppercase rounded-full">
            <FaTimesCircle className="w-3 h-3" />
            PAYMENT FAILED
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/40">
              <FaTimesCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
            Payment Not Completed
          </h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            {errorMessage || "Your payment could not be processed. Please try again."}
          </p>

          {/* Error Details */}
          <div className="p-4 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 font-mono">
              {checkoutId ? `Checkout ID: ${checkoutId}` : "No transaction reference found"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <FaRedoAlt className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full py-3 px-6 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-zinc-500 font-mono">
            Need help? Contact support at support@example.com
          </p>
        </div>
      </div>
    );
  }

  // Unknown State
  return (
    <div className="min-h-[70vh] bg-black flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
      <SleekToast />
      
      <div className="w-full max-w-lg bg-panel-bg border border-zinc-700/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-zinc-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-500/10 border border-zinc-500/40 text-zinc-400 text-xs font-mono tracking-widest uppercase rounded-full">
          <FaTimesCircle className="w-3 h-3" />
          NO PAYMENT FOUND
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
          Payment Information Not Found
        </h2>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          We couldn't find any payment information. Please try initiating a new payment.
        </p>

        <button
          onClick={() => navigate("/applicant/cv/payment")}
          className="w-full py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-accent-cyan via-teal-400 to-accent-pink text-black rounded-xl shadow-lg hover:shadow-accent-cyan/30 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Initiate Payment
        </button>
      </div>
    </div>
  );
}