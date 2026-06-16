import { useState } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';
import type { RootState } from "../../redux/store";

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [loading, setLoading] = useState(false);
  const { states } = useSelector((state: RootState) => state.states);
  const token = useSelector((state: RootState) => state.user.token);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3000/jobs",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // redirect after success
      window.location.href = "/jobs";
    } catch (err) {
      console.error(err);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white px-6 lg:px-16 py-16">
      <h1 className="text-4xl font-extrabold mb-10 uppercase">
        Create Job
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#0f0f12] border border-zinc-800 p-8 space-y-6 grid lg:grid-cols-2 gap-4"
      >
        <input
          placeholder="Job Title"
          value={form.title}
          name="title"
          onChange={handleChange}
          className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
          required
        />

        <select
          value={form.type}
          title="type"
          onChange={handleChange}
          className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-zinc-300"
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

        <select
          value={form.experienceLevel}
          name="experienceLevel"
          onChange={handleChange}
          className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-zinc-300"
        >
          <option value="" disabled>
            Experience Level
          </option>

          <option value="junior">Junior (0–2 years)</option>
          <option value="mid">Mid-level (2–5 years)</option>
          <option value="senior">Senior (5+ years)</option>
          <option value="lead">Lead / Manager</option>
        </select>

        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Min Salary"
            value={form.salaryMin}
            name="salaryMin"
            onChange={handleChange}
            className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan"
          />

          <input
            type="number"
            placeholder="Max Salary"
            value={form.salaryMax}
            onChange={(e) =>
              setForm({ ...form, salaryMax: e.target.value })
            }
            className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <textarea
          placeholder="Job Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700"
          required
        />

        <div className="space-y-2">
              <label className='text-xs font-mono tracking-widest text-zinc-400 uppcase'>State</label>
              <select
                className='w-full bg-cyber-dark/50 border border-zinc-800 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-700 autofill:bg-transparent'
                required
                value={form.location}
                onChange={handleChange}
                name='state'
              >
                <option value="" disabled>Select State</option>
                {states?.map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#00E5FF] to-[#FF0055] px-8 py-3 font-bold text-black"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/jobs")}
            className="border border-zinc-700 px-8 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}