import React, { useState } from 'react';
import { FaEnvelope, FaLocationDot, FaXTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
          Contact Protocol
        </h1>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Initiate direct communication with engineering & support nodes
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-12">
        {/* Left Info Column */}
        <div className="md:col-span-5 space-y-8 font-mono text-xs">
          <div className="bg-[#0f0f12] border border-zinc-800 p-6 space-y-4">
            <span className="text-[#00E5FF] font-bold block">DIRECT CHANNELS</span>
            
            <div className="flex items-start gap-3 text-zinc-400">
              <FaEnvelope className="text-[#00E5FF] mt-0.5" />
              <div>
                <p className="text-white font-bold">Email Inquiries</p>
                <p className="text-zinc-500 text-[11px]">elreytechnologies@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-zinc-400 pt-2 border-t border-zinc-900">
              <FaLocationDot className="text-[#FF0055] mt-0.5" />
              <div>
                <p className="text-white font-bold">Region Node</p>
                <p className="text-zinc-500 text-[11px]">Abuja, Federal Republic of Nigeria</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f12] border border-zinc-800 p-6">
            <span className="text-[#FF0055] font-bold block mb-4">NETWORK CHANNELS</span>
            <div className="flex items-center gap-4 text-zinc-400">
              <a
                href="https://x.com/iamfavour3"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors p-3 bg-zinc-900 border border-zinc-800"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/fahyvor"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors p-3 bg-zinc-900 border border-zinc-800"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/fahyvor/match-nexx"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00E5FF] transition-colors p-3 bg-zinc-900 border border-zinc-800"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 bg-[#0f0f12] border border-zinc-800 p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-[#00E5FF] text-lg font-bold block">[ PACKET_TRANSMITTED ]</span>
              <p className="text-xs text-zinc-400">
                Your message has been delivered to our engineering nodes. Expect a reply within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-[10px] uppercase text-zinc-500 hover:text-white underline pt-4 block mx-auto"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Identity / Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Favour"
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Return Address (Email)
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Message Payload
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter message or enterprise inquiry..."
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00E5FF] cursor-pointer hover:bg-[#1ae8ff] text-black font-bold text-xs tracking-widest uppercase py-4 transition-colors"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}