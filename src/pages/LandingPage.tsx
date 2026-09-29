import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import {
  FiChevronDown,
  FiArrowRight,
  FiCheckCircle,
  FiCheck,
  FiX,
  FiFileText,
  FiCpu,
  FiActivity,
} from "react-icons/fi";

const FAQS = [
  {
    question: "What is MatchNexx and how does it work?",
    answer:
      "MatchNexx is an intelligent recruitment and job matching platform that bridges elite tech talent with top companies. It provides automated CV structuring, AI-powered skill matching, real-time application pipeline tracking, and direct recruiter synchronization.",
  },
  {
    question: "How does the AI CV Structurer benefit job applicants?",
    answer:
      "Our AI CV Structurer transforms your career history into modern, parse-ready, ATS-compliant formats. It optimizes keywords, organizes work experience, highlights key engineering impact metrics, and ensures your application bypasses applicant tracking bottlenecks.",
  },
  {
    question: "How do recruiters discover and contact candidates on MatchNexx?",
    answer:
      "Recruiters gain access to a verified, calibrated candidate database. Through advanced filters (tech stacks, years of experience, location, availability), recruiters can quickly shortlist candidates and initiate direct outreach without sourcing delays.",
  },
  {
    question: "Is MatchNexx free for job seekers?",
    answer:
      "Yes! Creating a profile, searching for open tech jobs, and applying to opportunities on MatchNexx is 100% free for applicants.",
  },
  {
    question: "Where is candidate data hosted and is it compliant with privacy laws?",
    answer:
      "MatchNexx operates with strict data privacy guidelines, fully compliant with NDPA 2023 and international privacy standards. Candidate contact info is protected and only shared upon verified mutual interest.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"cv" | "match" | "telemetry">("cv");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-[#FF0055] selection:text-white overflow-x-hidden">
      <SEO
        title="AI Job Matching & Talent Pipeline Platform"
        description="MatchNexx connects top tech talent with forward-thinking recruiters using automated CV structuring, real-time pipeline telemetry, and smart candidate matching."
        canonicalPath="/"
        jsonLd={faqStructuredData}
      />

      {/* =========================================================================
          MAIN HERO (Maintained in user's original signature design)
      ========================================================================== */}
      <main className="w-full mx-auto px-6 lg:px-16 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Heavyweight Futuristic Typography */}
        <div className="lg:col-span-6 space-y-8 relative">
          {/* Cybernetic Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF]">
            <span className="w-1.5 h-1.5 bg-[#FF0055] animate-ping rounded-full" />
            AI TALENT PIPELINE & RECRUITMENT ENGINE
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter uppercase leading-[0.85] text-zinc-900 dark:text-white">
            Bridging{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055]">
              Elite
            </span>{" "}
            Talent.
          </h1>

          <p className="text-zinc-700 dark:text-white font-light text-base md:text-lg max-w-xl leading-relaxed">
            MatchNexx is an intelligent hiring ecosystem built to generate hyper-optimized CV structures, track live application pipelines, and establish instant synchronization with top-tier hiring nodes.
          </p>

          {/* Minimalist Tech Metrics */}
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 flex gap-16 font-mono">
            <div>
              <p className="text-3xl font-bold text-[#00E5FF]">
                14<span className="text-xs font-normal text-zinc-500">ms</span>
              </p>
              <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">
                Telemetry Latency
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#FF0055]">
                98.4<span className="text-xs font-normal text-zinc-500">%</span>
              </p>
              <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">
                Match Accuracy
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Interlocking Blue vs. Red Grid Components */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {/* Laser blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-[#00E5FF]/20 to-[#FF0055]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Block 1: Blue Option (Applicants) */}
          <Link
            to="/applicant/dashboard"
            aria-label="Explore MatchNexx Applicant Portal"
            className="group relative bg-[#0f0f12] border-l-4 border-[#00E5FF] border-y border-r border-zinc-800/80 p-8 transform hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] block text-left"
          >
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-bold tracking-tight uppercase text-white">
                For <br />
                <span className="text-[#00E5FF]">Applicants</span>
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Build an automated, parse-ready profile that guarantees frictionless delivery directly to tech leads.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#00E5FF] uppercase group-hover:underline pt-4">
                Deploy Profile <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>

          {/* Block 2: Red Option (Recruiters) */}
          <Link
            to="/recruiter/dashboard"
            aria-label="Explore MatchNexx Recruiter Portal"
            className="group relative bg-[#0f0f12] border-r-4 border-[#FF0055] border-y border-l border-zinc-800/80 p-8 sm:translate-y-8 transform hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] block text-left"
          >
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-bold tracking-tight uppercase text-white">
                For <br />
                <span className="text-[#FF0055]">Recruiters</span>
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bypass sourcing deadlocks. Execute high-speed querying across clean, highly calibrated candidate pools.
              </p>
              <div className="w-full bg-[#FF0055] group-hover:bg-[#ff1a66] text-white font-mono text-xs tracking-widest uppercase py-3 transition-colors text-center block flex items-center justify-center gap-2">
                Initialize Search <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-y border-zinc-200 dark:border-zinc-900 py-10 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">
          Trusted by engineering teams & modern hiring systems
        </p>

        <div className="flex flex-wrap justify-center gap-10 text-zinc-500 dark:text-zinc-600 text-sm font-mono">
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-[#00E5FF] w-3.5 h-3.5" /> High-Scale Startups</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-[#00E5FF] w-3.5 h-3.5" /> Remote Engineering Teams</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-[#FF0055] w-3.5 h-3.5" /> AI Hiring Pipelines</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-[#FF0055] w-3.5 h-3.5" /> Verified Talent Platforms</span>
        </div>
      </section>

      {/* ================= CORE FEATURES (Maintained in user's design) ================= */}
      <section className="px-6 lg:px-16 py-24 grid md:grid-cols-3 gap-8">
        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-[#00E5FF]/60 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Smart Matching Engine</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            AI-driven candidate scoring system that maps skills, experience, and intent into structured hiring signals.
          </p>
        </article>

        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-[#FF0055]/60 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Real-Time Pipeline Tracking</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Monitor applicant flow from application to decision in a live synchronized hiring dashboard.
          </p>
        </article>

        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-[#00E5FF]/60 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Structured CV Intelligence</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automatically transforms resumes into recruiter-ready structured data for instant evaluation and ATS compliance.
          </p>
        </article>
      </section>

      {/* ================= HOW IT WORKS (Maintained in user's design) ================= */}
      <section className="px-6 lg:px-16 py-24 border-t border-zinc-200 dark:border-zinc-900">
        <h2 className="text-3xl font-bold mb-12 uppercase tracking-tight text-zinc-900 dark:text-white">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 font-mono text-xs">
          <div className="p-6 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80">
            <p className="text-[#00E5FF] mb-2 font-bold text-sm">01 // PROFILE CREATION</p>
            <p className="text-zinc-700 dark:text-zinc-300">
              Users create structured applicant or recruiter profiles within the system using our intelligent onboarding flow.
            </p>
          </div>

          <div className="p-6 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80">
            <p className="text-[#FF0055] mb-2 font-bold text-sm">02 // SKILL INDEXING</p>
            <p className="text-zinc-700 dark:text-zinc-300">
              The engine analyzes, indexes, and maps technical competencies into an indexed, searchable talent graph.
            </p>
          </div>

          <div className="p-6 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80">
            <p className="text-[#00E5FF] mb-2 font-bold text-sm">03 // DIRECT MATCHING</p>
            <p className="text-zinc-700 dark:text-zinc-300">
              Matches are streamed instantly into a live hiring pipeline interface for real-time review and communication.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE EXTENDED SECTIONS: 5-Part Lifecycle Architecture (In MatchNexx Design)
      ========================================================================== */}
      <section className="px-6 lg:px-16 py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#08080a]">
        <div className="w-full mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-widest uppercase text-[#00E5FF] block mb-2">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
              Five Parts, One Continuous Workflow
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-2 max-w-xl">
              From raw career history to verifiable ATS compliance, vector matching, telemetry and direct sync: MatchNexx is the unified layer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 font-mono">
            <div className="p-6 bg-[#0f0f12] border border-zinc-800 hover:border-[#00E5FF] transition-colors rounded-sm space-y-3">
              <span className="text-xs font-bold text-[#00E5FF]">01 // STRUCTURE</span>
              <h3 className="font-bold text-sm text-white uppercase">Profile Parse</h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Raw career records transformed into ATS-perfect schemas, normalized roles, and JSON-LD data.
              </p>
            </div>

            <div className="p-6 bg-[#0f0f12] border border-zinc-800 hover:border-[#00E5FF] transition-colors rounded-sm space-y-3">
              <span className="text-xs font-bold text-[#00E5FF]">02 // ATS AUDIT</span>
              <h3 className="font-bold text-sm text-white uppercase">Pre-Submission Audit</h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Audits semantic keyword density, removes parsing corruptions, and verifies ATS passability.
              </p>
            </div>

            <div className="p-6 bg-[#0f0f12] border border-zinc-800 hover:border-[#FF0055] transition-colors rounded-sm space-y-3">
              <span className="text-xs font-bold text-[#FF0055]">03 // VECTOR MATCH</span>
              <h3 className="font-bold text-sm text-white uppercase">Match Matrix</h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Multi-dimensional vector scoring matches candidate skills to active engineering roles with high fidelity.
              </p>
            </div>

            <div className="p-6 bg-[#0f0f12] border border-zinc-800 hover:border-[#FF0055] transition-colors rounded-sm space-y-3">
              <span className="text-xs font-bold text-[#FF0055]">04 // TELEMETRY</span>
              <h3 className="font-bold text-sm text-white uppercase">Live Pipeline</h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Real-time tracking notifications when recruiters view, evaluate, or shortlist your profile.
              </p>
            </div>

            <div className="p-6 bg-[#0f0f12] border border-zinc-800 hover:border-emerald-400 transition-colors rounded-sm space-y-3">
              <span className="text-xs font-bold text-emerald-400">05 // SYNC & OWN</span>
              <h3 className="font-bold text-sm text-white uppercase">Direct Ownership</h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Export your structured profile anytime as plain JSON, PDF, or markdown. Zero middleman fee gouging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE TELEMETRY & ENGINE INSPECTOR (In MatchNexx Cyber Style)
      ========================================================================== */}
      <section className="px-6 lg:px-16 py-24 border-t border-zinc-200 dark:border-zinc-900">
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-[#FF0055] block">
              LIVE ENGINE TELEMETRY
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
              Watch The Hiring Engine In Real Time
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-light">
              Explore how MatchNexx parses resumes, executes sub-15ms candidate matching against production talent pools, and streams instant telemetry across recruiter review nodes.
            </p>

            <div className="space-y-3 pt-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                <span>Deterministic ATS Scoring (Keyword & Format Audited)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#FF0055]" />
                <span>Sub-15ms Query Latency on Candidate Graphs</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Zero Agency Markup or Data Captivity</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-sm shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Bar */}
              <div className="px-4 py-3 bg-[#141418] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                  <span className="ml-2 text-zinc-400 text-[11px]">MATCHNEXX-CORE-NODE // v2.4</span>
                </div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-800 bg-[#0a0a0c] text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("cv")}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-zinc-800 ${
                    activeTab === "cv"
                      ? "text-[#00E5FF] bg-[#0f0f12] font-bold border-b-2 border-b-[#00E5FF]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>01 // CV STRUCTURER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("match")}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-zinc-800 ${
                    activeTab === "match"
                      ? "text-[#FF0055] bg-[#0f0f12] font-bold border-b-2 border-b-[#FF0055]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FiCpu className="w-3.5 h-3.5" />
                  <span>02 // MATCH MATRIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("telemetry")}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "telemetry"
                      ? "text-emerald-400 bg-[#0f0f12] font-bold border-b-2 border-b-emerald-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FiActivity className="w-3.5 h-3.5" />
                  <span>03 // LIVE PIPELINE</span>
                </button>
              </div>

              {/* Terminal Content */}
              <div className="p-5 space-y-3 text-zinc-300 min-h-[250px] leading-relaxed">
                {activeTab === "cv" && (
                  <div className="space-y-2">
                    <p className="text-zinc-500 text-[10px]"># Parsing unstructured PDF experience tree</p>
                    <p>
                      <span className="text-[#00E5FF]">$</span> matchnexx parse resume.pdf --output=structured-ats
                    </p>
                    <div className="pl-3 border-l-2 border-[#00E5FF]/40 text-zinc-400 space-y-1 text-[11px]">
                      <p><span className="text-emerald-400">✓</span> Ingested 5 yrs experience · Senior Engineer profile</p>
                      <p><span className="text-emerald-400">✓</span> Stacks: <span className="text-[#00E5FF]">React, TypeScript, Go, PostgreSQL, AWS, Docker</span></p>
                      <p><span className="text-emerald-400">✓</span> ATS Passability Rating: <span className="text-[#00E5FF] font-bold">98.4%</span></p>
                      <p className="text-zinc-500">→ Profile indexed into talent pipeline node.</p>
                    </div>
                  </div>
                )}

                {activeTab === "match" && (
                  <div className="space-y-2">
                    <p className="text-zinc-500 text-[10px]"># Querying candidate pool for Senior Fullstack</p>
                    <p>
                      <span className="text-[#FF0055]">$</span> matchnexx query --role="Senior Fullstack" --min-score=90
                    </p>
                    <div className="pl-3 border-l-2 border-[#FF0055]/40 text-zinc-400 space-y-1 text-[11px]">
                      <p><span className="text-[#FF0055]">● [Candidate #8210]</span> Lagos / Remote · Stacks: React, Go, Kafka (97.2% Match)</p>
                      <p><span className="text-[#FF0055]">● [Candidate #4491]</span> London / Remote · Stacks: Python, AWS, Docker (94.8% Match)</p>
                      <p className="text-emerald-400 font-bold">✓ 14 verified candidates found in 14.2ms</p>
                    </div>
                  </div>
                )}

                {activeTab === "telemetry" && (
                  <div className="space-y-2">
                    <p className="text-zinc-500 text-[10px]"># Streaming websocket event bus</p>
                    <div className="space-y-1 text-[11px] text-zinc-400">
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[10px]">10:02:11</span>
                        <span className="text-emerald-400 font-bold">[SYNC]</span>
                        <span>Candidate #8210 deployed to public hiring pool</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[10px]">10:02:44</span>
                        <span className="text-[#00E5FF] font-bold">[VIEW]</span>
                        <span>Engineering Team Lead (Fintech) viewed full profile</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[10px]">10:03:02</span>
                        <span className="text-[#FF0055] font-bold">[SHORTLIST]</span>
                        <span>Candidate added to interview shortlist node</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPARISON MATRIX: MatchNexx vs Legacy Job Boards (In MatchNexx Cyber Style)
      ========================================================================== */}
      <section className="px-6 lg:px-16 py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#08080a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono tracking-widest uppercase text-[#00E5FF] block mb-2">
              WHY MATCHNEXX
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
              MatchNexx vs Legacy Job Boards
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-2">
              How our modern hiring infrastructure outperforms outdated portals
            </p>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800 rounded-sm overflow-hidden text-xs font-mono">
            <div className="grid grid-cols-12 p-4 bg-[#141418] border-b border-zinc-800 text-zinc-400 font-bold">
              <div className="col-span-6 sm:col-span-5 uppercase">Capability</div>
              <div className="col-span-3 sm:col-span-4 text-[#00E5FF] uppercase">MatchNexx</div>
              <div className="col-span-3 text-zinc-500 uppercase">Legacy Job Sites</div>
            </div>

            <div className="divide-y divide-zinc-800/60">
              <div className="grid grid-cols-12 p-4 items-center hover:bg-zinc-900/40 transition-colors">
                <div className="col-span-6 sm:col-span-5 text-white">Automated ATS Pre-Audit</div>
                <div className="col-span-3 sm:col-span-4 flex items-center gap-1.5 text-emerald-400">
                  <FiCheck className="w-4 h-4" />
                  <span>Real-time Scoring</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5 text-zinc-500">
                  <FiX className="w-4 h-4 text-red-500" />
                  <span>None</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-zinc-900/40 transition-colors">
                <div className="col-span-6 sm:col-span-5 text-white">Live Pipeline Telemetry</div>
                <div className="col-span-3 sm:col-span-4 flex items-center gap-1.5 text-emerald-400">
                  <FiCheck className="w-4 h-4" />
                  <span>Instant View Alerts</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5 text-zinc-500">
                  <FiX className="w-4 h-4 text-red-500" />
                  <span>Black Hole Email</span>
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-zinc-900/40 transition-colors">
                <div className="col-span-6 sm:col-span-5 text-white">Direct Recruiter Query Latency</div>
                <div className="col-span-3 sm:col-span-4 text-[#00E5FF]">
                  &lt; 14 milliseconds
                </div>
                <div className="col-span-3 text-zinc-500">
                  Days / Weeks
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-zinc-900/40 transition-colors">
                <div className="col-span-6 sm:col-span-5 text-white">Recruiter Placement Fees</div>
                <div className="col-span-3 sm:col-span-4 flex items-center gap-1.5 text-emerald-400">
                  <span>0% Commission</span>
                </div>
                <div className="col-span-3 text-zinc-500">
                  15% - 25% Salary Cut
                </div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-zinc-900/40 transition-colors">
                <div className="col-span-6 sm:col-span-5 text-white">Full Code & Data Export</div>
                <div className="col-span-3 sm:col-span-4 flex items-center gap-1.5 text-emerald-400">
                  <FiCheck className="w-4 h-4" />
                  <span>JSON-LD / PDF</span>
                </div>
                <div className="col-span-3 flex items-center gap-1.5 text-zinc-500">
                  <FiX className="w-4 h-4 text-red-500" />
                  <span>Proprietary Lock-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION (SEO + RICH SNIPPETS) ================= */}
      <section className="px-6 lg:px-16 py-24 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono tracking-widest uppercase text-[#00E5FF] block mb-2">
              KNOWLEDGE BASE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-2">
              Everything you need to know about the MatchNexx talent matching ecosystem
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 flex items-center justify-between text-left text-sm md:text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight hover:text-[#00E5FF] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <FiChevronDown
                      className={`w-5 h-5 text-zinc-400 transform transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#00E5FF]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/50 dark:border-zinc-800/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA: Ready To Build? (Maintained in user's design) ================= */}
      <section className="px-6 lg:px-16 py-28 text-center border-t border-zinc-200 dark:border-zinc-900">
        <h2 className="text-4xl md:text-5xl font-extrabold uppercase mb-6 text-zinc-900 dark:text-white">
          Build Smarter Hiring Systems
        </h2>

        <p className="text-zinc-500 max-w-xl mx-auto mb-10 text-sm">
          Replace fragmented hiring workflows with a unified, intelligent talent infrastructure built for speed and precision.
        </p>

        <Link
          to="/login"
          className="inline-block bg-gradient-to-r from-[#00E5FF] to-[#FF0055] px-10 py-4 text-black font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}