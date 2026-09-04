

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          Privacy Policy
        </h1>
      </div>

      {/* Main Content */}
      <div className="space-y-10 text-sm leading-relaxed text-white">
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            1. Regulatory Framework
          </h2>
          <p>
            Match-Nexx ("Platform", "We", "Us") respects your privacy and is committed to protecting personal data. This Privacy Policy outlines our practices in accordance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and regulations set forth by the Nigeria Data Protection Commission (NDPC).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            2. Information We Collect
          </h2>
          <p className="mb-3">We collect personal data that you provide directly, as well as metadata generated through telemetry and algorithmic matching:</p>
          <ul className="list-disc list-inside space-y-2 font-mono text-xs text-white">
            <li><strong className="text-zinc-200">Applicant Data:</strong> Full name, contact details, work experience, educational history, CV files, portfolio links, and skill parameters.</li>
            <li><strong className="text-zinc-200">Recruiter Data:</strong> Work email, corporate credentials, hiring preferences, and candidate interaction logs.</li>
            <li><strong className="text-zinc-200">Automated Data:</strong> System telemetry (IP addresses, response latency, device descriptors, and session data).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            3. Legal Basis & Use of Data
          </h2>
          <p className="mb-3">Under the NDPA 2023, we process your data based on <em>Consent</em> and <em>Contractual Necessity</em> for the following purposes:</p>
          <ul className="list-disc list-inside space-y-2 font-mono text-xs text-white">
            <li>Extracting and structuring CV metrics into AI candidate scoring engines.</li>
            <li>Syncing applicants with prospective recruiters via talent graph matching.</li>
            <li>Maintaining platform telemetry, network traffic security, and uptime performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            4. Automated Decision-Making & AI Processing
          </h2>
          <p>
            Our system utilizes automated scoring engines to match skill structures to job descriptions. Applicants retain the right under Nigerian data protection laws to request human review or object to automated scoring decisions by contacting our Data Protection Officer (DPO).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            5. Data Rights under NDPA
          </h2>
          <p className="mb-3">As a Nigerian data subject, you are entitled to the following rights:</p>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0f0f12] border border-zinc-800 p-4">
              <span className="text-[#00E5FF] font-bold block mb-1">RIGHT TO ACCESS & PORTABILITY</span>
              Request copies of your structured resume profile and system interaction history.
            </div>
            <div className="bg-[#0f0f12] border border-zinc-800 p-4">
              <span className="text-[#FF0055] font-bold block mb-1">RIGHT TO ERASURE</span>
              Request total deletion of your profile and historical resume parses from our servers.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-3 border-l-2 border-[#00E5FF] pl-3">
            6. Contact & DPO Inquiries
          </h2>
          <p>
            For compliance inquiries, data removal, or exercising NDPA rights, contact our Data Protection Team at <span className="text-[#00E5FF] font-mono">elreytechnologies@gmail.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}