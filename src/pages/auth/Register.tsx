import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'applicant' as 'applicant' | 'recruiter',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userRole', formData.userType);
    navigate(formData.userType === 'applicant' ? '/applicant/dashboard' : '/recruiter/dashboard');
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <div className="flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12" />
                <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 mix-blend-screen" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase font-mono">HIRE.FLOW</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">Join the Network</h1>
          </div>

          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-accent-cyan/10 to-accent-pink/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="relative bg-panel-bg border border-panel-border p-8 space-y-6">
            {/* Status Indicator */}
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
              READY
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.com"
                className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['applicant', 'recruiter'].map(type => (
                  <label key={type} className="cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value={type}
                      checked={formData.userType === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`px-4 py-3 text-xs font-mono text-center uppercase tracking-widest border transition-all ${
                      formData.userType === type
                        ? `bg-accent-${type === 'applicant' ? 'cyan' : 'pink'}/20 border-accent-${type === 'applicant' ? 'cyan' : 'pink'}`
                        : 'bg-cyber-dark/50 border-zinc-800'
                    }`}>
                      {type === 'applicant' ? '👤 Applicant' : '💼 Recruiter'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 text-[11px] text-zinc-400">
              <input type="checkbox" className="w-4 h-4 accent-accent-cyan mt-0.5" required />
              I agree to the Terms of Service and Privacy Policy
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 overflow-hidden group"
            >
              <span className="relative z-10">Initialize Account</span>
              <div className="absolute inset-0 bg-accent-cyan transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
            </button>

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-6">
              <p className="text-center text-zinc-500 text-xs">
                Already have an account?{' '}
                <a href="/login" className="text-accent-pink hover:underline font-mono">Sign In →</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}