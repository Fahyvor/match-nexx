import { useState } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';
import type { RootState } from "../../redux/store";
import SleekToast, { toast } from "sleek-toast";
import type { AxiosError } from "axios";

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
  const { states } = useSelector((state: RootState) => state.states);
  const token = useSelector((state: RootState) => state.user.token);
  // console.log("Token", token)


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

        <div className="">
          <label className='text-xs font-mono tracking-widest text-white uppcase'>Job Description</label>
          <textarea
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            name="description"
            className="w-full bg-white dark:bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
            required
          />
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