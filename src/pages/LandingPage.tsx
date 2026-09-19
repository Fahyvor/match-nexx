import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { FiChevronDown, FiArrowRight, FiCheckCircle } from "react-icons/fi";

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
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      <main className="w-full mx-auto px-6 lg:px-16 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
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

      {/* ================= FEATURES ================= */}
      <section className="px-6 lg:px-16 py-24 grid md:grid-cols-3 gap-8">
        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-zinc-600 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Smart Matching Engine</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            AI-driven candidate scoring system that maps skills, experience, and intent into structured hiring signals.
          </p>
        </article>

        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-zinc-600 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Real-Time Pipeline Tracking</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Monitor applicant flow from application to decision in a live synchronized hiring dashboard.
          </p>
        </article>

        <article className="border border-zinc-800 p-6 bg-[#0f0f12] hover:border-zinc-600 transition rounded-sm">
          <h3 className="font-bold uppercase text-sm mb-3 text-white">Structured CV Intelligence</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automatically transforms resumes into recruiter-ready structured data for instant evaluation and ATS compliance.
          </p>
        </article>
      </section>

      {/* ================= HOW IT WORKS ================= */}
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

      {/* ================= FINAL CTA ================= */}
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