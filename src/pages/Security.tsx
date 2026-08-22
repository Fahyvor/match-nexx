
export default function SecurityOverview() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          Security Overview
        </h1>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Data Encryption, Access Control, & Platform Safeguards
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
        <section className="grid md:grid-cols-3 gap-6 text-xs">
          <div className="bg-[#0f0f12] border border-zinc-800 p-6">
            <h3 className="text-white font-bold uppercase mb-2">AES-256 Encryption</h3>
            <p className="text-zinc-500">All candidate files and resume raw text are encrypted at rest using AES-256 protocols.</p>
          </div>
          <div className="bg-[#0f0f12] border border-zinc-800 p-6">
            <h3 className="text-white font-bold uppercase mb-2">TLS 1.3 in Transit</h3>
            <p className="text-zinc-500">Telemetry signals and search queries strictly enforce TLS 1.3 encrypted transport.</p>
          </div>
          <div className="bg-[#0f0f12] border border-zinc-800 p-6">
            <h3 className="text-white font-bold uppercase mb-2">Role Access (RBAC)</h3>
            <p className="text-zinc-500">Strict separation between applicant profiles, recruiter access, and internal administration.</p>
          </div>
        </section>
      </div>
    </div>
  );
}