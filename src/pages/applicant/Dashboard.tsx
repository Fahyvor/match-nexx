import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { fetchApplications } from '../../redux/slices/applicantSlice';
import { formatDate } from '../../utils/formatDate';
export default function ApplicantDashboard() {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const { applications } = useSelector((state: RootState) => state.applicant);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const applicationStats = applications.reduce(
    (stats, application) => {
      stats.total++;

      switch (application.status.toLowerCase()) {
        case "pending":
          stats.pending++;
          break;

        case "reviewing":
          stats.reviewing++;
          break;

        case "interview":
          stats.interview++;
          break;

        case "offer":
          stats.offer++;
          break;

        case "accepted":
          stats.accepted++;
          break;

        case "rejected":
          stats.rejected++;
          break;

        default:
          break;
      }

      return stats;
    },
    {
      total: 0,
      pending: 0,
      reviewing: 0,
      interview: 0,
      offer: 0,
      accepted: 0,
      rejected: 0,
    }
  );

  const percentage = user?.profileCompletion?.percentage ?? 0;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const dashOffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'reviewing': return 'text-accent-cyan-light dark:text-accent-cyan border-accent-cyan/30 bg-accent-cyan/5';
      case 'interview': return 'text-accent-pink border-accent-pink/30 bg-accent-pink/5';
      case 'pending': return 'text-accent-lime border-accent-lime/30 bg-accent-lime/5';
      default: return 'text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white">

      <main className="w-full mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Welcome Section */}
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel-bg border border-zinc-800 text-[11px] font-mono tracking-widest text-accent-cyan-light dark:text-accent-cyan">
            <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
            DASHBOARD_ACTIVE
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-tight">
            Your Application <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-cyan to-accent-pink">Pipeline</span>
          </h1>
          <p className="text-zinc-400 text-sm">Track real-time application status and manage your professional profile</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "Total Applications",
              value: applicationStats.total,
              accent: "cyan",
            },
            {
              label: "Pending",
              value: applicationStats.pending,
              accent: "amber",
            },
            {
              label: "Under Review",
              value: applicationStats.reviewing,
              accent: "pink",
            },
            {
              label: "Interviews",
              value: applicationStats.interview,
              accent: "lime",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-panel-bg border border-panel-border p-6 group hover:border-accent-${stat.accent} transition-all duration-300`}
            >
              <p className={`text-xs font-mono tracking-widest uppercase text-zinc-500 group-hover:text-accent-${stat.accent}`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-black mt-2 text-accent-${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate('/applicant/cv-builder')}
            className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan-light dark:text-accent-cyan/40 group-hover:text-accent-cyan-light dark:text-accent-cyan transition-colors">
              [ ACTION_01 ]
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Build Your <br /><span className="text-accent-cyan-light dark:text-accent-cyan">CV</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create a parse-ready profile optimized for ATS systems and direct delivery to tech leads.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-cyan-light dark:text-accent-cyan">
                Open Builder →
              </div>
            </div>
          </button>

          <button
            className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => window.location.href="/jobs"}
          >
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-pink/40 group-hover:text-accent-pink transition-colors">
              [ ACTION_02 ]
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Browse <br /><span className="text-accent-pink">Opportunities</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Explore curated job postings matched to your profile and experience level.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-pink">
                View Jobs →
              </div>
            </div>
          </button>
        </div>

        {/* Recent Applications */}
        <section className="bg-panel-bg border border-panel-border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-accent-cyan animate-pulse" />
              Recent Applications
            </h2>
            <span className="text-[10px] font-mono text-white">{applications.length} ACTIVE</span>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-cyber-dark/50 border border-zinc-800 group hover:border-zinc-700 transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-accent-cyan-light dark:text-accent-cyan transition-colors">
                    {app?.job.experienceLevel} • {app?.job.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{app?.company} • {formatDate(app?.updatedAt)}</p>
                </div>
                <div className={`px-3 py-1 border rounded text-xs font-mono tracking-widest uppercase ${getStatusColor(app.status)}`}>
                  {app.status}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 text-xs font-mono tracking-widest text-accent-cyan-light dark:text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2">
            View All Applications →
          </button>
        </section>

        {/* Profile Completion */}
        <section className="mt-12 bg-linear-to-r from-accent-cyan/10 to-accent-pink/10 border border-zinc-800 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight mb-2">Profile Completion</h3>
              <p className="text-sm text-zinc-400">Complete your profile to increase matching accuracy by 40%</p>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#1a1a1f"
                  strokeWidth="4"
                />

                {/* Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-700"
                />

                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#FF0055" />
                  </linearGradient>
                </defs>

                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fontSize="24"
                  fill="#00E5FF"
                  fontWeight="bold"
                >
                  {percentage}%
                </text>
              </svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}