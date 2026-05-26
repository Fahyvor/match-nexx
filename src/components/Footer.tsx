import React from 'react'

const Footer = () => {
  return (
    <div className="border-t border-zinc-900 bg-[#070708] py-8 px-6 lg:px-16 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-600 tracking-wider gap-4">
        <div className="flex items-center gap-6">
          <span>STATUS: <span className="text-[#00E5FF]">ONLINE</span></span>
          <span>NET_TRAFFIC: <span className="text-[#FF0055]">STABLE</span></span>
        </div>
        <div>HIREFLOW © {new Date().getFullYear()}</div>
    </div>
  )
}

export default Footer