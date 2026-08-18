import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import { RiUserSettingsFill } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";
import { MdDashboard } from "react-icons/md"

const Nav = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const user = useSelector((state: RootState) => state.user.user);

  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  const firstName = user?.firstName;
  const role = user?.role;

  /**
   * Navigate to dashboard
   */
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

  /**
   * Navigate to jobs
   */
  const handleJobs = () => {
    setOpen(false);
    navigate("/jobs");
  };

  /**
   * Navigate to settings
   */
  const handleSettings = () => {
    setOpen(false);
    navigate("/settings");
  };

  /**
   * Navigate home
   */
  const handleLogoClick = () => {
    setOpen(false);
    navigate("/");
  };

  /**
   * Toggle mobile navigation
   */
  const toggleMobileMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-cyber-dark font-sans backdrop-blur-xl border-b border-zinc-800/60 px-6 lg:px-16 py-5 flex justify-between items-center">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={handleLogoClick}
      >

        <div className="relative w-6 h-6">
          <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12 group-hover:translate-x-1 transition-transform duration-300" />

          <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 group-hover:-translate-x-1 transition-transform duration-300 mix-blend-screen" />
        </div>

        {/* Logo Text */}
        <span className="text-xl font-black text-accent-cyan-light dark:text-accent-cyan tracking-tighter uppercase font-mono">
          HIRE
          <span className="text-accent-cyan-light dark:text-accent-cyan">
            .
          </span>
          FLOW
        </span>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}
      <div className="hidden md:flex items-center gap-6">
        {/* Jobs */}
        <button
          type="button"
          onClick={handleJobs}
          aria-label="Jobs"
          className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <FaBriefcase className="w-5 h-5" />
        </button>

        {/* Dashboard / Get Started */}
        <button
          type="button"
          onClick={handleDashboard}
          className="relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink cursor-pointer hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all duration-300 overflow-hidden group"
        >
          <span className="relative z-10">
            {isAuthenticated ? `Hi, ${firstName}` : "Get Started"}
          </span>

          {/* Hover animation */}
          <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={handleSettings}
          aria-label="Settings"
          className="text-white cursor-pointer hover:text-accent-cyan transition-colors duration-200"
        >
          <RiUserSettingsFill className="w-5 h-5" />
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU BUTTON
      ====================================================== */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className="md:hidden text-white cursor-pointer relative z-[60]"
      >
        {open ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div
        className={`
          absolute top-full right-0 w-[80%] max-w-sm bg-cyber-panel border-l border-b border-zinc-800 shadow-lg md:hidden h-screen transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col gap-5 px-6 py-6">
          {/* =================================================
              MOBILE JOBS
          ================================================== */}
          <button
            type="button"
            onClick={handleJobs}
            className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors duration-200 text-left cursor-pointer"
          >
            <FaBriefcase className="w-5 h-5" />

            <span>Jobs</span>
          </button>

          {/* =================================================
              MOBILE SETTINGS
          ================================================== */}
          <button
            type="button"
            onClick={handleSettings}
            className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors duration-200 text-left cursor-pointer"
          >
            <RiUserSettingsFill className="w-5 h-5" />

            <span>Profile Settings</span>
          </button>

          {/* =================================================
              MOBILE DASHBOARD
          ================================================== */}

          <button
            type="button"
            onClick={handleDashboard}
            className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors duration-200 text-left cursor-pointer"
          >
            <MdDashboard className="w-5 h-5" />

            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-3 text-zinc-200 hover:text-white transition-colors duration-200 text-left cursor-pointer"
          >
            <span>
              {isAuthenticated
                ? `Welcome, ${firstName}`
                : "Get Started"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nav;