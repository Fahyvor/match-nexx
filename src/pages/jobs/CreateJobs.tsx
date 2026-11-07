import { useState } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';
import type { RootState } from "../../redux/store";
import SleekToast, { toast } from "sleek-toast";
import type { AxiosError } from "axios";
import { FaMagic, FaUndo, FaSpinner } from "react-icons/fa";
import api from "../../utils/api";

export default function CreateJobPage() {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    location: string;
    type: string;
    experienceLevel: string;
    company: string;
    salary: number;
    requirements: string[];
  }>({
    title: "",
    description: "",
    location: "",
    type: "",
    experienceLevel: "",
    company: "",
    salary: 0,
    requirements: [],
  });

  const [loading, setLoading] = useState(false);
  const [improvingDescription, setImprovingDescription] = useState(false);
  const [previousDescription, setPreviousDescription] = useState<string | null>(null);
  const { states } = useSelector((state: RootState) => state.states);
  const token = useSelector((state: RootState) => state.user.token);
  // console.log("Token", token)

  const handleImproveDescription = async () => {
    if (!form.description.trim() && !form.title.trim()) {
      toast.error("Please enter a job title or write a quick draft for AI to improve.");
      return;
    }

    try {
      setImprovingDescription(true);
      const draft = form.description.trim() || `Seeking a talented ${form.title} to join ${form.company || "our organization"}.`;

      const response = await api.jobs.improveDescription({
        title: form.title,
        company: form.company,
        description: draft,
        requirements: form.requirements,
        experienceLevel: form.experienceLevel,
        type: form.type,
        location: form.location,
      });

      const improved = response?.data?.data || response?.data?.improvedDescription || response?.data?.message;

      if (improved && typeof improved === "string") {
        setPreviousDescription(form.description);
        setForm((prev) => ({ ...prev, description: improved }));
        toast.success("Job description enhanced with AI! You can edit any part of it below.");
      } else {
        toast.error("Could not enhance description. You can still write it manually.");
      }
    } catch (err: unknown) {
      console.error("Failed to improve description:", err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message || "Failed to improve job description with AI.");
    } finally {
      setImprovingDescription(false);
    }
  };

  const handleRevertDescription = () => {
    if (previousDescription !== null) {
      setForm((prev) => ({ ...prev, description: previousDescription }));
      setPreviousDescription(null);
      toast.info("Reverted to original description.");
    }
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const numericFields = ["salary"];

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === ""
          ? 0
          : Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/jobs/create-job",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success(response.data.message);
        window.location.href = "/jobs";
      }

    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ message?: string; error?: string }>;

        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Request failed";

        toast.error(message);
      } else {
        toast.error("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white px-6 lg:px-16 py-16">
      <SleekToast />
      <h1 className="text-4xl font-extrabold mb-10 uppercase">
        Create Job
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#0f0f12] border border-zinc-800 p-8 space-y-6 grid lg:grid-cols-2 gap-4"
      >
        <div className="job_title">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Job Title</label>
          <input
            placeholder="Job Title"
            value={form.title}
            name="title"
            onChange={handleChange}
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
            required
          />
        </div>

        <div className="company_name">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Company</label>
          <input
            placeholder="Company"
            value={form.company}
            name="company"
            onChange={handleChange}
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
            required
          />
        </div>

        <div className="job_type">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Job Type</label>
          <select
            value={form.type}
            title="type"
            onChange={handleChange}
            name="type"
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-zinc-700 dark:text-zinc-300"
          >
            <option value="" disabled>
              Select Job Type
            </option>

            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Experience Level</label>
          <select
            value={form.experienceLevel}
            name="experienceLevel"
            onChange={handleChange}
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-zinc-700 dark:text-zinc-300"
          >
            <option value="" disabled>
              Experience Level
            </option>

            <option value="junior">Junior (0–2 years)</option>
            <option value="mid">Mid-level (2–5 years)</option>
            <option value="senior">Senior (5+ years)</option>
            <option value="lead">Lead / Manager</option>
          </select>
        </div>


        <div className="">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Salary</label>
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={form.salary}
            onChange={handleChange}
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="space-y-2">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>State</label>
          <select
            className='w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700 autofill:bg-transparent'
            required
            value={form.location}
            onChange={handleChange}
            name='location'
          >
            <option value="" disabled>Select State</option>
            {states?.map((state: string) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono tracking-widest text-white uppercase">
            Requirements
          </label>

          {/* Input */}
          <div className="mt-2 w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-3 py-2">
            <input
              type="text"
              placeholder="Add requirement and press Enter"
              className="w-full bg-transparent outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();

                  const value = e.currentTarget.value.trim();

                  setForm((prev) => ({
                    ...prev,
                    requirements: [...prev.requirements, value],
                  }));

                  e.currentTarget.value = "";
                }
              }}
            />
          </div>

          {/* Display Added Requirements */}
          {form.requirements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.requirements.map((req, index) => (
                <span
                  key={index}
                  className="bg-[#1a1a1f] border border-zinc-700 text-xs px-3 py-2 rounded-md flex items-center gap-2"
                >
                  {req}

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        requirements: prev.requirements.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono tracking-widest text-white uppercase">
                Job Description
              </label>
              {previousDescription !== null && (
                <span className="text-[10px] font-mono uppercase bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan px-2 py-0.5 rounded">
                  AI Enhanced • Editable
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {previousDescription !== null && (
                <button
                  type="button"
                  onClick={handleRevertDescription}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono uppercase tracking-wider rounded border border-zinc-700 transition-colors cursor-pointer"
                >
                  <FaUndo className="text-[10px]" />
                  <span>Revert to original</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleImproveDescription}
                disabled={improvingDescription}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-accent-cyan to-accent-pink hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {improvingDescription ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Improving with AI...</span>
                  </>
                ) : (
                  <>
                    <FaMagic className="text-xs" />
                    <span>Improve with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 font-mono">
            Type or draft your description, then click &ldquo;Improve with AI&rdquo; to enhance clarity, structure, and appeal. You can edit any part of the text.
          </p>

          <textarea
            placeholder="Provide an overview of the role, key responsibilities, or draft notes. Click 'Improve with AI' to enhance it professionally..."
            value={form.description}
            onChange={handleChange}
            rows={10}
            name="description"
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600 font-sans leading-relaxed"
            required
          />

          <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
            <span>All text remains 100% editable before and after submission.</span>
            <span>{form.description.length} characters</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#00E5FF] to-[#FF0055] px-8 py-3 font-bold text-black cursor-pointer"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>

          <button
            type="button"
            onClick={() => (window.history.back())}
            className="border border-zinc-700 px-8 py-3"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}