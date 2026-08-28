import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

type Job = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  status: string;
  experienceLevel: string;
  requriementss: string[];
  company: string;
};

export default function AllJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.user.token);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/jobs/all-jobs", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white px-6 lg:px-16 py-16">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold uppercase">
          Jobs
        </h1>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-zinc-400">Loading jobs...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-zinc-800 bg-[#0f0f12] p-6 hover:border-zinc-600 transition cursor-pointer"
              onClick={() => window.location.href=`/applicant/apply-job/${job.id}`}
            >
              <h3 className="text-xl font-bold mb-2">
                {job.experienceLevel.charAt(0).toUpperCase() +
                  job.experienceLevel.slice(1).toLowerCase()}{" "}
                {job.title}
              </h3>

              <p className="text-sm text-zinc-400 mb-4">
                {job.description}
              </p>

              <div className="text-xs text-zinc-500 flex gap-4">
                <span>{job.location || "N/A"}</span>
                <span>{job.type
                  ? job.type.charAt(0).toUpperCase() + job.type.slice(1).toLowerCase()
                  : "N/A"}
                </span>
              </div>

              <div className="mt-4 text-[10px] text-[#00E5FF] uppercase font-mono">
                {job.status === "active" ? "Actively Recruiting" : job.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}