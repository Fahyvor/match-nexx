import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import SleekToast, { toast } from "sleek-toast";

type Job = {
  id: string;
  title: string;
  type: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  experienceLevel: string;
  requirements: string[];
};

const JobApplication = () => {
  const { jobId } = useParams();
  const token = useSelector((state: RootState) => state.user.token);

  const [job, setJob] = useState<Job | null>(null);
  const [cv, setCV] = useState<File | null>(null);
  
  const [profile, setProfile] = useState({
    headline: "",
    summary: "",
    phone: "",
    location: "",
    portfolio: "",
    github: "",
    linkedin: "",
  });

  // Combined UI states into a cleaner loading manager
  const [status, setStatus] = useState({
    jobLoading: true,
    submitting: false,
  });

  // Reusable Axios configuration headers
  const authConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const fetchJob = useCallback(async () => {
    try {
      setStatus((p) => ({ ...p, jobLoading: true }));
      const res = await axios.get(`/api/jobs/get-single-job/${jobId}`, authConfig());
      if (res.status === 200) {
        setJob(res.data.data);
      }
    } catch (error) {
      console.error("Fetch job error:", error);
      toast.error("Unable to fetch job data");
    } finally {
      setStatus((p) => ({ ...p, jobLoading: false }));
    }
  }, [jobId, authConfig]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyProcess = async () => {
    try {
      setStatus((p) => ({ ...p, submitting: true }));

      // 1. Sync Profile Data
      await axios.put("/api/applicant/complete-profile", profile, authConfig());

      // 2. Upload CV if chosen
      if (cv) {
        const form = new FormData();
        form.append("cv", cv);
        await axios.put("/api/applicant/upload-cv", form, {
          headers: {
            ...authConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // 3. Complete Job Application
      const response = await axios.post(`/api/applicant/apply/${jobId}`, {}, authConfig());
      toast.success(response.data.message || "Application submitted successfully!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ message: string }>;
        toast.error(error.response?.data.message || "Application sequence failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setStatus((p) => ({ ...p, submitting: false }));
    }
  };

  if (status.jobLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-zinc-400 font-medium">
        Loading opportunities...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-zinc-400 font-medium">
        Target job listing could not be found.
      </div>
    );
  }

  // Common styling for dynamic layout inputs
  const inputStyle = "w-full border border-zinc-800 bg-[#141419] p-3 text-white placeholder-zinc-500 rounded-md outline-none focus:border-cyan-500 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 antialiased">
      <SleekToast />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Job Specification Details */}
        <div className="lg:col-span-7 bg-[#101014] border border-zinc-900 p-6 md:p-8 rounded-xl shadow-xl">
          <div className="border-b border-zinc-800 pb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/40 rounded-full mb-3">
              {job.type}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} {job.title}
            </h1>
            <p className="mt-2 text-lg text-zinc-400 font-medium">{job.company}</p>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">📍 {job.location}</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">₦{job.salary.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-200 mb-2">Job Overview</h3>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-200 mb-3">Core Requirements</h3>
              <ul className="grid gap-2 text-zinc-400">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-cyan-500 mt-1 select-none">✦</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Entry Action Forms */}
        <div className="lg:col-span-5 bg-[#101014] border border-zinc-900 p-6 md:p-8 rounded-xl shadow-xl space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Complete Profile</h2>
            <p className="text-sm text-zinc-500 mt-1">Review details before sending your application.</p>
          </div>

          <div className="space-y-4">
            <input name="headline" placeholder="Professional Headline" value={profile.headline} onChange={handleChange} className={inputStyle} />
            <textarea rows={3} name="summary" placeholder="Brief Professional Summary" value={profile.summary} onChange={handleChange} className={`${inputStyle} resize-none`} />
            
            <div className="grid md:grid-cols-2 gap-4">
              <input name="phone" placeholder="Phone Number" value={profile.phone} onChange={handleChange} className={inputStyle} />
              <input name="location" placeholder="Current City, Country" value={profile.location} onChange={handleChange} className={inputStyle} />
            </div>

            <input name="portfolio" placeholder="Portfolio Website URL" value={profile.portfolio} onChange={handleChange} className={inputStyle} />
            <input name="github" placeholder="GitHub Profile URL" value={profile.github} onChange={handleChange} className={inputStyle} />
            <input name="linkedin" placeholder="LinkedIn Profile URL" value={profile.linkedin} onChange={handleChange} className={inputStyle} />
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Upload Resume / CV (PDF Only)</label>
            <div className="w-full bg-[#141419] border border-dashed border-zinc-800 p-4 text-center rounded-md hover:border-zinc-700 transition cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setCV(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="text-sm text-zinc-400 block truncate">
                {cv ? `📄 ${cv.name}` : "Click to select file or drag drop"}
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyProcess}
            disabled={status.submitting}
            className="w-full mt-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 text-black py-3.5 px-4 font-bold rounded-md hover:opacity-95 transition-opacity active:scale-[0.99] transform disabled:opacity-50 disabled:pointer-events-none tracking-wide"
          >
            {status.submitting ? "Processing Application..." : "Submit Application"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default JobApplication;