
import { FaXTwitter, FaLinkedin, FaGithub, FaLocationDot } from 'react-icons/fa6';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF] mb-4">
          SYSTEM_MANIFESTO // ABOUT_NEXX
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white mb-4">
          Engineered to <span className="text-[#00E5FF]">Bridge</span> Talent.
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
          Match-Nexx is built on a simple premise: traditional hiring workflows are broken, noisy, and inefficient. We build low-latency talent infrastructure that turns unstructured resume noise into sub-second hiring signals.
        </p>
      </div>

      {/* Philosophy Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-[#0f0f12] border border-zinc-800 p-8 relative">
          <span className="font-mono text-xs text-[#00E5FF] block mb-2">[ CORE_01 ]</span>
          <h3 className="text-lg font-bold text-white uppercase mb-3">Precision Matching</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Eliminating keyword stuffing and superficial resume hacks. Our system parses experience into verified capability vectors.
          </p>
        </div>

        <div className="bg-[#0f0f12] border border-zinc-800 p-8 relative">
          <span className="font-mono text-xs text-[#FF0055] block mb-2">[ CORE_02 ]</span>
          <h3 className="text-lg font-bold text-white uppercase mb-3">Sub-Second Telemetry</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Built for engineering teams that value speed. Recruiter queries stream matches instantaneously without manual sourcing deadlocks.
          </p>
        </div>

        <div className="bg-[#0f0f12] border border-zinc-800 p-8 relative">
          <span className="font-mono text-xs text-[#00E5FF] block mb-2">[ CORE_03 ]</span>
          <h3 className="text-lg font-bold text-white uppercase mb-3">NDPA Compliance</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Built in Nigeria for global compliance. Every pipeline byte adheres to strict NDPA 2023 privacy and consent protocols.
          </p>
        </div>
      </div>

      {/* Leadership / Creator Section */}
      <div className="bg-[#0f0f12] border-l-4 border-[#00E5FF] border-y border-r border-zinc-800 p-8 md:p-12 mb-16">
        <span className="font-mono text-xs text-[#00E5FF] tracking-widest uppercase block mb-4">
          // ARCHITECT & SYSTEM LEAD
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase mb-2">
          Favour "Fahyvor"
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
          <FaLocationDot className="text-[#FF0055]" />
          <span>LAGOS, NIGERIA (NG-LOS)</span>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed mb-6">
          Architecting systems focused on high-performance web engineering, data pipelines, and intelligent recruitment protocols.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4 text-zinc-400">
          <a
            href="https://x.com/iamfavour3"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00E5FF] transition-colors p-2 bg-zinc-900 border border-zinc-800"
            aria-label="X (Twitter)"
          >
            <FaXTwitter className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com/in/fahyvor"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00E5FF] transition-colors p-2 bg-zinc-900 border border-zinc-800"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/fahyvor/match-nexx"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00E5FF] transition-colors p-2 bg-zinc-900 border border-zinc-800"
            aria-label="GitHub"
          >
            <FaGithub className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}