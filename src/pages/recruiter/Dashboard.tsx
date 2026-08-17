import { useState, useEffect } from 'react';
import SleekToast, { toast } from 'sleek-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from "../../redux/store";
import { Skeleton } from '../../components/ReuseableSkeleton';
import { formatDate } from '../../utils/formatDate';
import api from '../../utils/api';
import RecruiterPaywallModal from '../../components/RecruiterPaywallModal';

interface Job {
  id: string;
  company: string;
  title: string;
  totalApplicants: number;
  interviews: number;
  status: "active" | "paused" | "closed";
  createdAt: string;
}

interface RecruiterJobsResponse {
  data: Job[];
  totalApplicants: number;
}

interface Applicant {
  id: string;
  headline?: string;
  profilePicture?: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  years_of_experience: number;
  applicant: Applicant;
}

export default function RecruiterDashboard() {
  const token = useSelector((state: RootState) => state.user.token);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recruiterJobs, setRecruiterJobs] = useState<RecruiterJobsResponse | null>(null);

  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  const fetchRecruiterJobs = async () => {
    try {
      const response: any = await api.jobs.getRecruiterJobs();
      setRecruiterJobs(response.data || response);
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
      toast.error('Failed to load jobs. Please try again later.', 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCandidates = async () => {
    setCandidatesLoading(true);
    setRequiresSubscription(false);
    try {
      const response: any = await api.recruiters.getCandidates();
      const all: Candidate[] = response.data || response;

      if (Array.isArray(all)) {
        const sorted = [...all]
          .sort((a, b) => (b.years_of_experience || 0) - (a.years_of_experience || 0))
          .slice(0, 5);
        setTopCandidates(sorted);
      }
    } catch (error: any) {
      console.error('Error fetching top candidates:', error);
      if (error.response?.status === 402 || error.response?.data?.code === "SUBSCRIPTION_REQUIRED") {
        setRequiresSubscription(true);
      } else {
        toast.error('Failed to load candidates. Please try again later.', 4000);
      }
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
    fetchTopCandidates();
  }, [token]);

  const stats = [
    { label: 'Active Jobs', value: recruiterJobs?.data.length ?? 0, accent: 'text-accent-cyan-light dark:text-accent-cyan', icon: '📋' },
    { label: 'Total Applicants', value: recruiterJobs?.totalApplicants ?? 0, accent: 'pink', icon: '👥' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-accent-lime border-accent-lime/30 bg-accent-lime/5';
      case 'paused': return 'text-accent-orange border-accent-orange/30 bg-accent-orange/5';
      case 'closed': return 'text-zinc-400 border-zinc-700 bg-zinc-900/20';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white w-full">
    <SleekToast />

      <main className="mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Welcome Section */}
        <div className="mb-12 space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-cyan to-accent-pink">RECRUITER</span>
          </h1>
          <p className="text-zinc-400 text-sm">Manage job postings, track applicants, and streamline hiring workflows in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-12">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-panel-bg border border-panel-border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-10 w-16" />
                    </div>

                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              ))
            : stats.map((stat, i) => (
                <div
                  key={i}
                  className={`bg-panel-bg border border-panel-border p-6 group hover:border-accent-${stat.accent} transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-xs font-mono tracking-widest uppercase text-zinc-500 group-hover:text-accent-${stat.accent}`}
                      >
                        {stat.label}
                      </p>

                      <p
                        className={`text-4xl font-black mt-2 text-accent-${stat.accent}`}
                      >
                        {stat.value}
                      </p>
                    </div>

                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden" onClick={() => window.location.href="/recruiter/create-job"}>
            <div className="space-y-4 cursor-pointer">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Post New <br /><span className="text-accent-cyan-light dark:text-accent-cyan">Job</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create and publish job listings to reach qualified candidates instantly.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-cyan-light dark:text-accent-cyan cursor-pointer">
                Create Posting →
              </div>
            </div>
          </button>

          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => window.location.href="/candidates"}>
            <div className="space-y-4 cursor-pointer">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Search <br /><span className="text-accent-pink">Talent Pool</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Query verified candidates using advanced filters and skill matching.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-pink cursor-pointer">
                Browse Candidates →
              </div>
            </div>
          </button>

          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Pipeline <br /><span className="text-accent-lime">Analytics</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                View recruitment metrics and optimize your hiring process.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-lime">
                View Reports →
              </div>
            </div>
          </button>
        </div>

        {/* Active Jobs Table */}
        <section className="bg-panel-bg border border-panel-border overflow-hidden">
          <div className="p-8 border-b border-panel-border flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-accent-pink animate-pulse" />
              Active Job Postings
            </h2>

            {loading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">
                [{recruiterJobs?.data.filter((j) => j.status === "active").length}] LIVE
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-cyber-dark/50 border-b border-panel-border">
                <tr className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                  <th className="px-6 py-4 text-left">Job Title</th>
                  <th className="px-6 py-4 text-center">Applicants</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Posted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading
                  ? [...Array(6)].map((_, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-panel-border"
                      >
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-52 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-6 w-10 mx-auto" />
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-20 mx-auto rounded-full" />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-4 w-24 ml-auto" />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-4 w-12 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : recruiterJobs?.data.map((job, idx) => (
                      <tr
                        key={job.id}
                        className={`border-b border-panel-border hover:bg-white dark:bg-cyber-dark/50 transition-colors ${
                          idx % 2 === 0 ? "bg-white dark:bg-cyber-dark/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{job.title}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {job.company}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <p className="text-lg font-bold text-accent-cyan-light dark:text-accent-cyan">
                            {job.totalApplicants}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 border rounded text-xs font-mono tracking-widest uppercase ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-zinc-500">{formatDate(job.createdAt)}</p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-mono text-accent-cyan-light dark:text-accent-cyan hover:text-accent-pink transition-colors">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Candidates */}
        <section className="mt-12 bg-panel-bg border border-panel-border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-accent-lime" />
              Top Candidates
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">
              [{candidatesLoading ? "…" : topCandidates.length}] SHOWN
            </span>
          </div>

          {requiresSubscription ? (
            <RecruiterPaywallModal onSuccess={() => fetchTopCandidates()} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {candidatesLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-cyber-dark/50 border border-zinc-800 p-4 text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-4 w-24 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto mb-3" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))
            ) : topCandidates.length === 0 ? (
              <p className="col-span-full text-center text-sm text-zinc-500">
                No candidates found yet.
              </p>
            ) : (
              topCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white dark:bg-cyber-dark/50 border border-zinc-800 p-4 text-center group hover:border-accent-lime transition-colors"
                >
                  {candidate.applicant?.profilePicture ? (
                    <img
                      src={candidate.applicant.profilePicture}
                      alt={`${candidate.firstName} ${candidate.lastName}`}
                      className="w-12 h-12 rounded-full mx-auto mb-3 object-cover border border-accent-lime/40"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-linear-to-br from-accent-cyan to-accent-pink rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                      👤
                    </div>
                  )}

                  <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-accent-lime transition-colors truncate">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {candidate.applicant?.headline || "No headline"}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {candidate.years_of_experience} yrs exp
                  </p>

                  <button
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    className="mt-3 text-xs font-mono text-accent-cyan-light dark:text-accent-cyan hover:text-accent-pink transition-colors"
                  >
                    Review Profile
                  </button>
                </div>
              ))
            )}
          </div>
          )}
        </section>
      </main>
    </div>
  );
}