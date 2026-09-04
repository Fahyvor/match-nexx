import { FaXTwitter, FaLinkedin, FaGithub } from "react-icons/fa6";
const Footer = () => {
  return (
    <footer className="border-t border-zinc-900 bg-[#070708] text-white font-sans text-xs">
      {/* Top Section: Navigation Grid & Brand Intro */}
      <div className="w-full mx-auto px-6 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse" />
            <span className="font-extrabold tracking-wider text-white text-base uppercase font-mono">
              Match<span className="text-[#00E5FF]">-</span>Nexx
            </span>
          </div>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
            Bridging elite talent with intelligent hiring systems. Automated CV structuring, real-time telemetry, and direct recruiter synchronization.
          </p>
          <div className="pt-2 flex items-center gap-4 text-zinc-500">
            <a
              href="https://x.com/iamfavour3"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              className="hover:text-[#00E5FF] transition-colors p-1"
            >
              <FaXTwitter className="w-4 h-4" />
            </a>

            <a
              href="https://linkedin.com/in/fahyvor"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-[#00E5FF] transition-colors p-1"
            >
              <FaLinkedin className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/fahyvor/match-nexx"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-[#00E5FF] transition-colors p-1"
            >
              <FaGithub className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 1: Platform */}
        <div className="space-y-3">
          <p className="font-mono text-zinc-200 text-xs uppercase tracking-widest font-semibold">
            Platform
          </p>
          <ul className="space-y-2 text-zinc-500 font-mono text-[11px]">
            <li><a href="/applicant/dashboard" className="hover:text-[#00E5FF] transition-colors">For Applicants</a></li>
            <li><a href="/recruiter/dashboard" className="hover:text-[#FF0055] transition-colors">For Recruiters</a></li>
            <li><a href="/jobs" className="hover:text-white transition-colors">Matching Engine</a></li>
            <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div className="space-y-3">
          <p className="font-mono text-zinc-200 text-xs uppercase tracking-widest font-semibold">
            Resources
          </p>
          <ul className="space-y-2 text-zinc-500 font-mono text-[11px]">
            {/* <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li> */}
            <li><a href="/applicant/cv-builder" className="hover:text-white transition-colors">CV Structurer</a></li>
            {/* <li><a href="/api" className="hover:text-white transition-colors">API Reference</a></li> */}
            <li><a href="/status" className="hover:text-white transition-colors">System Status</a></li>
          </ul>
        </div>

        {/* Column 3: Legal & Compliance */}
        <div className="space-y-3">
          <p className="font-mono text-zinc-200 text-xs uppercase tracking-widest font-semibold">
            Legal (NG)
          </p>
          <ul className="space-y-2 text-zinc-500 font-mono text-[11px]">
            <li><a href="/privacy" className="hover:text-[#00E5FF] transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-[#FF0055] transition-colors">Terms of Service</a></li>
            <li><a href="/ndpa-compliance" className="hover:text-white transition-colors">NDPA Compliance</a></li>
            <li><a href="/security" className="hover:text-white transition-colors">Security Overview</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Telemetry & Copyright */}
      <div className="border-t border-zinc-900 bg-[#050506] py-6 px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-zinc-600 tracking-wider gap-4">
        {/* Network Metrics */}
        <div className="flex flex-wrap items-center gap-6">
          <span>STATUS: <span className="text-[#00E5FF]">ONLINE</span></span>
          <span>NET_TRAFFIC: <span className="text-[#FF0055]">STABLE</span></span>
          <span>REGION: <span className="text-white">NG-LOS</span></span>
        </div>

        {/* Copyright */}
        <div>
          MATCH-NEXX © {new Date().getFullYear()} ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;