import { useState, useEffect, useMemo } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";

import RecruiterPaywallModal from "../../components/RecruiterPaywallModal";
import api from "../../utils/api";

interface Experience {
  id: string;
  company: string;
  role: string;
}

interface Applicant {
  id: string;
  headline?: string;
  profilePicture?: string;
  gender?: "male" | "female" | null;
  experiences?: Experience[];
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  state: string;
  country: string;
  years_of_experience: number;
  applicant: Applicant;
}

const AvatarPlaceholder = ({ gender }: { gender?: "male" | "female" | null }) => {
  if (gender === "male") {
    return (
      <div className="w-16 h-16 rounded-full border-2 border-accent-cyan bg-blue-500/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M12 14c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6z" />
        </svg>
      </div>
    );
  }

  if (gender === "female") {
    return (
      <div className="w-16 h-16 rounded-full border-2 border-accent-cyan bg-pink-500/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-pink-400" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M12 14c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-full border-2 border-accent-cyan bg-zinc-500/10 flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-8 h-8 text-zinc-400" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M12 14c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6z" />
      </svg>
    </div>
  );
};

const CandidateCardSkeleton = () => (
  <div className="bg-panel-bg border border-panel-border rounded-lg overflow-hidden animate-pulse">
    <div className="p-6 border-b border-panel-border">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-700/40" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-zinc-700/40 rounded" />
          <div className="h-3 w-40 bg-zinc-700/40 rounded" />
          <div className="h-3 w-24 bg-zinc-700/40 rounded" />
        </div>
      </div>
    </div>
    <div className="p-6 space-y-4">
      <div className="h-3 w-full bg-zinc-700/40 rounded" />
      <div className="h-3 w-2/3 bg-zinc-700/40 rounded" />
    </div>
    <div className="border-t border-panel-border p-4 flex gap-3">
      <div className="h-9 flex-1 bg-zinc-700/40 rounded" />
      <div className="h-9 flex-1 bg-zinc-700/40 rounded" />
    </div>
  </div>
);

const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [minExperience, setMinExperience] = useState(0);

  const token = useSelector((state: RootState) => state.user.token);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    setRequiresSubscription(false);
    try {
      const response: any = await api.recruiters.getCandidates();
      const list = response.data || response;
      if (Array.isArray(list)) {
        setCandidates(list);
      } else if (Array.isArray(list.data)) {
        setCandidates(list.data);
      }
    } catch (err: any) {
      console.error("Error fetching candidates:", err);
      if (err.response?.status === 402 || err.response?.data?.code === "SUBSCRIPTION_REQUIRED") {
        setRequiresSubscription(true);
      } else {
        setError("Failed to load candidates. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [token]);

  const countries = useMemo(() => {
    const set = new Set(candidates.map((c) => c.country).filter(Boolean));
    return Array.from(set);
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const headline = c.applicant?.headline?.toLowerCase() || "";
      const query = search.toLowerCase();

      const matchesSearch =
        !query || fullName.includes(query) || headline.includes(query);

      const matchesCountry =
        countryFilter === "all" || c.country === countryFilter;

      const matchesExperience = c.years_of_experience >= minExperience;

      return matchesSearch && matchesCountry && matchesExperience;
    });
  }, [candidates, search, countryFilter, minExperience]);

  return (
    <div className="bg-white dark:bg-cyber-dark p-4">
      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or headline..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-full px-4 py-2 rounded-full border border-panel-border bg-panel-bg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-cyan"
        />

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2 rounded-full border border-panel-border bg-panel-bg text-zinc-900 dark:text-white focus:outline-none focus:border-accent-cyan"
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={minExperience}
          onChange={(e) => setMinExperience(Number(e.target.value))}
          className="px-4 py-2 rounded-full border border-panel-border bg-panel-bg text-zinc-900 dark:text-white focus:outline-none focus:border-accent-cyan"
        >
          <option value={0}>Any experience</option>
          <option value={1}>1+ years</option>
          <option value={3}>3+ years</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
        </select>
      </div>

      {/* Results */}
      {requiresSubscription ? (
        <RecruiterPaywallModal onSuccess={() => fetchCandidates()} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">{error}</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-6 text-center text-zinc-500">
          No candidates match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="group bg-panel-bg border border-panel-border rounded-lg overflow-hidden hover:border-accent-cyan transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative p-6 border-b border-panel-border">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono bg-green-500/15 text-green-500 border border-green-500/30">
                    Available
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {candidate.applicant?.profilePicture ? (
                    <img
                      src={candidate.applicant.profilePicture}
                      alt={`${candidate.firstName} ${candidate.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-accent-cyan"
                    />
                  ) : (
                    <AvatarPlaceholder gender={candidate.applicant?.gender} />
                  )}

                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {candidate.applicant?.headline || "No headline provided"}
                    </p>
                    <p className="text-xs mt-1 text-zinc-500">
                      {candidate.state}, {candidate.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Experience</span>
                  <span className="font-semibold text-accent-cyan-light dark:text-accent-cyan">
                    {candidate.years_of_experience} Years
                  </span>
                </div>

                {candidate.applicant?.experiences?.length ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest font-mono text-zinc-500 mb-3">
                      Recent Role
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {candidate.applicant.experiences[0].role} @{" "}
                      {candidate.applicant.experiences[0].company}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-panel-border p-4 flex gap-3">
                <button
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  className="flex-1 py-2.5 rounded border border-accent-cyan text-accent-cyan-light dark:text-accent-cyan hover:bg-accent-cyan-light hover:text-black transition-all duration-300 text-sm font-semibold"
                >
                  View Profile
                </button>
                {/* <button className="flex-1 py-2.5 rounded bg-accent-pink text-white hover:opacity-90 transition text-sm font-semibold">
                  Invite
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;