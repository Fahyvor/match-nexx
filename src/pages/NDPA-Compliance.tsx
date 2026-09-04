
export default function NDPACompliance() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[11px] font-mono tracking-widest text-[#00E5FF] mb-4">
          NIGERIA_DATA_PROTECTION_ACT 2023
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          NDPA Compliance Statement
        </h1>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Regulatory alignment with the Nigeria Data Protection Commission (NDPC)
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-white">
        <section>
          <h2 className="text-lg font-bold text-white uppercase border-l-2 border-[#00E5FF] pl-3 mb-3">
            Compliance Standards
          </h2>
          <p>
            Match-Nexx operates strictly under the principles of the Nigeria Data Protection Act (NDPA) 2023. We ensure personal candidate data is collected lawfully, stored securely within compliant data centers, and processed exclusively for stated hiring purposes.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0f0f12] border border-zinc-800 p-4">
            <span className="text-[#00E5FF] font-bold block mb-1">CONSENT-FIRST PROCESSING</span>
            Candidates maintain full legal ownership over their profile publication and data sharing.
          </div>
          <div className="bg-[#0f0f12] border border-zinc-800 p-4">
            <span className="text-[#FF0055] font-bold block mb-1">RIGHT TO BE FORGOTTEN</span>
            Execute immediate automated removal of candidate metrics upon account termination.
          </div>
        </section>
      </div>
    </div>
  );
}