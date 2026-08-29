import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SleekToast, { toast } from 'sleek-toast';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing password reset token', 4000);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long', 4000);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.resetPassword({ token, password });
      if (response && response.success !== false) {
        setIsSuccess(true);
        toast.success(response.message || 'Password reset successfully!', 4000);
      } else {
        toast.error(response.message || 'Failed to reset password', 4000);
      }
    } catch (err: unknown) {
      let message = 'Failed to reset password. Token may have expired.';
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
      <div className="flex items-center justify-center min-h-screen lg:py-24 py-3 px-6 relative">
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
            <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">Reset Password</h1>
            <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">UPDATE_CREDENTIALS_PROTOCOL</p>
          </div>

          {!token ? (
            /* Invalid/Missing Token State */
            <div className="relative bg-panel-bg border border-panel-border p-8 text-center space-y-6">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <FaExclamationTriangle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Invalid Reset Link</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This password reset link is invalid or missing a security token. Please request a new link.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="w-full block py-3 text-xs font-bold uppercase tracking-widest bg-accent-pink hover:bg-accent-pink/90 text-white text-center transition-colors"
              >
                Request New Link
              </Link>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="relative bg-panel-bg border border-panel-border p-8 text-center space-y-6">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <FaCheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Password Reset!</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-accent-pink hover:bg-accent-pink/90 text-white transition-colors cursor-pointer"
              >
                Proceed to Login →
              </button>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleSubmit} className="relative bg-panel-bg border border-panel-border p-8 space-y-6">
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan-light dark:text-accent-cyan/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
                SECURE
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                  <FaLock className="text-accent-cyan" /> New Password
                </label>
                <div className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 flex items-center justify-between focus-within:border-accent-cyan transition-colors">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                  <FaLock className="text-accent-cyan" /> Confirm New Password
                </label>
                <div className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 flex items-center justify-between focus-within:border-accent-cyan transition-colors">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-zinc-500 hover:text-zinc-300 ml-2 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] font-mono text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!!password && !!confirmPassword && password !== confirmPassword)}
                className="w-full relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink hover:shadow-[0_0_30px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'Updating Password...' : 'Reset Password'}
                </span>
                <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
