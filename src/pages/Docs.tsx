
export default function Documentation() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-6 font-mono text-xs border-r border-zinc-900 pr-6">
        <div>
          <p className="text-white font-bold uppercase mb-3 text-[#00E5FF]">Getting Started</p>
          <ul className="space-y-2 text-zinc-500">
            <li><a href="#overview" className="text-white hover:text-[#00E5FF]">System Overview</a></li>
            <li><a href="#quickstart" className="hover:text-white">Quickstart Guide</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-bold uppercase mb-3 text-[#FF0055]">Core Concepts</p>
          <ul className="space-y-2 text-zinc-500">
            <li><a href="#cv-parsing" className="hover:text-white">CV Parsing Protocol</a></li>
            <li><a href="#match-scoring" className="hover:text-white">Match Scoring Algorithm</a></li>
          </ul>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 space-y-10 text-sm">
        <section id="overview">
          <h1 className="text-3xl font-extrabold text-white uppercase mb-4">System Documentation</h1>
          <p className="text-zinc-400 leading-relaxed">
            Welcome to the Match-Nexx developer and system guide. Match-Nexx operates as a high-speed telemetry network pairing engineering talent with recruiter queries.
          </p>
        </section>

        <section id="quickstart" className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase border-l-2 border-[#00E5FF] pl-3">
            Quickstart
          </h2>
          <div className="bg-[#0f0f12] border border-zinc-800 p-4 font-mono text-xs text-zinc-400 space-y-2">
            <p className="text-zinc-500">// Initialize candidate node via CLI or API</p>
            <p><span className="text-[#00E5FF]">curl</span> -X POST https://match-nexx.onrender.com/api/v1/profile/deploy</p>
          </div>
        </section>
      </main>
    </div>
  );
}