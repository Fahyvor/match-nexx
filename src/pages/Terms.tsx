import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          Terms of Service
        </h1>
      </div>

      {/* Main Content */}
      <div className="space-y-10 text-sm leading-relaxed text-zinc-400">
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#FF0055] pl-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By initializing a profile or executing search protocols on Match-Nexx ("Platform"), you agree to abide by these Terms of Service and applicable laws within the Federal Republic of Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#FF0055] pl-3">
            2. Platform Provision & Account Usage
          </h2>
          <ul className="list-disc list-inside space-y-2 font-mono text-xs text-zinc-400">
            <li><strong className="text-zinc-200">Applicants:</strong> You warrant that all CV material, work history, and identity information submitted represent truthful and accurate personal data.</li>
            <li><strong className="text-zinc-200">Recruiters:</strong> You agree to use platform query engines strictly for authorized hiring purposes. Sourcing candidate profiles for secondary data resale or unsolicited mass marketing is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#FF0055] pl-3">
            3. Intellectual Property
          </h2>
          <p>
            All platform algorithms, UI design systems, structured CV scoring models, and brand logos remain the exclusive intellectual property of Match-Nexx. Users retain ownership of their raw uploaded documents, granting Match-Nexx a non-exclusive license to process and display data for recruitment synchronization.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#FF0055] pl-3">
            4. Limitation of Liability & Disclaimers
          </h2>
          <div className="bg-[#0f0f12] border border-zinc-800 p-4 font-mono text-xs space-y-2">
            <p className="text-zinc-300">
              Match-Nexx provides an algorithmic matching pipeline "as is". We do not guarantee employment offers for applicants or successful hires for recruiters.
            </p>
            <p className="text-zinc-500">
              In no event shall Match-Nexx be liable for indirect damages, systemic network outages, or hiring decisions made by third-party recruiters on the platform.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#FF0055] pl-3">
            5. Governing Law
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any legal disputes arising out of the platform shall be subjected to binding arbitration or court procedures within Lagos State, Nigeria.
          </p>
        </section>
      </div>
    </div>
  );
}