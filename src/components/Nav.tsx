
const Nav = () => {
  return (
    <div className="sticky top-0 z-50 bg-cyber-dark backdrop-blur-xl border-b border-zinc-800/60 px-6 lg:px-16 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group">
          {/* Kinetic asymmetric logo concept */}
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 group-hover:-translate-x-1 transition-transform duration-300 mix-blend-screen" />
          </div>
          <span className="text-xl font-black text-accent-cyan tracking-tighter uppercase font-mono" onClick={() => window.location.href="/"}>
            HIRE<span className="text-accent-cyan">.</span>FLOW
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <button className="relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink cursor-pointer hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all duration-300 overflow-hidden group" onClick={() => window.location.href="/login"}>
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
          </button>
        </div>
      </div>
  )
}

export default Nav