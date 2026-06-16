import { useState } from "react";
import axios from "axios";

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

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
        className="max-w-2xl bg-[#0f0f12] border border-zinc-800 p-8 space-y-6"
      >
        <input
          placeholder="Job Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full bg-black border border-zinc-700 px-4 py-3"
          required
        />

        <textarea
          placeholder="Job Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full bg-black border border-zinc-700 px-4 py-3"
          required
        />

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
          className="w-full bg-black border border-zinc-700 px-4 py-3"
        />

        <input
          placeholder="Job Type (Remote, Full-time...)"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="w-full bg-black border border-zinc-700 px-4 py-3"
        />

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