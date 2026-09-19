import { Link } from "react-router-dom";
import {
  FaXTwitter,
  FaLinkedin,
  FaGithub,
  FaLocationDot,
} from "react-icons/fa6";
import {
  FiTarget,
  FiCpu,
  FiShield,
  FiZap,
  FiLayers,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import SEO from "../components/SEO";

export default function AboutUs() {
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About MatchNexx",
    description:
      "MatchNexx is an intelligent recruitment infrastructure and AI-driven talent pipeline platform engineered to bridge elite technical talent with modern recruiters through structured CV intelligence and real-time telemetry.",
    url: "https://match-nexx.onrender.com/about",
    mainEntity: {
      "@type": "Organization",
      name: "MatchNexx",
      url: "https://match-nexx.onrender.com",
      foundingLocation: {
        "@type": "Place",
        name: "Abuja, Nigeria",
      },
      knowsAbout: [
        "Artificial Intelligence in Recruitment",
        "Automated CV Structuring",
        "Technical Talent Calibration",
        "Applicant Tracking Systems (ATS)",
        "Nigeria Data Protection Act (NDPA)",
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto selection:bg-[#FF0055] selection:text-white">
      <SEO
        title="About Us | Next-Gen AI Talent Infrastructure & Mission"
        description="Learn about MatchNexx: our mission to eliminate recruitment friction, our AI CV structuring protocol, sub-second candidate telemetry, and NDPA compliance."
        canonicalPath="/about"
        jsonLd={aboutStructuredData}
      />

      {/* ================= HERO / ORIGIN ================= */}
      <section className="border-b border-zinc-900 pb-16 mb-20 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF] mb-6">
          <span className="w-1.5 h-1.5 bg-[#00E5FF] animate-pulse rounded-full" />
          ABOUT MATCH-NEXX
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white mb-6 leading-[0.95]">
          Engineered to <span className="text-[#00E5FF]">Demolish</span> Hiring{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055]">
            Friction.
          </span>
        </h1>

        <p className="text-zinc-300 max-w-3xl text-base sm:text-lg leading-relaxed mb-10 font-light">
          Traditional recruitment is broken. High-caliber engineers get swallowed in black-hole ATS filters, while engineering leads drown in hundreds of unformatted, unverified PDFs.
          <span className="text-white font-medium"> MatchNexx replaces fragmented resumes with structured talent vectors and sub-second pipeline telemetry.</span>
        </p>

        {/* Ambient Glow Accent */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-[#00E5FF]/10 to-[#FF0055]/10 blur-[130px] pointer-events-none -z-10" />

        {/* Quick Highlights Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-900/80">
          <div className="p-4 bg-[#0d0d10] border border-zinc-800/80">
            <span className="text-[#00E5FF] text-2xl sm:text-3xl font-black block font-mono">14ms</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px] mt-1 block">
              Query Latency
            </span>
          </div>
          <div className="p-4 bg-[#0d0d10] border border-zinc-800/80">
            <span className="text-[#FF0055] text-2xl sm:text-3xl font-black block font-mono">98.4%</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px] mt-1 block">
              Match Accuracy
            </span>
          </div>
          <div className="p-4 bg-[#0d0d10] border border-zinc-800/80">
            <span className="text-[#00E5FF] text-2xl sm:text-3xl font-black block font-mono">100%</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px] mt-1 block">
              ATS-Optimized
            </span>
          </div>
          <div className="p-4 bg-[#0d0d10] border border-zinc-800/80">
            <span className="text-white text-2xl sm:text-3xl font-black block font-mono">NDPA</span>
            <span className="text-zinc-400 uppercase tracking-wider text-[11px] mt-1 block">
              2023 Compliant
            </span>
          </div>
        </div>
      </section>

      {/* ================= THE PROBLEM VS MATCH-NEXX ================= */}
      <section className="mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-[#FF0055] block mb-2">
            PARADIGM SHIFT
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
            Why Legacy Hiring Fails
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            The fundamental architectural contrast between traditional job boards and MatchNexx
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: The Legacy Problem */}
          <div className="bg-[#0c0c0e] border border-red-950/60 p-8 sm:p-10 relative">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 bg-[#FF0055] rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF0055]">
                Legacy Recruitment Channels
              </h3>
            </div>
            <ul className="space-y-5 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-[#FF0055] font-bold shrink-0">✕</span>
                <span>
                  <strong className="text-zinc-200">Unstructured Resumes:</strong> Raw PDFs filled with arbitrary formatting cause ATS parsers to misread or discard up to 75% of qualified applicants.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF0055] font-bold shrink-0">✕</span>
                <span>
                  <strong className="text-zinc-200">Application Black Holes:</strong> Candidates submit profiles with zero feedback, leaving them in weeks of radio silence without status updates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF0055] font-bold shrink-0">✕</span>
                <span>
                  <strong className="text-zinc-200">Manual Keyword Scraping:</strong> Recruiters spend an average of 40 hours per role filtering spam submissions and superficial keyword stuffers.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF0055] font-bold shrink-0">✕</span>
                <span>
                  <strong className="text-zinc-200">High Intermediary Costs:</strong> Recruitment agencies charge 20-30% commissions for manual, low-transparency sourcing cycles.
                </span>
              </li>
            </ul>
          </div>

          {/* Right: The MatchNexx Solution */}
          <div className="bg-[#0c0c0e] border border-cyan-950/80 p-8 sm:p-10 relative shadow-[0_0_50px_rgba(0,229,255,0.05)]">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#00E5FF]">
                The MatchNexx Protocol
              </h3>
            </div>
            <ul className="space-y-5 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="text-[#00E5FF] font-bold shrink-0">✓</span>
                <span>
                  <strong className="text-white">Structured CV Intelligence:</strong> Resumes are automatically normalized into verified data vectors optimized for both machines and human reviewers.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00E5FF] font-bold shrink-0">✓</span>
                <span>
                  <strong className="text-white">Live Pipeline Telemetry:</strong> Candidates receive real-time notifications on profile views, shortlist status, and hiring team interactions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00E5FF] font-bold shrink-0">✓</span>
                <span>
                  <strong className="text-white">Sub-Second Talent Search:</strong> Hiring managers execute multidimensional queries with granular skill filters to identify verified talent in milliseconds.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00E5FF] font-bold shrink-0">✓</span>
                <span>
                  <strong className="text-white">Democratized Access:</strong> Free for candidates forever, with straightforward flat-fee subscriptions for engineering teams and recruiters.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURAL PILLARS ================= */}
      <section className="mb-24">
        <div className="border-b border-zinc-900 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-[#00E5FF] block mb-2">
              FOUNDATIONAL ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
              Core Technical Pillars
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-sm">
            Our platform is built upon four immutable design principles engineered for scale, privacy, and speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0f0f12] border border-zinc-800/80 p-6 hover:border-[#00E5FF]/60 transition-all duration-300 group">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#00E5FF] mb-5 group-hover:scale-110 transition-transform">
              <FiCpu className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] text-[#00E5FF] uppercase block mb-1">PILLAR 01</span>
            <h3 className="text-base font-bold text-white uppercase mb-2">Automated CV Structuring</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Converts disparate career records into standardized, parse-ready schemas with intelligent ATS keyword optimization.
            </p>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800/80 p-6 hover:border-[#FF0055]/60 transition-all duration-300 group">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF0055] mb-5 group-hover:scale-110 transition-transform">
              <FiZap className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] text-[#FF0055] uppercase block mb-1">PILLAR 02</span>
            <h3 className="text-base font-bold text-white uppercase mb-2">Sub-Second Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live status pipelines update in real-time. Hiring managers can query thousands of candidates in 14 milliseconds.
            </p>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800/80 p-6 hover:border-[#00E5FF]/60 transition-all duration-300 group">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#00E5FF] mb-5 group-hover:scale-110 transition-transform">
              <FiShield className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] text-[#00E5FF] uppercase block mb-1">PILLAR 03</span>
            <h3 className="text-base font-bold text-white uppercase mb-2">NDPA 2023 Sovereignty</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Strict adherence to Nigerian and international data regulations. Candidate data is protected by AES-256 encryption at rest.
            </p>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800/80 p-6 hover:border-[#FF0055]/60 transition-all duration-300 group">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF0055] mb-5 group-hover:scale-110 transition-transform">
              <FiTarget className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] text-[#FF0055] uppercase block mb-1">PILLAR 04</span>
            <h3 className="text-base font-bold text-white uppercase mb-2">Bias-Free Capability Index</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Evaluations prioritize demonstrated skills, verified experience, and project velocity over superficial resume fluff.
            </p>
          </div>
        </div>
      </section>

      {/* ================= OUR MISSION & VISION ================= */}
      <section className="mb-24 grid md:grid-cols-2 gap-8">
        <div className="bg-[#0f0f12] border-l-4 border-[#00E5FF] border-y border-r border-zinc-800 p-8 sm:p-12">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#00E5FF] uppercase mb-4">
            <FiLayers className="w-4 h-4" />
            <span>OUR MISSION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mb-4">
            Accelerate Human Potential Through Intelligent Infrastructure
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Our mission is to eliminate the arbitrary inefficiencies of hiring. We empower engineers and tech professionals to present their true capabilities through structured CV intelligence, while enabling modern organizations to discover and engage elite talent with complete transparency and unparalleled speed.
          </p>
        </div>

        <div className="bg-[#0f0f12] border-l-4 border-[#FF0055] border-y border-r border-zinc-800 p-8 sm:p-12">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#FF0055] uppercase mb-4">
            <FiGlobe className="w-4 h-4" />
            <span>OUR VISION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mb-4">
            The Global Calibration Engine for Tech Talent
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            We envision an ecosystem where geographic boundaries, resume formatting biases, and recruiter sourcing deadlocks cease to exist. From Lagos to London, MatchNexx aspires to be the global benchmark for data-backed candidate matching and high-trust hiring pipelines.
          </p>
        </div>
      </section>

      {/* ================= LEADERSHIP / ARCHITECT SECTION ================= */}
      <section className="mb-24 bg-[#0f0f12] border border-zinc-800 p-8 sm:p-12 relative overflow-hidden">
        {/* Background circuit accent */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#FF0055] rounded-2xl -rotate-6 opacity-40 blur-sm" />
              <div className="relative w-full h-full bg-[#070708] border-2 border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-1">⚡</span>
                <span className="text-xs font-black tracking-widest text-white uppercase">
                  FAHYVOR
                </span>
                <span className="text-[10px] text-[#00E5FF] uppercase tracking-wider">
                  LEAD ARCHITECT
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono tracking-widest text-[#00E5FF]">
              SYSTEM ARCHITECT & FOUNDER
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase">
              Favour "Fahyvor"
            </h2>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <FaLocationDot className="text-[#FF0055]" />
              <span>ABUJA, NIGERIA // GLOBAL REACH</span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              Software engineer and systems architect dedicated to building scalable web applications, distributed pipelines, and algorithmic recruitment systems. MatchNexx was conceived out of the frustration of seeing exceptional engineering talent in Nigeria and Africa held back by opaque hiring filters and outdated resume paradigms.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 text-white">
              <a
                href="https://x.com/iamfavour3"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors px-3 py-2 bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="w-4 h-4" />
                <span>@iamfavour3</span>
              </a>
              <a
                href="https://linkedin.com/in/fahyvor"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors px-3 py-2 bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/fahyvor/match-nexx"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors px-3 py-2 bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="text-center border-t border-zinc-900 pt-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white mb-4">
          Ready to Step Into the Future of Recruitment?
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-10">
          Whether you are an engineer seeking your next career leap or a recruiter looking for verified talent, MatchNexx is engineered for you.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/applicant/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00E5FF] to-[#FF0055] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>Deploy Candidate Profile</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/recruiter/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-700 hover:border-white text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <span>Recruiter Access</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}