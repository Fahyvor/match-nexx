import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaLock, FaDownload, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import type { RootState } from '../../redux/store';
import { setResume } from '../../redux/slices/resumeSlice';
import Template01 from '../../templates/01';
import Template02 from '../../templates/02';
import type { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, ReferenceEntry, CvTemplateType } from '../../types/resume';
import api from '../../utils/api';
import SleekToast from 'sleek-toast';

import CvPaywallModal from '../../components/CvPaywallModal';

const CVPreview: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resumeFromStore = useSelector((state: RootState) => state.resume.resume);

  const [backendResume, setBackendResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasPaidCv, setHasPaidCv] = useState<boolean | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplateType>(() => {
    const stored = localStorage.getItem('matchnexx_selected_cv_template') as CvTemplateType;
    return stored || (resumeFromStore?.templateType as CvTemplateType) || 'professional';
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handleTemplateChange = (tmpl: CvTemplateType) => {
    setSelectedTemplate(tmpl);
    localStorage.setItem('matchnexx_selected_cv_template', tmpl);
  };

  useEffect(() => {
    const fetchUserCV = async () => {
      try {
        setLoading(true);
        const statusRes = (await api.payments.getCvStatus()) as { success?: boolean; data?: { hasPaidCv?: boolean } };
        if (statusRes.success && statusRes.data) {
          setHasPaidCv(statusRes.data.hasPaidCv ?? false);
        } else {
          setHasPaidCv(false);
        }

        // Retrieve local academic extra fields if any
        let localAcademicData: Partial<ResumeData> = {};
        try {
          const raw = localStorage.getItem('matchnexx_academic_cv_data');
          if (raw) {
            localAcademicData = JSON.parse(raw);
          }
        } catch {
          // ignore
        }

        if (!resumeFromStore) {
          const res = (await api.cv.getMe()) as {
            success?: boolean;
            data?: {
              user?: { firstName?: string; lastName?: string; email?: string; state?: string; country?: string };
              cv?: { professionalSummary?: string; references?: ReferenceEntry[] };
              headline?: string;
              phone?: string;
              linkedin?: string;
              portfolio?: string;
              github?: string;
              twitter?: string;
              facebook?: string;
              summary?: string;
              educations?: Array<{ school?: string; field?: string; degree?: string; startYear?: string; endYear?: string }>;
              experiences?: Array<{ company?: string; role?: string; startDate?: string; endDate?: string; description?: string }>;
              projects?: Array<{ name?: string; description?: string; technologies?: string[]; link?: string }>;
              skills?: Array<string | { name: string }>;
              references?: ReferenceEntry[];
            };
          };
          if (res.success && res.data) {
            const applicantData = res.data;
            const user = applicantData.user || {};
            const cvData = applicantData.cv || {};

            const educations: EducationEntry[] = Array.isArray(applicantData.educations)
              ? applicantData.educations.map((edu) => ({
                institution: edu.school || '',
                department: edu.field || '',
                degree: edu.degree || '',
                startDate: edu.startYear || '',
                endDate: edu.endYear || '',
              }))
              : [];

            const experiences: ExperienceEntry[] = Array.isArray(applicantData.experiences)
              ? applicantData.experiences.map((exp) => ({
                company: exp.company || '',
                role: exp.role || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                isCurrent: !exp.endDate,
                description: exp.description || '',
              }))
              : [];

            const projects: ProjectEntry[] = Array.isArray(applicantData.projects)
              ? applicantData.projects.map((proj) => ({
                name: proj.name || '',
                description: proj.description || '',
                technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
                link: proj.link || '',
              }))
              : [];

            const skillsList: string[] = Array.isArray(applicantData.skills)
              ? applicantData.skills.map((s) => (typeof s === 'string' ? s : s.name))
              : [];

            const references: ReferenceEntry[] = Array.isArray(applicantData.references)
              ? applicantData.references
              : cvData && Array.isArray(cvData.references)
                ? cvData.references
                : [];

            const assembledResume: ResumeData = {
              templateType: selectedTemplate,
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
              references,
              professionalSummary: cvData.professionalSummary || applicantData.summary || '',
              ...localAcademicData,
            };

            setBackendResume(assembledResume);
            dispatch(setResume(assembledResume));
          }
        }
      } catch (err: unknown) {
        console.error('Failed to fetch user CV:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCV();
  }, [resumeFromStore, dispatch, selectedTemplate]);

  // Intercept browser print when user has not paid
  useEffect(() => {
    const handleBeforePrint = (e: Event) => {
      if (!hasPaidCv) {
        e.preventDefault();
        setShowPaywallModal(true);
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, [hasPaidCv]);

  // Merge stored academic data if present
  let localAcademicFields: Partial<ResumeData> = {};
  try {
    const raw = localStorage.getItem('matchnexx_academic_cv_data');
    if (raw) {
      localAcademicFields = JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  const baseResume = resumeFromStore || backendResume;
  const effectiveResume: ResumeData | null = baseResume
    ? {
        ...baseResume,
        ...localAcademicFields,
        templateType: selectedTemplate,
      }
    : null;

  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return;

    try {
      setDownloading(true);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const captureOptions = {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: printRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
      };

      const canvas = await html2canvas(printRef.current, captureOptions);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName =
        `${effectiveResume?.personalInfo?.firstName || ''}-${effectiveResume?.personalInfo?.lastName || 'resume'}`
          .replace(/^-|-$/g, '')
          .trim() || 'resume';
      pdf.save(`${fileName}-${selectedTemplate === 'academic' ? 'Academic' : 'Industry'}-CV.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadClick = () => {
    if (!hasPaidCv) {
      setShowPaywallModal(true);
      return;
    }
    handleDownloadPdf();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel-bg dark:bg-cyber-dark">
        <p className="text-zinc-500 font-medium animate-pulse">Loading CV Preview...</p>
      </div>
    );
  }

  if (!effectiveResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel-bg dark:bg-cyber-dark px-4">
        <SleekToast />
        <div className="bg-white dark:bg-cyber-dark/80 lg:p-8 p-3 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-center max-w-md">
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
    <div className="min-h-screen bg-zinc-100 dark:bg-cyber-dark text-zinc-800 dark:text-zinc-200 lg:py-8 py-2 px-4 print:bg-white print:p-0">
      <SleekToast />

      {/* CSS safeguard against unauthorized browser printing */}
      {!hasPaidCv && (
        <style>{`
          @media print {
            .resume-print-area {
              display: none !important;
            }
            body::before {
              content: "Payment of ₦2,000 required to print or download CV.";
              display: block;
              font-family: sans-serif;
              font-size: 18px;
              text-align: center;
              padding: 40px;
              color: #ef4444;
            }
          }
        `}</style>
      )}

      {/* Paywall Modal overlay */}
      {showPaywallModal && (
        <CvPaywallModal
          title={selectedTemplate === 'academic' ? "Download Your Academic & Research CV" : "Download Your Professional CV"}
          description="Pay a one-time fee of ₦2,000 to unlock and download your personal, publication & ATS-ready CV in high-resolution PDF format."
          badgeText="₦2,000 PAYMENT REQUIRED TO DOWNLOAD"
          buttonText="Pay ₦2,000 to Download CV →"
          onClose={() => setShowPaywallModal(false)}
          onSuccess={() => {
            setHasPaidCv(true);
            setShowPaywallModal(false);
          }}
        />
      )}

      {/* Top Action Bar */}
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate('/applicant/cv-builder')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-white hover:text-accent-pink transition-colors cursor-pointer self-start md:self-auto"
        >
          ← Back to Builder
        </button>

        {/* Template Switcher Tabs */}
        <div className="flex items-center bg-zinc-200 dark:bg-panel-bg p-1 rounded-xl border border-zinc-300 dark:border-panel-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTemplateChange('professional')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              selectedTemplate === 'professional'
                ? 'bg-accent-cyan text-black shadow-md font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <FaBriefcase className="w-3.5 h-3.5" />
            <span>Template 01: Modern ATS</span>
          </button>

          <button
            type="button"
            onClick={() => handleTemplateChange('academic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              selectedTemplate === 'academic'
                ? 'bg-accent-cyan text-black shadow-md font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            <FaGraduationCap className="w-4 h-4" />
            <span>Template 02: Academic & Research</span>
          </button>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {downloading ? (
              'Generating...'
            ) : hasPaidCv ? (
              <>
                <FaDownload className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            ) : (
              <>
                <FaLock className="w-3.5 h-3.5" />
                <span>Unlock & Download PDF (₦2,000)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="resume-print-area w-full max-w-4xl mx-auto" ref={printRef}>
        {selectedTemplate === 'academic' ? (
          <Template02 resume={effectiveResume} />
        ) : (
          <Template01 resume={effectiveResume} />
        )}
      </div>
    </div>
  );
};

export default CVPreview;
