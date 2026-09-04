export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Ambient Glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-r from-[#00E5FF]/20 to-[#FF0055]/20 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* BIG 404 */}
      <h1 className="text-[120px] md:text-[180px] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF0055]">
        404
      </h1>

      {/* MESSAGE */}
      <p className="text-white text-center max-w-md text-sm md:text-base leading-relaxed mt-4">
        The requested node could not be resolved. This endpoint may have been
        deprecated, relocated, or never initialized in the system.
      </p>

      {/* ACTION BUTTONS */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">

        {/* GO HOME */}
        <button
          onClick={() => (window.location.href = "/")}
          className="px-8 py-3 bg-gradient-to-r from-[#00E5FF] to-[#FF0055] text-black font-bold text-xs tracking-widest uppercase cursor-pointer"
        >
          Return Home
        </button>

        {/* GO BACK */}
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 border border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-xs tracking-widest uppercase hover:border-zinc-500 cursor-pointer"
        >
          Go Back
        </button>
      </div>

      {/* SCANLINE EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_bottom,transparent_50%,black_50%)] bg-[size:100%_4px]" />

      {/* FOOTNOTE */}
      <p className="absolute bottom-6 text-[10px] text-zinc-600 font-mono tracking-widest">
        SYSTEM TRACE ID: 0xA94F-404-NODE
      </p>
    </div>
  );
}