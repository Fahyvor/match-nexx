import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../redux/store';
import { setResume } from '../../redux/slices/resumeSlice';
import Template01 from '../../templates/01';
import type { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry } from '../../types/resume';
import api from '../../utils/api';
import SleekToast from 'sleek-toast';

import CvPaywallModal from '../../components/CvPaywallModal';

const CVPreview: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resumeFromStore = useSelector((state: RootState) => state.resume.resume);

  const [backendResume, setBackendResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPaidCv, setHasPaidCv] = useState<boolean | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserCV = async () => {
      try {
        setLoading(true);
        const statusRes: any = await api.payments.getCvStatus();
        if (statusRes.success && statusRes.data) {
          setHasPaidCv(statusRes.data.hasPaidCv);
        } else {
          setHasPaidCv(false);
        }

        if (!resumeFromStore) {
          const res: any = await api.cv.getMe();
          if (res.success && res.data) {
            const applicantData = res.data;
            const user = applicantData.user || {};
            const cvData = applicantData.cv || {};

            const educations: EducationEntry[] = Array.isArray(applicantData.educations)
              ? applicantData.educations.map((edu: any) => ({
                  institution: edu.school || '',
                  department: edu.field || '',
                  degree: edu.degree || '',
                  startDate: edu.startYear || '',
                  endDate: edu.endYear || '',
                }))
              : [];

            const experiences: ExperienceEntry[] = Array.isArray(applicantData.experiences)
              ? applicantData.experiences.map((exp: any) => ({
                  company: exp.company || '',
                  role: exp.role || '',
                  startDate: exp.startDate || '',
                  endDate: exp.endDate || '',
                  isCurrent: !exp.endDate,
                  description: exp.description || '',
                }))
              : [];

            const projects: ProjectEntry[] = Array.isArray(applicantData.projects)
              ? applicantData.projects.map((proj: any) => ({
                  name: proj.name || '',
                  description: proj.description || '',
                  technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
                  link: proj.link || '',
                }))
              : [];

            const skillsList: string[] = Array.isArray(applicantData.skills)
              ? applicantData.skills.map((s: any) => (typeof s === 'string' ? s : s.name))
              : [];

            const assembledResume: ResumeData = {
              personalInfo: {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                position: applicantData.headline || (experiences.length > 0 ? experiences[0].role : ''),
                email: user.email || '',
                phone: applicantData.phone || '',
                address: `${user.state || ''}, ${user.country || ''}`.replace(/^,\s*/, ''),
              },
              links: {
                linkedIn: applicantData.linkedin || '',
                portfolio: applicantData.portfolio || '',
                github: applicantData.github || '',
                twitter: applicantData.twitter || '',
                facebook: applicantData.facebook || '',
              },
              skills: skillsList,
              educations,
              experiences,
              projects,
              professionalSummary: cvData.professionalSummary || applicantData.summary || '',
            };

            setBackendResume(assembledResume);
            dispatch(setResume(assembledResume));
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch user CV:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCV();
  }, [resumeFromStore, dispatch]);

  const effectiveResume = resumeFromStore || backendResume;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel-bg dark:bg-cyber-dark">
        <p className="text-zinc-500 font-medium animate-pulse">Loading CV Preview...</p>
      </div>
    );
  }

  if (hasPaidCv === false) {
    return <CvPaywallModal onSuccess={() => setHasPaidCv(true)} />;
  }

  if (!effectiveResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel-bg dark:bg-cyber-dark px-4">
        <SleekToast />
        <div className="bg-white dark:bg-cyber-dark/80 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-center max-w-md">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 text-lg mb-2">No CV Data Found</p>
          <p className="text-sm text-zinc-500 mb-6">Please create your CV first in the CV Builder.</p>
          <button
            onClick={() => navigate('/applicant/cv-builder')}
            className="px-6 py-2.5 bg-accent-pink text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow hover:opacity-90 transition-opacity"
          >
            Go to CV Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-cyber-dark text-zinc-800 dark:text-zinc-200 py-8 px-4 print:bg-white print:p-0">
      <SleekToast />
      {/* Top Action Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate('/applicant/cv-builder')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-accent-pink transition-colors"
        >
          ← Back to Builder
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-accent-cyan to-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Print / Download PDF
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="max-w-4xl mx-auto" ref={printRef}>
        <Template01 resume={effectiveResume} />
      </div>
    </div>
  );
};

export default CVPreview;
