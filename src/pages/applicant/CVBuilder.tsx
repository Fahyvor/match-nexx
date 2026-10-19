import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaBriefcase,
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaExchangeAlt,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import type { RootState } from '../../redux/store';
import { setResume } from '../../redux/slices/resumeSlice';
import type {
  PersonalInfo,
  LinksInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ReferenceEntry,
  ResumeData,
  CvTemplateType,
  ResearchExperienceEntry,
  SkillCategory,
} from '../../types/resume';
import api from '../../utils/api';
import SleekToast, { toast } from 'sleek-toast';

const formatDateForInput = (val?: string | null): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
  return '';
};

export default function CVBuilder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userFromStore = useSelector((state: RootState) => state.user.user);

  // Template selection state: null means show selection screen first
  const [chosenTemplate, setChosenTemplate] = useState<CvTemplateType | null>(() => {
    const saved = localStorage.getItem('matchnexx_selected_cv_template') as CvTemplateType;
    return saved || null;
  });

  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  // Core Personal Info
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    position: '',
    phone: '',
    email: '',
    address: '',
  });

  // Links
  const [links, setLinks] = useState<LinksInfo>({
    linkedIn: '',
    portfolio: '',
    github: '',
    twitter: '',
  });

  // Standard CV Fields
  const [skillsInput, setSkillsInput] = useState('');
  const [projectTechnologiesInput, setProjectTechnologiesInput] = useState<Record<number, string>>({});
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [references, setReferences] = useState<ReferenceEntry[]>([]);

  // Academic & Research Specific Fields
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');

  const [academicProfile, setAcademicProfile] = useState('');

  const [researchExperiences, setResearchExperiences] = useState<ResearchExperienceEntry[]>([]);

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([
    {
      category: 'Laboratory and Experimental Skills',
      items: [],
    },
    {
      category: 'Data Analysis',
      items: [],
    },
    {
      category: 'Research and Analytical Skills',
      items: [],
    },
    {
      category: 'Digital Skills',
      items: [],
    },
  ]);

  const [transferableSkills, setTransferableSkills] = useState<string[]>([]);
  const [newTransferableInput, setNewTransferableInput] = useState('');

  const [careerObjective, setCareerObjective] = useState('');
  const [referencesNote, setReferencesNote] = useState('Academic and professional references available upon request.');
  const [useReferencesList, setUseReferencesList] = useState(false);

  // Fetch existing user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.auth.getCurrentUser();
        if (response && response.data) {
          setPersonalInfo((prev) => ({
            ...prev,
            firstName: response.data.firstName || prev.firstName || '',
            lastName: response.data.lastName || prev.lastName || '',
            email: response.data.email || prev.email || '',
            phone: response.data.phone || prev.phone || '',
            address: prev.address || `${response.data.state || ''}, ${response.data.country || ''}`.replace(/^,\s*/, ''),
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch CV Details and prefill
  useEffect(() => {
    const fetchCVDetails = async () => {
      try {
        setLoading(true);

        // Check local storage for academic extra data first
        try {
          const rawAcademic = localStorage.getItem('matchnexx_academic_cv_data');
          if (rawAcademic) {
            const parsed = JSON.parse(rawAcademic);
            if (Array.isArray(parsed.researchInterests)) setResearchInterests(parsed.researchInterests);
            if (parsed.academicProfile) setAcademicProfile(parsed.academicProfile);
            if (Array.isArray(parsed.researchExperiences)) setResearchExperiences(parsed.researchExperiences);
            if (Array.isArray(parsed.skillCategories)) setSkillCategories(parsed.skillCategories);
            if (Array.isArray(parsed.transferableSkills)) setTransferableSkills(parsed.transferableSkills);
            if (parsed.careerObjective) setCareerObjective(parsed.careerObjective);
            if (parsed.referencesNote) setReferencesNote(parsed.referencesNote);
          }
        } catch {
          // ignore
        }

        const res = await api.cv.getMe();

        if (res.data.success && res.data) {
          const applicant = res.data;
          const user = applicant.user || userFromStore || {};
          const cv = applicant.cv || {};

          setPersonalInfo((prev) => ({
            firstName: user.firstName || prev.firstName || '',
            lastName: user.lastName || prev.lastName || '',
            position:
              prev.position ||
              applicant.headline ||
              (Array.isArray(applicant.experiences) && applicant.experiences.length > 0 ? applicant.experiences[0].role : ''),
            phone: applicant.phone || prev.phone || '',
            email: user.email || prev.email || '',
            address: prev.address || `${user.state || ''}, ${user.country || ''}`.replace(/^,\s*/, ''),
          }));

          setLinks({
            linkedIn: applicant.linkedin || '',
            portfolio: applicant.portfolio || '',
            github: applicant.github || '',
            twitter: applicant.twitter || '',
          });

          if (cv.professionalSummary) {
            setProfessionalSummary(cv.professionalSummary);
            setAcademicProfile((prev) => prev || cv.professionalSummary);
          }

          if (Array.isArray(applicant.skills) && applicant.skills.length > 0) {
            const names = applicant.skills.map(
              (skill: string | { name?: string }) =>
                typeof skill === 'string' ? skill : skill.name || ''
            );
            setSkillsInput(names.filter(Boolean).join(', '));
          }

          if (Array.isArray(applicant.educations) && applicant.educations.length > 0) {
            setEducations(
              applicant.educations.map(
                (edu: {
                  school?: string;
                  field?: string;
                  degree?: string;
                  startYear?: string;
                  endYear?: string;
                  location?: string;
                  studyPeriod?: string;
                  degreeConferred?: string;
                  cgpa?: string;
                  classification?: string;
                }) => ({
                  institution: edu.school || '',
                  department: edu.field || '',
                  degree: edu.degree || '',
                  startDate: edu.startYear || '',
                  endDate: edu.endYear || '',
                  location: edu.location || '',
                  studyPeriod: edu.studyPeriod || (edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : ''),
                  degreeConferred: edu.degreeConferred || '',
                  cgpa: edu.cgpa || '',
                  classification: edu.classification || '',
                })
              )
            );
          }

          if (Array.isArray(applicant.experiences) && applicant.experiences.length > 0) {
            setExperiences(
              applicant.experiences.map(
                (exp: {
                  company?: string | null;
                  role?: string | null;
                  startDate?: string | null;
                  endDate?: string | null;
                  description?: string | null;
                }) => ({
                  company: exp.company || '',
                  role: exp.role || '',
                  startDate: formatDateForInput(exp.startDate),
                  endDate: formatDateForInput(exp.endDate),
                  isCurrent: !exp.endDate,
                  description: exp.description || '',
                })
              )
            );
          }

          if (Array.isArray(applicant.projects) && applicant.projects.length > 0) {
            setProjects(
              applicant.projects.map(
                (proj: {
                  name?: string | null;
                  description?: string | null;
                  technologies?: string[] | null;
                  link?: string | null;
                }) => ({
                  name: proj.name || '',
                  description: proj.description || '',
                  technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
                  link: proj.link || '',
                })
              )
            );
          }

          const refs = Array.isArray(applicant.references)
            ? applicant.references
            : cv.references && Array.isArray(cv.references)
              ? cv.references
              : [];

          if (refs.length > 0) {
            setReferences(
              refs.map(
                (ref: {
                  name?: string | null;
                  position?: string | null;
                  company?: string | null;
                  email?: string | null;
                  phone?: string | null;
                  relationship?: string | null;
                }) => ({
                  name: ref.name || '',
                  position: ref.position || '',
                  company: ref.company || '',
                  email: ref.email || '',
                  phone: ref.phone || '',
                  relationship: ref.relationship || '',
                })
              )
            );
            setUseReferencesList(true);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to prefill CV details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCVDetails();
  }, [userFromStore]);

  const skills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Experience handlers
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    ]);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string | boolean) => {
    setExperiences((prev) =>
      prev.map((exp, i) => {
        if (i !== index) return exp;
        if (field === 'isCurrent') {
          return {
            ...exp,
            isCurrent: Boolean(value),
            endDate: value ? '' : exp.endDate,
          };
        }
        return { ...exp, [field]: value };
      })
    );
  };

  const removeExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // Education handlers
  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        institution: '',
        department: '',
        degree: '',
        startDate: '',
        endDate: '',
        location: '',
        studyPeriod: '',
        degreeConferred: '',
        cgpa: '',
        classification: '',
      },
    ]);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setEducations((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  // Standard Projects handlers
  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        technologies: [],
        link: '',
      },
    ]);
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: unknown) => {
    setProjects((prev) =>
      prev.map((proj, i) => (i === index ? { ...proj, [field]: value } : proj))
    );
  };

  const updateProjectTechnologies = (index: number, value: string) => {
    setProjectTechnologiesInput((prev) => ({ ...prev, [index]: value }));
    const technologies = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setProjects((prev) =>
      prev.map((proj, i) => (i === index ? { ...proj, technologies } : proj))
    );
  };

  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  // Academic Research Experience handlers
  const addResearchExperience = () => {
    setResearchExperiences((prev) => [
      ...prev,
      {
        projectRole: 'Undergraduate Research Project',
        title: '',
        institution: '',
        year: '',
        objective: '',
        responsibilities: [''],
        relevance: '',
      },
    ]);
  };

  const updateResearchExperience = (
    index: number,
    field: keyof ResearchExperienceEntry,
    value: string | string[]
  ) => {
    setResearchExperiences((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeResearchExperience = (index: number) => {
    setResearchExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // Research Interests handlers
  const handleAddInterest = () => {
    if (!newInterestInput.trim()) return;
    setResearchInterests((prev) => [...prev, newInterestInput.trim()]);
    setNewInterestInput('');
  };

  const handleRemoveInterest = (idx: number) => {
    setResearchInterests((prev) => prev.filter((_, i) => i !== idx));
  };

  // Transferable skills handlers
  const handleAddTransferable = () => {
    if (!newTransferableInput.trim()) return;
    setTransferableSkills((prev) => [...prev, newTransferableInput.trim()]);
    setNewTransferableInput('');
  };

  const handleRemoveTransferable = (idx: number) => {
    setTransferableSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reference handlers
  const addReference = () => {
    setReferences((prev) => [
      ...prev,
      { name: '', position: '', company: '', email: '', phone: '', relationship: '' },
    ]);
  };

  const updateReference = (index: number, field: keyof ReferenceEntry, value: string) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
    );
  };

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Summary generator
  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const res = (await api.cv.generateSummary({
        personalInfo: { position: personalInfo.position, phone: personalInfo.phone },
        skills:
          skills.length > 0
            ? skills
            : skillCategories.flatMap((c) => c.items),
        experiences: experiences.map((exp) => ({
          company: exp.company,
          role: exp.role,
          startDate: exp.startDate,
          endDate: exp.isCurrent ? '' : exp.endDate,
          isCurrent: exp.isCurrent,
          description: exp.description,
        })),
        educations: educations.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          department: edu.department,
          startDate: edu.startDate,
          endDate: edu.endDate,
        })),
      })) as { success?: boolean; summary?: string; message?: string };

      if (res.success && res.summary) {
        if (chosenTemplate === 'academic') {
          setAcademicProfile(res.summary);
          toast.success('Academic Profile summary generated!');
        } else {
          setProfessionalSummary(res.summary);
          toast.success('Professional Summary generated!');
        }
      } else {
        toast.error(res.message || 'Could not generate summary.');
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errorResponse.response?.data?.message || errorResponse.message || 'Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Save handler
  const handleSave = async (shouldNavigateToPreview = false) => {
    const trimmedFirstName = personalInfo.firstName?.trim();
    const trimmedLastName = personalInfo.lastName?.trim();

    if (!trimmedFirstName) {
      toast.error('First name is required.');
      return;
    }
    if (!trimmedLastName) {
      toast.error('Last name is required.');
      return;
    }
    if (!personalInfo.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }

    // Determine all skills to send to backend
    const effectiveSkills =
      skills.length > 0
        ? skills
        : skillCategories.flatMap((c) => c.items).slice(0, 15);

    try {
      setSaving(true);

      const payload = {
        personalInfo: {
          phone: personalInfo.phone.trim(),
          position: personalInfo.position?.trim() || '',
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          address: personalInfo.address?.trim() || '',
        },
        links,
        skills: effectiveSkills,
        experiences: experiences.map((exp) => ({
          company: exp.company,
          role: exp.role,
          startDate: exp.startDate,
          endDate: exp.isCurrent ? '' : exp.endDate,
          isCurrent: exp.isCurrent,
          description: exp.description,
        })),
        educations: educations.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          department: edu.department,
          startDate: edu.startDate,
          endDate: edu.endDate,
        })),
        projects:
          chosenTemplate === 'academic' && researchExperiences.length > 0
            ? researchExperiences.map((re) => ({
                name: re.title,
                description: `${re.projectRole || 'Research Project'}: ${re.objective || ''}\n${re.relevance || ''}`,
                technologies: re.responsibilities || [],
                link: '',
              }))
            : projects.map((proj) => ({
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies,
                link: proj.link,
              })),
        references: useReferencesList
          ? references.map((ref) => ({
              name: ref.name,
              position: ref.position,
              company: ref.company,
              email: ref.email,
              phone: ref.phone,
            }))
          : [],
        professionalSummary:
          chosenTemplate === 'academic'
            ? academicProfile || careerObjective
            : professionalSummary,
      };

      const res = (await api.cv.create(payload)) as {
        success?: boolean;
        message?: string;
        data?: { cv?: { professionalSummary?: string } };
      };

      // Save academic extra fields to localStorage
      const academicDataToStore = {
        researchInterests,
        academicProfile,
        researchExperiences,
        skillCategories,
        transferableSkills,
        careerObjective,
        referencesNote,
      };
      localStorage.setItem('matchnexx_academic_cv_data', JSON.stringify(academicDataToStore));
      localStorage.setItem('matchnexx_selected_cv_template', chosenTemplate || 'professional');

      const fullResume: ResumeData = {
        templateType: chosenTemplate || 'professional',
        personalInfo,
        links,
        skills: effectiveSkills,
        educations,
        experiences,
        projects: payload.projects,
        references: useReferencesList ? references : [],
        professionalSummary: professionalSummary || res.data?.cv?.professionalSummary || academicProfile,
        researchInterests,
        academicProfile,
        researchExperiences,
        skillCategories,
        transferableSkills,
        careerObjective,
        referencesNote,
      };

      dispatch(setResume(fullResume));

      if (res.success) {
        toast.success(res.message || 'CV saved successfully!');
        if (shouldNavigateToPreview) {
          setTimeout(() => navigate('/applicant/cv-preview'), 600);
        }
      } else {
        toast.error(res.message || 'Failed to save CV.');
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errorResponse.response?.data?.message || errorResponse.message || 'Error saving CV.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = (type: CvTemplateType) => {
    setChosenTemplate(type);
    localStorage.setItem('matchnexx_selected_cv_template', type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-cyber-dark">
        <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading Profile & CV Data...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: TEMPLATE CHOOSER SCREEN
  // "allow them to choose which type before giving them the actual builder"
  // ==========================================
  if (!chosenTemplate) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-accent-pink selection:text-white py-12 px-4 sm:px-6 lg:px-8">
        <SleekToast />
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan text-xs font-mono tracking-widest uppercase rounded-full">
              <span className="w-2 h-2 bg-accent-cyan animate-pulse rounded-full" />
              STEP 1: SELECT YOUR CV TYPE
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-pink">CV Architecture</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Select the structure tailored to your career goal before entering the builder. Your builder fields and live preview will automatically adapt to your chosen format.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1: Modern Industry / ATS */}
            <div
              onClick={() => handleSelectTemplate('professional')}
              className="group relative bg-panel-bg border border-zinc-800 hover:border-accent-cyan rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-accent-cyan/20 cursor-pointer overflow-hidden transform hover:-translate-y-1.5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-cyan/20 transition-all" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan text-xl">
                    <FaBriefcase />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    Template 01
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white group-hover:text-accent-cyan transition-colors">
                    Modern Industry / ATS CV
                  </h3>
                  <p className="text-xs text-accent-cyan font-mono uppercase tracking-wider mt-1">
                    Corporate • Tech • Startups • ATS Optimized
                  </p>
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                    Designed for software engineers, product managers, designers, corporate applicants, and recruiters utilizing automated ATS systems.
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-cyan shrink-0" />
                    <span>ATS-compliant single/multi-column parsing format</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-cyan shrink-0" />
                    <span>Tech projects showcase with stack badges & GitHub URLs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-cyan shrink-0" />
                    <span>Impact-focused work history & measurable metrics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-cyan shrink-0" />
                    <span>AI-powered professional summary generator</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-zinc-800 text-white group-hover:bg-accent-cyan group-hover:text-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Select Industry ATS Template</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Option 2: Academic & Research CV */}
            <div
              onClick={() => handleSelectTemplate('academic')}
              className="group relative bg-panel-bg border border-zinc-800 hover:border-accent-pink rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-accent-pink/20 cursor-pointer overflow-hidden transform hover:-translate-y-1.5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-pink/20 transition-all" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent-pink/20 border border-accent-pink/40 flex items-center justify-center text-accent-pink text-xl">
                    <FaGraduationCap />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest text-accent-pink uppercase bg-accent-pink/10 px-3 py-1 rounded-full border border-accent-pink/30 font-bold">
                    Template 02 • Recommended
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white group-hover:text-accent-pink transition-colors">
                    Academic & Research CV
                  </h3>
                  <p className="text-xs text-accent-pink font-mono uppercase tracking-wider mt-1">
                    Graduate Studies • Prospective PhD • Fellowships
                  </p>
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                    Authoritative academic format matching graduate & doctoral admission standards with detailed laboratory & research credentials.
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-pink shrink-0" />
                    <span>Research Interests & narrative Academic Profile statement</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-pink shrink-0" />
                    <span>Degree Conferred, CGPA & Classification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-pink shrink-0" />
                    <span>Undergraduate/Graduate Research project objectives & methods</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-pink shrink-0" />
                    <span>Grouped Laboratory, Analytical & Digital skill categories</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCheckCircle className="text-accent-pink shrink-0" />
                    <span>Teaching, NYSC service & Doctoral Career Objectives</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-accent-pink to-purple-600 text-white group-hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Select Academic & Research Template</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Note */}
          <div className="text-center text-xs text-zinc-500 font-mono">
            Downloading high-resolution export ready for ATS & admissions requires a one-time ₦2,000 unlock fee.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTUAL BUILDER
  // ==========================================
  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <SleekToast />

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-16 py-10 pb-24">
        {/* Top Switcher Bar */}
        <div className="mb-8 p-4 bg-panel-bg border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${chosenTemplate === 'academic' ? 'bg-accent-pink/20 text-accent-pink' : 'bg-accent-cyan/20 text-accent-cyan'}`}>
              {chosenTemplate === 'academic' ? <FaGraduationCap className="w-5 h-5" /> : <FaBriefcase className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                ACTIVE ARCHITECTURE
              </p>
              <p className="text-sm font-bold text-white uppercase">
                {chosenTemplate === 'academic' ? 'Template 02: Academic & Research CV' : 'Template 01: Modern Industry / ATS CV'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChosenTemplate(null)}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <FaExchangeAlt className="w-3 h-3" />
              <span>Change CV Type</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-panel-border pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-tight text-zinc-900 dark:text-white">
              {chosenTemplate === 'academic' ? (
                <>
                  Academic & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-cyan">Research CV Builder</span>
                </>
              ) : (
                <>
                  Construct Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-pink">Professional CV</span>
                </>
              )}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl mt-1">
              {chosenTemplate === 'academic'
                ? 'Tailored for prospective PhD applicants, graduate research admissions, and academic appointments.'
                : 'Build an automated, parse-ready profile optimized for recruiters, ATS systems, and tech leads.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Preview & Download (₦2,000) ↗'}
            </button>
          </div>
        </div>

        {/* Builder Sections */}
        <div className="space-y-8">
          {/* 1. Personal Info Section */}
          <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6 text-white">
              <span className={`w-2.5 h-2.5 ${chosenTemplate === 'academic' ? 'bg-accent-pink' : 'bg-accent-cyan'}`} />
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">First Name *</label>
                <input
                  type="text"
                  placeholder="First Name (e.g. John)"
                  required
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">Last Name *</label>
                <input
                  type="text"
                  placeholder="Last Name (e.g. Doe)"
                  required
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">
                  {chosenTemplate === 'academic' ? 'Academic Title / Prospective Role' : 'Job Title / Headline'}
                </label>
                <input
                  type="text"
                  placeholder={
                    chosenTemplate === 'academic'
                      ? 'Physics Graduate | Prospective PhD Researcher'
                      : 'Senior Full Stack Engineer'
                  }
                  value={personalInfo.position}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, position: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">Phone Number *</label>
                <input
                  type="text"
                  placeholder="+234 800 000 0000"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-widest">Location / State, Country</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
            </div>
          </section>

          {/* ACADEMIC SPECIFIC SECTION: RESEARCH INTERESTS */}
          {chosenTemplate === 'academic' && (
            <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-2 text-white">
                <span className="w-2.5 h-2.5 bg-accent-pink" />
                Research Interests
              </h2>
              <p className="text-xs text-zinc-400 mb-6">
                Specify focal research areas, fields of study, or laboratory domains (e.g. Solar Photovoltaics, Renewable Energy Physics).
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Solar Photovoltaics and Renewable Energy Physics"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    className="flex-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-accent-pink text-white font-mono text-xs uppercase font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <FaPlus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {researchInterests.map((interest, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded text-sm"
                    >
                      <span className="text-zinc-200">• {interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(idx)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ACADEMIC PROFILE / PROFESSIONAL SUMMARY */}
          <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
                <span className={`w-2.5 h-2.5 ${chosenTemplate === 'academic' ? 'bg-accent-pink' : 'bg-accent-lime'}`} />
                {chosenTemplate === 'academic' ? 'Academic Profile' : 'Professional Summary'}
              </h2>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="px-4 py-1.5 bg-accent-lime/20 border border-accent-lime text-accent-lime hover:bg-accent-lime hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 self-start"
              >
                {generatingSummary ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            <textarea
              rows={5}
              placeholder={
                chosenTemplate === 'academic'
                  ? 'Detail your academic background, research qualifications, and key findings...\n\nHighlight your practical laboratory experience, methodologies, data analysis expertise, and motivation for doctoral or fellowship study...'
                  : 'Write a brief professional summary or click "Generate with AI"...'
              }
              value={chosenTemplate === 'academic' ? academicProfile : professionalSummary}
              onChange={(e) => {
                if (chosenTemplate === 'academic') {
                  setAcademicProfile(e.target.value);
                } else {
                  setProfessionalSummary(e.target.value);
                }
              }}
              className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-accent-pink transition-colors leading-relaxed"
            />
          </section>

          {/* EDUCATION SECTION */}
          <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 bg-accent-pink" />
                Education
              </h2>
            </div>

            <div className="space-y-6">
              {educations.map((edu, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Institution / University</label>
                      <input
                        type="text"
                        placeholder="University / Higher Institution"
                        value={edu.institution}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Degree (e.g. Bachelor of Science (B.Sc.))</label>
                      <input
                        type="text"
                        placeholder="Bachelor of Science (B.Sc.)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Field / Department</label>
                      <input
                        type="text"
                        placeholder="Field of Study (e.g. Physics, Engineering)"
                        value={edu.department}
                        onChange={(e) => updateEducation(idx, 'department', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Location</label>
                      <input
                        type="text"
                        placeholder="City, State, Country"
                        value={edu.location || ''}
                        onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Study Period</label>
                      <input
                        type="text"
                        placeholder="e.g. September 2019 – July 2023"
                        value={edu.studyPeriod || ''}
                        onChange={(e) => updateEducation(idx, 'studyPeriod', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                  </div>

                  {chosenTemplate === 'academic' && (
                    <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 uppercase">Degree Conferred Date</label>
                        <input
                          type="text"
                          placeholder="5 July 2024"
                          value={edu.degreeConferred || ''}
                          onChange={(e) => updateEducation(idx, 'degreeConferred', e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 uppercase">CGPA / Grade</label>
                        <input
                          type="text"
                          placeholder="3.51/5.00"
                          value={edu.cgpa || ''}
                          onChange={(e) => updateEducation(idx, 'cgpa', e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 uppercase">Classification</label>
                        <input
                          type="text"
                          placeholder="Second Class Upper"
                          value={edu.classification || ''}
                          onChange={(e) => updateEducation(idx, 'classification', e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-xs font-mono text-accent-pink hover:underline"
                    >
                      Remove Education
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEducation}
              className="mt-6 text-xs font-mono tracking-widest text-accent-pink uppercase hover:text-accent-cyan transition-colors flex items-center gap-2"
            >
              + Add Education
            </button>
          </section>

          {/* ACADEMIC SPECIFIC: UNDERGRADUATE / GRADUATE RESEARCH EXPERIENCE */}
          {chosenTemplate === 'academic' && (
            <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
                    <span className="w-2.5 h-2.5 bg-accent-cyan" />
                    Research Experience & Projects
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Document undergraduate research projects, lab experiments, theses, and scientific investigations.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {researchExperiences.map((resExp, idx) => (
                  <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded-xl">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 uppercase">Project Role / Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Undergraduate Research Project / Master's Thesis"
                          value={resExp.projectRole || ''}
                          onChange={(e) => updateResearchExperience(idx, 'projectRole', e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 uppercase">Institution & Year</label>
                        <input
                          type="text"
                          placeholder="University / Research Institution | Year"
                          value={resExp.institution ? `${resExp.institution}${resExp.year ? ` | ${resExp.year}` : ''}` : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes('|')) {
                              const [inst, yr] = val.split('|');
                              updateResearchExperience(idx, 'institution', inst.trim());
                              updateResearchExperience(idx, 'year', yr.trim());
                            } else {
                              updateResearchExperience(idx, 'institution', val);
                            }
                          }}
                          className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Project Title</label>
                      <input
                        type="text"
                        placeholder="Research Investigation or Project Title"
                        value={resExp.title}
                        onChange={(e) => updateResearchExperience(idx, 'title', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Research Objective</label>
                      <textarea
                        rows={2}
                        placeholder="To investigate the primary scientific objective, hypothesis, or experimental aim..."
                        value={resExp.objective || ''}
                        onChange={(e) => updateResearchExperience(idx, 'objective', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Experimental Approach & Responsibilities (One bullet per line)
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Conducted comparative testing and measurement using laboratory apparatus...&#10;Operated digital multimeters, sensors, and data logging equipment...&#10;Organized and analysed experimental datasets using scientific computing software..."
                        value={(resExp.responsibilities || []).join('\n')}
                        onChange={(e) =>
                          updateResearchExperience(
                            idx,
                            'responsibilities',
                            e.target.value.split('\n').filter(Boolean)
                          )
                        }
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">Research Relevance</label>
                      <textarea
                        rows={2}
                        placeholder="Detail practical applications, experimental findings, contributions to scientific literature, or methodology outcomes..."
                        value={resExp.relevance || ''}
                        onChange={(e) => updateResearchExperience(idx, 'relevance', e.target.value)}
                        className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeResearchExperience(idx)}
                        className="text-xs font-mono text-accent-pink hover:underline"
                      >
                        Remove Research Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addResearchExperience}
                className="mt-6 text-xs font-mono tracking-widest text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2"
              >
                + Add Research Project
              </button>
            </section>
          )}

          {/* PROFESSIONAL EXPERIENCE / TEACHING */}
          <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6 text-white">
              <span className="w-2.5 h-2.5 bg-accent-cyan" />
              {chosenTemplate === 'academic' ? 'Professional & Teaching Experience' : 'Work Experience'}
            </h2>

            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={chosenTemplate === 'academic' ? 'Institution / School / Organization' : 'Company Name'}
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                    />
                    <input
                      type="text"
                      placeholder={chosenTemplate === 'academic' ? 'Role (e.g. Teacher II / NYSC / Revenue Agent)' : 'Role / Position'}
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exp.startDate || ''}
                        onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                        className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                          End Date
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-white font-mono cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => updateExperience(idx, 'isCurrent', e.target.checked)}
                            className="accent-accent-cyan"
                          />
                          Present
                        </label>
                      </div>
                      <input
                        type="date"
                        disabled={exp.isCurrent}
                        value={exp.isCurrent ? '' : exp.endDate || ''}
                        onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                        className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-accent-cyan disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Responsibilities & Accomplishments (Each line becomes a bullet point)"
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                    className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-xs font-mono text-accent-pink hover:underline"
                    >
                      Remove Entry
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExperience}
              className="mt-6 text-xs font-mono tracking-widest text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2"
            >
              + Add Experience
            </button>
          </section>

          {/* ACADEMIC SPECIFIC: CATEGORIZED TECHNICAL & RESEARCH SKILLS */}
          {chosenTemplate === 'academic' ? (
            <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-2 text-white">
                <span className="w-2.5 h-2.5 bg-accent-lime" />
                Technical and Research Skills
              </h2>
              <p className="text-xs text-zinc-400 mb-6">
                Grouped into specialized domains (Laboratory, Data Analysis, Research, Digital).
              </p>

              <div className="space-y-6">
                {skillCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="p-4 bg-white dark:bg-cyber-dark/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-accent-cyan font-mono">{cat.category}</p>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="One skill per line..."
                      value={cat.items.join('\n')}
                      onChange={(e) => {
                        const items = e.target.value.split('\n').filter(Boolean);
                        setSkillCategories((prev) =>
                          prev.map((c, i) => (i === catIdx ? { ...c, items } : c))
                        );
                      }}
                      className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-3 py-2 text-xs focus:outline-none focus:border-accent-lime"
                    />
                  </div>
                ))}
              </div>

              {/* Transferable Skills */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <h3 className="font-bold text-base uppercase text-white mb-3">Transferable Skills</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Scientific communication, Teamwork and collaboration"
                    value={newTransferableInput}
                    onChange={(e) => setNewTransferableInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTransferable())}
                    className="flex-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-lime"
                  />
                  <button
                    type="button"
                    onClick={handleAddTransferable}
                    className="px-4 py-2 bg-accent-lime text-black font-mono text-xs uppercase font-bold rounded hover:opacity-90 transition-opacity"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {transferableSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs rounded-full font-mono"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTransferable(idx)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Objective */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <h3 className="font-bold text-base uppercase text-white mb-2">Career Objective</h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Long-term research direction and doctoral goals.
                </p>
                <textarea
                  rows={3}
                  placeholder="To pursue doctoral research and academic fellowship positions, with a focus on advancing experimental, analytical, and scientific research capabilities..."
                  value={careerObjective}
                  onChange={(e) => setCareerObjective(e.target.value)}
                  className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-lime"
                />
              </div>
            </section>
          ) : (
            /* PROFESSIONAL TEMPLATE: STANDARD SKILLS & PROJECTS */
            <>
              {/* Skills */}
              <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6 text-white">
                  <span className="w-2.5 h-2.5 bg-accent-lime" />
                  Skills *
                </h2>

                <div>
                  <label className="text-xs font-mono text-white uppercase tracking-widest">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full mt-2 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-lime transition-colors"
                  />
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs px-3 py-1 rounded-full font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Projects */}
              <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6 text-white">
                  <span className="w-2.5 h-2.5 bg-accent-cyan" />
                  Key Projects
                </h2>

                <div className="space-y-6">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded-xl">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={proj.name}
                          onChange={(e) => updateProject(idx, 'name', e.target.value)}
                          className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                        />
                        <input
                          type="text"
                          placeholder="Project URL / Repo Link"
                          value={proj.link}
                          onChange={(e) => updateProject(idx, 'link', e.target.value)}
                          className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-white uppercase tracking-widest">
                          Technologies Used (Comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="React, TypeScript, Node.js, PostgreSQL"
                          value={projectTechnologiesInput[idx] ?? proj.technologies.join(', ')}
                          onChange={(e) => updateProjectTechnologies(idx, e.target.value)}
                          className="w-full mt-2 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Project Highlights / Description"
                        value={proj.description}
                        onChange={(e) => updateProject(idx, 'description', e.target.value)}
                        className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          className="text-xs font-mono text-accent-pink hover:underline"
                        >
                          Remove Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addProject}
                  className="mt-6 text-xs font-mono tracking-widest text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2"
                >
                  + Add Project
                </button>
              </section>
            </>
          )}

          {/* REFERENCES SECTION */}
          <section className="bg-panel-bg border border-panel-border p-6 sm:p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 bg-accent-pink" />
                References
              </h2>

              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!useReferencesList}
                  onChange={(e) => setUseReferencesList(!e.target.checked)}
                  className="accent-accent-pink"
                />
                Show "Available upon request"
              </label>
            </div>

            {!useReferencesList ? (
              <div>
                <input
                  type="text"
                  placeholder="Academic and professional references available upon request."
                  value={referencesNote}
                  onChange={(e) => setReferencesNote(e.target.value)}
                  className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {references.map((ref, idx) => (
                  <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded-xl">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Referee Full Name"
                        value={ref.name}
                        onChange={(e) => updateReference(idx, 'name', e.target.value)}
                        className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                      <input
                        type="text"
                        placeholder="Position / Title"
                        value={ref.position}
                        onChange={(e) => updateReference(idx, 'position', e.target.value)}
                        className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Company / University"
                        value={ref.company}
                        onChange={(e) => updateReference(idx, 'company', e.target.value)}
                        className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={ref.email}
                        onChange={(e) => updateReference(idx, 'email', e.target.value)}
                        className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={ref.phone}
                        onChange={(e) => updateReference(idx, 'phone', e.target.value)}
                        className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeReference(idx)}
                        className="text-xs font-mono text-accent-pink hover:underline"
                      >
                        Remove Reference
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addReference}
                  className="text-xs font-mono tracking-widest text-accent-pink uppercase hover:text-accent-cyan transition-colors flex items-center gap-2"
                >
                  + Add Referee
                </button>
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 relative cursor-pointer px-6 py-3.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:bg-accent-cyan/10 transition-all duration-300 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 relative px-6 py-3.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-accent-cyan via-teal-400 to-accent-pink text-black shadow-lg hover:shadow-accent-cyan/30 cursor-pointer transition-all duration-300 rounded-xl font-mono"
            >
              {saving ? 'Saving...' : 'Save & Preview CV (₦2,000 to Download) ↗'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}