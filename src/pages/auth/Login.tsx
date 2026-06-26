import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SleekToast, { toast } from 'sleek-toast';
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/slices/userSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await dispatch(loginUser({ email, password }));

      console.log("DISPATCH RESULT:", result);

      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;

        toast.success('Login successful', 4000);

        navigate(
          user.role === 'applicant'
            ? '/applicant/dashboard'
            : '/recruiter/dashboard'
        );
      } else {
        const errorMessage =
          (result.payload as string) ||
          result.error.message ||
          'Login failed';

        console.log("ERROR HANDLED, NO NAVIGATION");

        toast.error(errorMessage, 4000);
        return;
      }
    } catch (err: unknown) {
      let message = 'Something went wrong';

      if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message, 4000);
      console.log(err);
      return;
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <SleekToast />
      <div className="flex items-center justify-center h-screen px-6">
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
            <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">Welcome Back</h1>
            <p className="text-xs font-mono tracking-widest text-zinc-500">AUTHENTICATION_PROTOCOL</p>
          </div>

          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-accent-cyan/10 to-accent-pink/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="relative bg-panel-bg border border-panel-border p-8 space-y-6">
            {/* Status Indicator */}
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
              ACTIVE
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Password</label>
              <div className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 flex justify-between">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
                />
                {showPassword ? <FaEye className='cursor-pointer' onClick={() => setShowPassword(!showPassword)}/> : <FaEyeSlash className='cursor-pointer' onClick={() => setShowPassword(!showPassword)}/>}
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-[11px]">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-accent-cyan" />
                Remember me
              </label>
              <a href="#" className="text-accent-cyan hover:underline">Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink hover:shadow-[0_0_30px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group"
              disabled={isLoggingIn}
            >
              <span className="relative z-10">{isLoggingIn ? 'Authenticating...' : 'Authenticate'}</span>
              <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
            </button>

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-6">
              <p className="text-center text-zinc-500 text-xs">
                New to HireFlow?{' '}
                <a href="/register" className="text-accent-cyan hover:underline font-mono">Create Account →</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}