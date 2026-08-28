import React, { useState } from 'react';
import {
  FaEnvelope,
  FaLocationDot,
  FaXTwitter,
  FaLinkedin,
  FaGithub,
} from 'react-icons/fa6';
import api from '../utils/api';
import SleekToast, { toast } from 'sleek-toast';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please complete all fields.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.auth.contact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      // return console.log('CONTACT FORM RESPONSE:', response);

      if (response.data.success === true) {
        setSubmitted(true);

        setName('');
        setEmail('');
        setSubject('');
        setMessage('');

        toast.success(response?.data?.message);
      } else {
        toast.error(
          response.data.message || 'Failed to send message.'
        );
      }
    } catch (error: any) {
      console.error('CONTACT FORM ERROR:', error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to send your message.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans antialiased px-6 lg:px-16 pt-20 pb-32 w-full mx-auto">
      <SleekToast />

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
        <div className="md:col-span-5 space-y-8 text-xs">
          <div className="bg-[#0f0f12] border border-zinc-800 p-6 space-y-4">
            <span className="text-[#00E5FF] font-bold block">
              DIRECT CHANNELS
            </span>

            <div className="flex items-start gap-3 text-zinc-400">
              <FaEnvelope className="text-[#00E5FF] mt-0.5" />

              <div>
                <p className="text-white font-bold">
                  Email Inquiries
                </p>

                <p className="text-zinc-500 text-[11px]">
                  elreytechnologies@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-zinc-400 pt-2 border-t border-zinc-900">
              <FaLocationDot className="text-[#FF0055] mt-0.5" />

              <div>
                <p className="text-white font-bold">
                  Location
                </p>

                <p className="text-zinc-500 text-[11px]">
                  Abuja, Federal Republic of Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Network Channels */}
          <div className="bg-[#0f0f12] border border-zinc-800 p-6">
            <span className="text-[#FF0055] font-bold block mb-4">
              NETWORK CHANNELS
            </span>

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
              <span className="text-[#00E5FF] text-lg font-bold block">
                [ PACKET_TRANSMITTED ]
              </span>

              <p className="text-xs text-zinc-400">
                Your message has been delivered to our engineering
                nodes. Expect a reply within 24 hours.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-[10px] uppercase text-zinc-500 hover:text-white underline pt-4 block mx-auto"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Identity / Full Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Favour"
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Return Address (Email)
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Enterprise Inquiry"
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  Message Payload
                </label>

                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message or enterprise inquiry..."
                  className="w-full bg-[#070708] border border-zinc-800 focus:border-[#00E5FF] text-white text-xs p-3 outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00E5FF] cursor-pointer hover:bg-[#1ae8ff] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs tracking-widest uppercase py-4 transition-colors"
              >
                {submitting ? 'Transmitting...' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}