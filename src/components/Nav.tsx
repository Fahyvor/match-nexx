import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import { RiUserSettingsFill } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";

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

  const handleJobs = () => {
    setOpen(false);
    navigate("/jobs");
  };

  const handleSettings = () => {
    setOpen(false);
    navigate("/settings");
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-cyber-dark backdrop-blur-xl border-b border-zinc-800/60 px-6 lg:px-16 py-5 flex justify-between items-center">

      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/")}
      >
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12 group-hover:translate-x-1 transition-transform duration-300" />
          <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 group-hover:-translate-x-1 transition-transform duration-300 mix-blend-screen" />
        </div>

        <span className="text-xl font-black text-accent-cyan tracking-tighter uppercase font-mono">
          HIRE<span className="text-accent-cyan">.</span>FLOW
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">

        {/* Jobs */}
        <button
          onClick={handleJobs}
          className="text-zinc-300 hover:text-white transition"
        >
          <FaBriefcase className="w-5 h-5" />
        </button>

        {/* Dashboard */}
        <button
          onClick={handleDashboard}
          className="relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink cursor-pointer hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all duration-300 overflow-hidden group"
        >
          <span className="relative z-10">
            {isAuthenticated ? `Hi, ${firstName}` : "Get Started"}
          </span>
          <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
        </button>

        {/* Settings */}
        <button onClick={handleSettings} className="text-white cursor-pointer">
          <RiUserSettingsFill className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-cyber-panel border-b border-zinc-800 flex flex-col gap-4 px-6 py-6 md:hidden
        transform transition-all duration-300 ease-out
        ${
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={handleJobs}
          className="flex items-center gap-3 text-zinc-200 hover:text-white transition"
        >
          <FaBriefcase /> Jobs
        </button>

        <button
          onClick={handleSettings}
          className="flex items-center gap-3 text-zinc-200 hover:text-white transition"
        >
          <RiUserSettingsFill /> Profile Settings
        </button>

        <button
          onClick={handleDashboard}
          className="text-left text-zinc-200 hover:text-white transition"
        >
          {isAuthenticated ? `Welcome, ${firstName}` : "Get Started"}
        </button>
      </div>
    </div>
  );
};

export default Nav;