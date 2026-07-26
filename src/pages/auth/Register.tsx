import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from "../../redux/store";
import axios from 'axios';
import SleekToast, { toast } from 'sleek-toast';
import { FaEyeSlash, FaEye } from "react-icons/fa";

export default function Register() {

  const { states } = useSelector((state: RootState) => state.states);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    state: '',
    country: '',
    years_of_experience: 0,
    email: '',
    password: '',
    userType: 'applicant' as 'applicant' | 'recruiter',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        years_of_experience: Number(formData.years_of_experience),
      };

      const response = await axios.post("/api/auth/register", payload);

      toast.success(response.data.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        toast.error(message);
        console.log("API Error:", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Unknown error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <SleekToast />
      <div className="flex items-center justify-center min-h-screen px-6 lg:py-12 py-4">
        <div className="w-full">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-linear-to-r from-accent-cyan/10 to-accent-pink/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="w-5/6 mx-auto bg-panel-bg border border-panel-border p-8 relative">
          <div className=" space-y-6 grid grid-cols-2 gap-4 ">
            {/* Status Indicator */}
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan-light dark:text-accent-cyan/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
              READY
            </div>

            {/* First Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
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
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="090xxxxxxxxxxx"
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className='text-xs font-mono tracking-widest text-zinc-400 uppcase'>State</label>
              <select
                className='w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700 autofill:bg-transparent'
                required
                value={formData.country}
                onChange={handleChange}
                name='country'
              >
                <option value="" disabled>Select Country</option>
                <option value="Nigeria">Nigeria</option>
                {/* {states?.map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))} */}
              </select>
            </div>

            <div className="space-y-2">
              <label className='text-xs font-mono tracking-widest text-zinc-400 uppcase'>State</label>
              <select
                className='w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700 autofill:bg-transparent'
                required
                value={formData.state}
                onChange={handleChange}
                name='state'
              >
                <option value="" disabled>Select State</option>
                {states?.map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                placeholder="Years of Experience"
                className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Password</label>
              <div className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 flex justify-between">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className=" w-full text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700 bg-transparent autofill:bg-transparent"
                />
                {showPassword ? <FaEye className='cursor-pointer' onClick={() => setShowPassword(!showPassword)}/> : <FaEyeSlash className='cursor-pointer' onClick={() => setShowPassword(!showPassword)}/>}
              </div>
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
                        : 'bg-white dark:bg-cyber-dark/50 border-zinc-800'
                    }`}>
                      {type === 'applicant' ? '👤 Applicant' : '💼 Recruiter'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>
          <div className="flex flex-col gap-6">
            <label className="flex items-start gap-3 text-[11px] text-zinc-400">
              <input type="checkbox" className="w-4 h-4 accent-accent-cyan mt-0.5" required />
              I agree to the Terms of Service and Privacy Policy
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 overflow-hidden group"
              disabled={isLoading}
            >
              <span className="relative z-10">{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <div className="absolute inset-0 bg-accent-cyan transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
            </button>

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-6">
              <p className="text-center text-zinc-500 text-xs">
                Already have an account?{' '}
                <a href="/login" className="text-accent-pink hover:underline font-mono">Sign In →</a>
              </p>
            </div>
          </div>
          {/* Terms Checkbox */}
          </form>
        </div>
      </div>
    </div>
  );
}