import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecruiterPaywallModal from "../../components/RecruiterPaywallModal";
import api from "../../utils/api";

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Education {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
}

interface ApplicantDetail {
  id: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  cvUrl?: string;
  profilePicture?: string;
  experiences?: Experience[];
  educations?: Education[];
  gender?: "male" | "female" | null;
}

interface CandidateDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  country: string;
  years_of_experience: number;
  applicant: ApplicantDetail;
}

const ProfileSkeleton = () => (
  <div className="w-full mx-auto p-6 animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full bg-zinc-700/40" />
      <div className="space-y-2">
        <div className="h-5 w-48 bg-zinc-700/40 rounded" />
        <div className="h-4 w-32 bg-zinc-700/40 rounded" />
      </div>
    </div>
    <div className="h-20 bg-zinc-700/40 rounded" />
    <div className="h-32 bg-zinc-700/40 rounded" />
  </div>
);

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

const CandidatesProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  const fetchApplicant = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setRequiresSubscription(false);
    try {
      const response = (await api.recruiters.getCandidate(id)) as { data?: CandidateDetail | { data?: CandidateDetail } };
      const data = response.data || response;
      setCandidate((data as { data?: CandidateDetail }).data || (data as CandidateDetail));
    } catch (err: unknown) {
      console.error("Error fetching applicant profile:", err);
      const errorResponse = err as { response?: { status?: number; data?: { code?: string } } };
      if (errorResponse.response?.status === 402 || errorResponse.response?.data?.code === "SUBSCRIPTION_REQUIRED") {
        setRequiresSubscription(true);
      } else {
        setError("Failed to load this profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  if (requiresSubscription) {
    return <RecruiterPaywallModal onSuccess={() => fetchApplicant()} />;
  }

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 text-accent-cyan underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!candidate) return null;

  const { applicant } = candidate;

  return (
    <div className="w-full h-screen mx-auto p-6 bg-white dark:bg-cyber-dark">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-accent-cyan-light dark:text-accent-cyan hover:underline"
      >
        ← Back to candidates
      </button>

      {/* Header */}
      <div className="flex items-center gap-6 border-b border-panel-border pb-6">
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {applicant?.headline || "No headline provided"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {candidate.state}, {candidate.country}
          </p>
        </div>
      </div>

      {/* Contact + Links */}
      <div className="grid grid-cols-2 gap-4 py-6 text-sm">
        <div>
          <p className="text-zinc-500">Email</p>
          <p className="text-zinc-800 dark:text-zinc-200">{candidate.email}</p>
        </div>
        <div>
          <p className="text-zinc-500">Phone</p>
          <p className="text-zinc-800 dark:text-zinc-200">
            {applicant?.phone || "—"}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Experience</p>
          <p className="text-zinc-800 dark:text-zinc-200">
            {candidate.years_of_experience} years
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Links</p>
          <div className="flex gap-3">
            {applicant?.github && (
              <a href={applicant.github} target="_blank" rel="noreferrer" className="text-accent-cyan underline">
                GitHub
              </a>
            )}
            {applicant?.linkedin && (
              <a href={applicant.linkedin} target="_blank" rel="noreferrer" className="text-accent-cyan underline">
                LinkedIn
              </a>
            )}
            {applicant?.portfolio && (
              <a href={applicant.portfolio} target="_blank" rel="noreferrer" className="text-accent-cyan underline">
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {applicant?.summary && (
        <div className="py-6 border-t border-panel-border">
          <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white">
            Summary
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">{applicant.summary}</p>
        </div>
      )}

      {/* Experience */}
      {applicant?.experiences && applicant.experiences.length > 0 && (
        <div className="py-6 border-t border-panel-border">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
            Work Experience
          </h2>
          <div className="space-y-4">
            {applicant.experiences.map((exp) => (
              <div key={exp.id} className="border border-panel-border rounded-lg p-4">
                <div className="flex justify-between">
                  <p className="font-semibold text-zinc-800 dark:text-white">{exp.role}</p>
                  <p className="text-xs text-zinc-500">
                    {exp.startDate} — {exp.endDate || "Present"}
                  </p>
                </div>
                <p className="text-sm text-zinc-500">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {applicant?.educations && applicant.educations.length > 0 && (
        <div className="py-6 border-t border-panel-border">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
            Education
          </h2>
          <div className="space-y-4">
            {applicant.educations.map((edu) => (
              <div key={edu.id} className="border border-panel-border rounded-lg p-4">
                <p className="font-semibold text-zinc-800 dark:text-white">{edu.school}</p>
                <p className="text-sm text-zinc-500">
                  {edu.degree} {edu.field ? `— ${edu.field}` : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  {edu.startYear} — {edu.endYear || "Present"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CV */}
      {applicant?.cvUrl && (
        <div className="py-6 border-t border-panel-border">
          
            <a href={applicant.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 rounded bg-accent-cyan text-black font-semibold hover:opacity-90">
        
          
            View CV
          </a>
        </div>
        // </div>
      )}
    </div>
)}
export default CandidatesProfile;