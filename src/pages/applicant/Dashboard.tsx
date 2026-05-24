import { useNavigate } from 'react-router-dom';

export default function ApplicantDashboard() {
  const navigate = useNavigate();

  const recentApplications = [
    { id: 1, company: 'TechCorp', position: 'Senior Frontend Engineer', status: 'reviewing', date: '2 days ago' },
    { id: 2, company: 'DataFlow Inc', position: 'Full Stack Developer', status: 'interview', date: '5 days ago' },
    { id: 3, company: 'AI Innovations', position: 'ML Engineer', status: 'pending', date: '1 week ago' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'reviewing': return 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/5';
      case 'interview': return 'text-accent-pink border-accent-pink/30 bg-accent-pink/5';
      case 'pending': return 'text-accent-lime border-accent-lime/30 bg-accent-lime/5';
      default: return 'text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cyber-dark/80 backdrop-blur-xl border-b border-zinc-800/60 px-6 lg:px-16 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12" />
            <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 mix-blend-screen" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase font-mono">HIRE.FLOW</span>
        </div>
        <button onClick={() => navigate('/settings')} className="text-xs font-mono tracking-widest text-zinc-400 hover:text-accent-cyan transition-colors">
          // SETTINGS
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Welcome Section */}
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel-bg border border-zinc-800 text-[11px] font-mono tracking-widest text-accent-cyan">
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
            { label: 'Total Applications', value: '12', accent: 'cyan' },
            { label: 'Under Review', value: '5', accent: 'pink' },
            { label: 'Interviews', value: '3', accent: 'lime' },
            { label: 'Offers', value: '1', accent: 'purple' },
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
            className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-[10px] font-mono text-accent-cyan/40 group-hover:text-accent-cyan transition-colors">
              [ ACTION_01 ]
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Build Your <br /><span className="text-accent-cyan">CV</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create a parse-ready profile optimized for ATS systems and direct delivery to tech leads.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent-cyan">
                Open Builder →
              </div>
            </div>
          </button>

          <button
            className="group relative bg-panel-bg border border-panel-border p-8 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
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
            <span className="text-[10px] font-mono text-zinc-500">[{recentApplications.length}] ACTIVE</span>
          </div>

          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-cyber-dark/50 border border-zinc-800 group hover:border-zinc-700 transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-accent-cyan transition-colors">
                    {app.position}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{app.company} • {app.date}</p>
                </div>
                <div className={`px-3 py-1 border rounded text-xs font-mono tracking-widest uppercase ${getStatusColor(app.status)}`}>
                  {app.status}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 text-xs font-mono tracking-widest text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2">
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
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1a1a1f"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeDasharray="70 282.6"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#FF0055" />
                  </linearGradient>
                </defs>
                <text x="50" y="55" textAnchor="middle" fontSize="24" fill="#00E5FF" fontWeight="bold">
                  75%
                </text>
              </svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}