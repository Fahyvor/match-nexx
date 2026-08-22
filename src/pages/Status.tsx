
export default function SystemStatus() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      <div className="border-b border-zinc-900 pb-8 mb-12 flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF] mb-4">
            NETWORK_TELEMETRY // LIVE
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
            System Status
          </h1>
        </div>
        <div className="font-mono text-right text-xs">
          <span className="text-[#00E5FF] font-bold block">ALL SYSTEMS OPERATIONAL</span>
          <span className="text-zinc-500">Uptime: 99.98%</span>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        <div className="bg-[#0f0f12] border border-zinc-800 p-4 flex justify-between items-center">
          <span className="text-white">Primary Matching Engine (NG-LOS)</span>
          <span className="text-[#00E5FF]">OPERATIONAL [14ms]</span>
        </div>
        <div className="bg-[#0f0f12] border border-zinc-800 p-4 flex justify-between items-center">
          <span className="text-white">CV Parsing Pipeline</span>
          <span className="text-[#00E5FF]">OPERATIONAL [120ms]</span>
        </div>
        <div className="bg-[#0f0f12] border border-zinc-800 p-4 flex justify-between items-center">
          <span className="text-white">Database Cluster (PostgreSQL)</span>
          <span className="text-[#00E5FF]">OPERATIONAL [2ms]</span>
        </div>
      </div>
    </div>
  );
}