import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate, Link } from "react-router-dom";

import { FaBriefcase, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { RiUserSettingsFill } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";

const Nav = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  const firstName = user?.firstName;
  const role = user?.role;

  const handleDashboard = () => {
    setOpen(false);
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (role === "recruiter") {
      navigate("/recruiter/dashboard");
    } else {
      navigate("/applicant/dashboard");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const toggleMobileMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* =====================================================
          FLOATING CENTERED NAVBAR CONTAINER
      ====================================================== */}
      <header className="sticky bg-black top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav
          aria-label="Main Navigation"
          className="w-fit mx-auto bg-white/80 dark:bg-[#070708]/90 backdrop-blur-xl border-2 border-zinc-800/80 rounded-2xl px-6 py-4 flex gap-8 justify-between items-center shadow-2xl"
        >
          {/* LOGO */}
          <Link
            to="/"
            onClick={handleCancel}
            aria-label="MatchNexx Home"
            className="flex items-center gap-2 min-w-0 cursor-pointer group"
          >
            <div className="relative w-6 h-6 shrink-0">
              <div className="absolute inset-0 bg-[#00E5FF] transform -skew-x-12 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-[#FF0055] transform skew-x-12 translate-x-1 group-hover:-translate-x-1 transition-transform duration-300 mix-blend-screen" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase font-mono truncate">
              MATCH<span className="text-[#00E5FF]">.</span>NEXX
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8 shrink-0">
            <Link
              to="/jobs"
              className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#00E5FF] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Jobs</span>
            </Link>

            <Link
              to="/about"
              className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              About
            </Link>

            <Link
              to="/pricing"
              className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              Pricing
            </Link>

            <Link
              to="/contact"
              className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              Contact
            </Link>

            <button
              type="button"
              onClick={handleDashboard}
              className="relative px-5 py-2 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-[#FF0055] cursor-pointer hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all duration-300 overflow-hidden group whitespace-nowrap"
            >
              <span className="relative z-10">
                {isAuthenticated ? `Hi, ${firstName || "User"}` : "Get Started"}
              </span>
              <div className="absolute inset-0 bg-[#FF0055] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
            </button>

            <Link
              to="/settings"
              aria-label="Account Settings"
              className="text-white cursor-pointer hover:text-[#00E5FF] transition-colors duration-200"
            >
              <RiUserSettingsFill className="w-5 h-5" />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden text-white cursor-pointer relative z-[70] shrink-0 p-1"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </nav>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={handleCancel}
          aria-hidden="true"
        />
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-[#070708] border-l border-zinc-800 shadow-2xl md:hidden overflow-y-auto pt-6 transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-6 pb-6 border-b border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
            Match Nexx
          </span>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close menu"
            className="flex items-center justify-center w-8 h-8 rounded border border-zinc-800 text-white hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-6 text-xs uppercase">
          <Link
            to="/jobs"
            onClick={handleCancel}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <FaBriefcase className="w-4 h-4 text-[#00E5FF]" />
            <span>Jobs</span>
          </Link>

          <Link
            to="/about"
            onClick={handleCancel}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <FaInfoCircle className="w-4 h-4 text-[#00E5FF]" />
            <span>About Us</span>
          </Link>

          <Link
            to="/pricing"
            onClick={handleCancel}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <FaBriefcase className="w-4 h-4 text-[#FF0055]" />
            <span>Pricing</span>
          </Link>

          <Link
            to="/contact"
            onClick={handleCancel}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <FaEnvelope className="w-4 h-4 text-[#FF0055]" />
            <span>Contact Us</span>
          </Link>

          <button
            type="button"
            onClick={handleDashboard}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <MdDashboard className="w-4 h-4 text-[#00E5FF]" />
            <span>Dashboard</span>
          </button>

          <Link
            to="/settings"
            onClick={handleCancel}
            className="flex items-center gap-3 text-zinc-300 hover:text-[#00E5FF] transition-colors text-left py-2 border-b border-zinc-900"
          >
            <RiUserSettingsFill className="w-4 h-4 text-[#FF0055]" />
            <span>Profile Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleDashboard}
            className="mt-4 w-full bg-[#FF0055] hover:bg-[#ff1a66] text-white font-bold py-3 uppercase tracking-widest transition-colors text-center cursor-pointer"
          >
            {isAuthenticated ? `Welcome, ${firstName || "User"}` : "Get Started"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Nav;