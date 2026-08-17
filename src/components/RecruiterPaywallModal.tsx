import { useState } from 'react';
import api from '../utils/api';
import SleekToast, { toast } from 'sleek-toast';

interface RecruiterPaywallModalProps {
  onSuccess: () => void;
}

export default function RecruiterPaywallModal({ onSuccess }: RecruiterPaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const res: any = await api.payments.activateSubscription(selectedPlan);

      if (res.success) {
        toast.success(res.message || 'Subscription activated successfully! Talent pool unlocked.');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        toast.error(res.message || 'Payment initialization failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Subscription payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-panel-bg/80 backdrop-blur-md">
      <SleekToast />
      <div className="w-full max-w-xl bg-panel-bg border border-accent-pink/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-pink/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-pink/10 border border-accent-pink/40 text-accent-pink text-xs font-mono tracking-widest uppercase rounded-full">
            <span className="w-2 h-2 bg-accent-pink animate-ping rounded-full" />
            RECRUITER ACCESS RESTRICTED
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase text-zinc-900 dark:text-white">
            Unlock Talent Access
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            You must have an active recruiter subscription to search, review, and contact qualified candidates in our verified talent network.
          </p>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="plan"
              value="monthly"
              checked={selectedPlan === 'monthly'}
              onChange={() => setSelectedPlan('monthly')}
              className="sr-only"
            />
            <div className={`p-5 rounded-xl border text-center transition-all ${
              selectedPlan === 'monthly'
                ? 'border-accent-pink bg-accent-pink/10 shadow-[0_0_25px_rgba(255,0,85,0.2)]'
                : 'border-zinc-800 bg-white dark:bg-cyber-dark/50 hover:border-zinc-700'
            }`}>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-1">Monthly Plan</span>
              <span className="text-2xl font-black text-accent-pink block">₦15,000</span>
              <span className="text-[10px] text-zinc-500 font-mono">Billed monthly • Unlimited candidate views</span>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="plan"
              value="yearly"
              checked={selectedPlan === 'yearly'}
              onChange={() => setSelectedPlan('yearly')}
              className="sr-only"
            />
            <div className={`p-5 rounded-xl border text-center transition-all ${
              selectedPlan === 'yearly'
                ? 'border-accent-cyan bg-accent-cyan/10 shadow-[0_0_25px_rgba(0,229,255,0.2)]'
                : 'border-zinc-800 bg-white dark:bg-cyber-dark/50 hover:border-zinc-700'
            }`}>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-1">Yearly Plan</span>
              <span className="text-2xl font-black text-accent-cyan-light dark:text-accent-cyan block">₦150,000</span>
              <span className="text-[10px] text-accent-lime font-mono">Save 17% • 12 Months Access</span>
            </div>
          </label>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full relative py-4 px-6 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-accent-pink to-purple-600 text-white rounded-xl shadow-lg hover:shadow-accent-pink/30 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'Processing Payment...' : `Subscribe Now (₦${selectedPlan === 'monthly' ? '15,000' : '150,000'}) →`}
        </button>

        <p className="text-center text-[11px] text-zinc-500 font-mono mt-4">
          Instant activation • Cancel anytime from settings
        </p>
      </div>
    </div>
  );
}
