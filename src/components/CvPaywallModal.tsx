import { useState } from 'react';
import api from '../utils/api';
import SleekToast, { toast } from 'sleek-toast';

interface CvPaywallModalProps {
  onSuccess: () => void;
}

export default function CvPaywallModal({ onSuccess }: CvPaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePayCv = async () => {
    try {
      setLoading(true);
      const res: any = await api.payments.verifyCvPayment();

      if (res.success) {
        toast.success(res.message || '₦1,000 Payment verified! Your CV Builder is unlocked.');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        toast.error(res.message || 'CV Payment failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'CV Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
      <SleekToast />
      <div className="w-full max-w-lg bg-panel-bg border border-accent-cyan/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan text-xs font-mono tracking-widest uppercase rounded-full">
          <span className="w-2 h-2 bg-accent-cyan animate-ping rounded-full" />
          CV BUILDER UNLOCK REQUIRED
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
          Construct Your Professional CV
        </h2>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          Pay a one-time fee of <strong className="text-accent-cyan font-bold">₦1,000</strong> to construct, generate AI summaries, edit, and export your personal ATS-optimized CV.
        </p>

        <div className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Personal Account CV Fee</span>
            <span className="text-accent-cyan font-bold text-base">₦1,000</span>
          </div>
          <p className="text-[11px] text-zinc-500 text-left leading-normal">
            ✓ Valid exclusively for your personal user profile.<br />
            ✓ AI Professional Summary generation.<br />
            ✓ High resolution PDF export & ATS optimization.
          </p>
        </div>

        <button
          onClick={handlePayCv}
          disabled={loading}
          className="w-full py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-accent-cyan via-teal-400 to-accent-pink text-black rounded-xl shadow-lg hover:shadow-accent-cyan/30 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Verifying ₦1,000 Payment...' : 'Pay ₦1,000 to Unlock CV Builder →'}
        </button>

        <p className="text-[11px] text-zinc-500 font-mono">
          Non-transferable • Tied strictly to your authenticated profile
        </p>
      </div>
    </div>
  );
}
