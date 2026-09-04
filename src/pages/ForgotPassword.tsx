import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SleekToast, { toast } from 'sleek-toast';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address', 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.forgotPassword({ email: email.trim() });
      if (response && response.success !== false) {
        setIsSubmitted(true);
        toast.success(response.message || 'Password reset link sent to your email', 4000);
      } else {
        toast.error(response.message || 'Failed to send reset link', 4000);
      }
    } catch (err: unknown) {
      let message = 'An error occurred while sending the reset link';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { message?: string; error?: string } } };
        message = errorObj.response?.data?.message || errorObj.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <SleekToast />
      <div className="flex items-center justify-center min-h-screen lg:py-24 py-6 px-6 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent-cyan/10 to-accent-pink/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12" />
                <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 mix-blend-screen" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase font-mono">MATCH.NEXX</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">Forgot Password</h1>
            <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">PASSWORD_RECOVERY_PROTOCOL</p>
          </div>

          {!isSubmitted ? (
            /* Form Container */
            <form onSubmit={handleSubmit} className="relative bg-panel-bg border border-panel-border p-8 space-y-6">
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan-light dark:text-accent-cyan/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
                RECOVERY
              </div>

              <p className="text-sm text-white leading-relaxed">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-white uppercase flex items-center gap-2">
                  <FaEnvelope className="text-accent-cyan" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink hover:shadow-[0_0_30px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    'Sending Instructions...'
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" /> Send Reset Link
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
              </button>

              {/* Divider */}
              <div className="border-t border-zinc-800 pt-6">
                <p className="text-center text-zinc-500 text-xs">
                  Remember your password?{' '}
                  <Link to="/login" className="text-accent-cyan-light dark:text-accent-cyan hover:underline font-mono">
                    Back to Login →
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* Confirmation Container */
            <div className="relative bg-panel-bg border border-panel-border p-8 text-center space-y-6">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <FaCheckCircle className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Check Your Inbox</h2>
                <p className="text-xs text-white leading-relaxed">
                  If an account exists for <span className="text-accent-cyan font-mono">{email}</span>, you will receive an email with instructions on how to reset your password.
                </p>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-800 text-xs text-white text-left space-y-2 font-mono">
                <p className="text-accent-pink font-semibold">Did not receive an email?</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500">
                  <li>Check your spam/junk folder</li>
                  <li>Verify that you entered the correct email address</li>
                  <li>Wait a few minutes before trying again</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-2.5 text-xs font-mono uppercase tracking-wider bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
                >
                  Try Another Email
                </button>

                <Link
                  to="/login"
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-widest bg-accent-pink hover:bg-accent-pink/90 text-white text-center transition-colors flex items-center justify-center gap-2"
                >
                  <FaArrowLeft className="text-xs" /> Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}