// src/pages/recruiter/Dashboard.tsx
import { useState } from 'react';

interface Job {
  id: number;
  title: string;
  applicants: number;
  interviews: number;
  status: 'active' | 'paused' | 'closed';
  posted: string;
}

export default function RecruiterDashboard() {
  const [jobs] = useState<Job[]>([
    { id: 1, title: 'Senior Frontend Engineer', applicants: 42, interviews: 5, status: 'active', posted: '2 weeks ago' },
    { id: 2, title: 'Full Stack Developer', applicants: 28, interviews: 3, status: 'active', posted: '1 week ago' },
    { id: 3, title: 'DevOps Engineer', applicants: 15, interviews: 2, status: 'active', posted: '3 days ago' },
    { id: 4, title: 'Product Manager', applicants: 0, interviews: 0, status: 'closed', posted: '1 month ago' },
  ]);

  const stats = [
    { label: 'Active Jobs', value: '3', accent: 'cyan', icon: '📋' },
    { label: 'Total Applicants', value: '450', accent: 'pink', icon: '👥' },
    { label: 'In Interviews', value: '24', accent: 'lime', icon: '🎤' },
    { label: 'Offers Made', value: '8', accent: 'purple', icon: '🎯' },
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
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white w-full">

      <main className="mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Welcome Section */}
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel-bg border border-zinc-800 text-[11px] font-mono tracking-widest text-accent-pink">
            <span className="w-1.5 h-1.5 bg-accent-pink animate-pulse rounded-full" />
            RECRUITMENT_CONSOLE_ACTIVE
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-tight">
            Recruitment <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-cyan to-accent-pink">Command Center</span>
          </h1>
          <p className="text-zinc-400 text-sm">Manage job postings, track applicants, and streamline hiring workflows in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`bg-panel-bg border border-panel-border p-6 group hover:border-accent-${stat.accent} transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-mono tracking-widest uppercase text-zinc-500 group-hover:text-accent-${stat.accent}`}>
                    {stat.label}
                  </p>
                  <p className={`text-4xl font-black mt-2 text-accent-${stat.accent}`}>
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
          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan/40 group-hover:text-accent-cyan transition-colors">
              [ ACTION_01 ]
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Post New <br /><span className="text-accent-cyan">Job</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create and publish job listings to reach qualified candidates instantly.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-cyan">
                Create Posting →
              </div>
            </div>
          </button>

          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-pink/40 group-hover:text-accent-pink transition-colors">
              [ ACTION_02 ]
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Search <br /><span className="text-accent-pink">Talent Pool</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Query verified candidates using advanced filters and skill matching.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-pink">
                Browse Candidates →
              </div>
            </div>
          </button>

          <button className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-lime/40 group-hover:text-accent-lime transition-colors">
              [ ACTION_03 ]
            </div>
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
            <span className="text-[10px] font-mono text-zinc-500">[{jobs.filter(j => j.status === 'active').length}] LIVE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-dark/50 border-b border-panel-border">
                <tr className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                  <th className="px-6 py-4 text-left">Job Title</th>
                  <th className="px-6 py-4 text-center">Applicants</th>
                  <th className="px-6 py-4 text-center">Interviews</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Posted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr key={job.id} className={`border-b border-panel-border hover:bg-cyber-dark/50 transition-colors ${idx % 2 === 0 ? 'bg-cyber-dark/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">{job.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">ID: #{job.id.toString().padStart(4, '0')}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-lg font-bold text-accent-cyan">{job.applicants}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-lg font-bold text-accent-pink">{job.interviews}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 border rounded text-xs font-mono tracking-widest uppercase ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs text-zinc-500">{job.posted}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-mono text-accent-cyan hover:text-accent-pink transition-colors">
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recently Viewed Candidates */}
        <section className="mt-12 bg-panel-bg border border-panel-border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-accent-lime" />
              Top Candidates This Week
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">[5] REVIEWED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-cyber-dark/50 border border-zinc-800 p-4 text-center group hover:border-accent-lime transition-colors">
                <div className="w-12 h-12 bg-linear-to-br from-accent-cyan to-accent-pink rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                  👤
                </div>
                <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-accent-lime transition-colors">Candidate {i}</h3>
                <p className="text-xs text-zinc-500 mt-1">Senior Developer</p>
                <button className="mt-3 text-xs font-mono text-accent-cyan hover:text-accent-pink transition-colors">
                  Review Profile
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}