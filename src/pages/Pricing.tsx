
export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      <div className="border-b border-zinc-900 pb-8 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          Platform Tiers
        </h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
          Simple pricing for candidate profiles & recruiter search pipelines
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-[#0f0f12] border border-zinc-800 p-8 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase block mb-2">Applicants</span>
            <h3 className="text-2xl font-extrabold text-white uppercase mb-2">Candidate Node</h3>
            <p className="text-3xl font-extrabold text-[#00E5FF] font-mono mb-6">₦2,000 <span className="text-xs font-normal text-zinc-500">/ forever</span></p>
            <ul className="space-y-3 font-mono text-xs text-white mb-8">
              <li>✓ Structured CV Generation</li>
              <li>✓ Public Talent Link</li>
              <li>✓ Live Application Telemetry</li>
              {/* <li>✓ AI Match Score Visualizer</li> */}
            </ul>
          </div>
          <button className="w-full border border-zinc-700 cursor-pointer hover:border-white text-white font-mono text-xs py-3 uppercase tracking-widest transition-colors"
            onClick={() => window.location.href = "/applicant/dashboard"}
          >
            Deploy Profile
          </button>
        </div>

        <div className="bg-[#0f0f12] border-2 border-[#FF0055] p-8 flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 bg-[#FF0055] text-white text-[9px] font-mono uppercase font-bold px-2 py-0.5">
            POPULAR
          </div>
          <div>
            <span className="font-mono text-xs text-[#FF0055] uppercase block mb-2">Recruiters</span>
            <h3 className="text-2xl font-extrabold text-white uppercase mb-2">Search Node</h3>
            <p className="text-3xl font-extrabold text-[#FF0055] font-mono mb-6">₦15,000 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
            <ul className="space-y-3 font-mono text-xs text-white mb-8">
              <li>✓ Unlimited Candidate Searches</li>
              <li>✓ Sub-Second Response Latency</li>
              <li>✓ Direct Candidate Outreach</li>
              <li>✓ Export Candidate JSONs</li>
            </ul>
          </div>
          <button className="w-full bg-[#FF0055] cursor-pointer hover:bg-[#ff1a66] text-white font-mono text-xs py-3 uppercase tracking-widest transition-colors"
            onClick={() => window.location.href = "candidates"}
          >
            Initialize Search
          </button>
        </div>

        <div className="bg-[#0f0f12] border border-zinc-800 p-8 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase block mb-2">Enterprise</span>
            <h3 className="text-2xl font-extrabold text-white uppercase mb-2">Custom Infrastructure</h3>
            <p className="text-3xl font-extrabold text-white font-mono mb-6">Custom</p>
            <ul className="space-y-3 font-mono text-xs text-white mb-8">
              <li>✓ Dedicated API Endpoints</li>
              <li>✓ Dedicated Account Manager</li>
              <li>✓ Private Talent Network Setup</li>
              <li>✓ Custom NDPA DPA Agreements</li>
            </ul>
          </div>
          <button className="w-full border cursor-pointer border-zinc-700 hover:border-white text-white font-mono text-xs py-3 uppercase tracking-widest transition-colors"
            onClick={() => window.location.href = "mailto:elreytechnologies@gmail.com"}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}