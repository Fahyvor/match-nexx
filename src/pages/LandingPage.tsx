import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-[#FF0055] selection:text-white overflow-x-hidden">

      <main className="w-full mx-auto px-6 lg:px-16 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Heavyweight Futuristic Typography */}
        <div className="lg:col-span-6 space-y-8 relative">
          {/* Subtle Cybernetic Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF]">
            <span className="w-1.5 h-1.5 bg-[#FF0055] animate-ping" />
            PROTOCOL_V.26 // TALENT PIPELINE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase leading-[0.85]">
            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055]">Elite</span> Talent.
          </h1>
          
          <p className="text-zinc-400 font-light text-base md:text-lg max-w-xl leading-relaxed">
            A radical system built to generate hyper-optimized CV structures, track live application pipelines, and establish instant synchronization with top-tier hiring nodes.
          </p>

          {/* Minimalist Tech Metrics */}
          <div className="pt-8 border-t border-zinc-900 flex gap-16 font-mono">
            <div>
              <p className="text-3xl font-bold text-[#00E5FF]">14<span className="text-xs font-normal text-zinc-500">ms</span></p>
              <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Telemetry Latency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#FF0055]">98.4<span className="text-xs font-normal text-zinc-500">%</span></p>
              <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Match Accuracy</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interlocking Blue vs. Red Grid Components */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {/* High-energy background laser blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-[#00E5FF]/20 to-[#FF0055]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Block 1: Blue Option (Applicants) */}
          <div className="group relative bg-[#0f0f12] border-l-4 border-[#00E5FF] border-y border-r border-zinc-800/80 p-8 transform hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-[#00E5FF]/40 group-hover:text-[#00E5FF] transition-colors">
              [ NODE_01 ]
            </div>
            
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold tracking-tight uppercase">
                For <br /><span className="text-[#00E5FF]">Applicants</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Build an automated, parse-ready profile that guarantees frictionless delivery directly to tech leads.
              </p>
              <button className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#00E5FF] uppercase group-hover:underline pt-4">
                Deploy Profile →
              </button>
            </div>
          </div>

          {/* Block 2: Red Option (Recruiters) - Offset Stacked */}
          <div className="group relative bg-[#0f0f12] border-r-4 border-[#FF0055] border-y border-l border-zinc-800/80 p-8 sm:translate-y-8 transform hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-[#FF0055]/40 group-hover:text-[#FF0055] transition-colors">
              [ NODE_02 ]
            </div>
            
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold tracking-tight uppercase">
                For <br /><span className="text-[#FF0055]">Recruiters</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bypass sourcing deadlocks. Execute high-speed querying across clean, highly calibrated candidate pools.
              </p>
              <button className="w-full bg-[#FF0055] hover:bg-[#ff1a66] text-white font-mono text-xs tracking-widest uppercase py-3 transition-colors text-center block">
                Initialize Search
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}