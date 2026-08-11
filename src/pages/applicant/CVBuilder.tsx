import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../redux/store';
import { setResume } from '../../redux/slices/resumeSlice';
import type {
  PersonalInfo,
  LinksInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
} from '../../types/resume';
import api from '../../utils/api';
import SleekToast, { toast } from 'sleek-toast';

export default function CVBuilder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userFromStore = useSelector((state: RootState) => state.user.user);

  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    position: '',
    phone: '',
    email: '',
    address: '',
  });

  const [links, setLinks] = useState<LinksInfo>({
    linkedIn: '',
    portfolio: '',
    github: '',
    twitter: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  // Fetch existing CV on mount
  useEffect(() => {
    const fetchCVDetails = async () => {
      try {
        setLoading(true);
        const res: any = await api.cv.getMe();

        if (res.success && res.data) {
          const applicant = res.data;
          const user = applicant.user || userFromStore || {};
          const cv = applicant.cv || {};

          setPersonalInfo({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            position: applicant.headline || (Array.isArray(applicant.experiences) && applicant.experiences.length > 0 ? applicant.experiences[0].role : ''),
            phone: applicant.phone || '',
            email: user.email || '',
            address: `${user.state || ''}, ${user.country || ''}`.replace(/^,\s*/, ''),
          });

          setLinks({
            linkedIn: applicant.linkedin || '',
            portfolio: applicant.portfolio || '',
            github: applicant.github || '',
            twitter: applicant.twitter || '',
          });

          if (cv.professionalSummary) {
            setProfessionalSummary(cv.professionalSummary);
          }

          if (Array.isArray(applicant.skills)) {
            const names = applicant.skills.map((s: any) => (typeof s === 'string' ? s : s.name));
            setSkillsInput(names.join(', '));
          }

          if (Array.isArray(applicant.educations)) {
            setEducations(
              applicant.educations.map((edu: any) => ({
                institution: edu.school || '',
                department: edu.field || '',
                degree: edu.degree || '',
                startDate: edu.startYear || '',
                endDate: edu.endYear || '',
              }))
            );
          }

          if (Array.isArray(applicant.experiences)) {
            setExperiences(
              applicant.experiences.map((exp: any) => ({
                company: exp.company || '',
                role: exp.role || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                isCurrent: !exp.endDate,
                description: exp.description || '',
              }))
            );
          }

          if (Array.isArray(applicant.projects)) {
            setProjects(
              applicant.projects.map((proj: any) => ({
                name: proj.name || '',
                description: proj.description || '',
                technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
                link: proj.link || '',
              }))
            );
          }
        } else if (userFromStore) {
          setPersonalInfo((prev) => ({
            ...prev,
            firstName: userFromStore.firstName || '',
            lastName: userFromStore.lastName || '',
            email: userFromStore.email || '',
          }));
        }
      } catch (err: any) {
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

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    ]);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string | boolean) => {
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      { institution: '', department: '', degree: '', startDate: '', endDate: '' },
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

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { name: '', description: '', technologies: [], link: '' },
    ]);
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: string) => {
    setProjects((prev) =>
      prev.map((proj, i) => {
        if (i !== index) return proj;
        if (field === 'technologies') {
          return {
            ...proj,
            technologies: value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          };
        }
        return { ...proj, [field]: value };
      })
    );
  };

  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const res: any = await api.cv.generateSummary({
        personalInfo: { position: personalInfo.position, phone: personalInfo.phone },
        skills,
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
      });

      if (res.success && res.summary) {
        setProfessionalSummary(res.summary);
        toast.success('AI Professional Summary generated!');
      } else {
        toast.error(res.message || 'Could not generate summary.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSave = async (shouldNavigateToPreview = false) => {
    if (!personalInfo.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    if (skills.length === 0) {
      toast.error('At least one skill is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        personalInfo: {
          phone: personalInfo.phone,
          position: personalInfo.position,
        },
        links,
        skills,
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
        projects: projects.map((proj) => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          link: proj.link,
        })),
        professionalSummary,
      };

      const res: any = await api.cv.create(payload);

      if (res.success) {
        toast.success(res.message || 'CV saved successfully!');
        const fullResume: ResumeData = {
          personalInfo,
          links,
          skills,
          educations,
          experiences,
          projects,
          professionalSummary: professionalSummary || res.data?.cv?.professionalSummary,
        };
        dispatch(setResume(fullResume));

        if (shouldNavigateToPreview) {
          setTimeout(() => navigate('/applicant/cv-preview'), 1000);
        }
      } else {
        toast.error(res.message || 'Failed to save CV.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error saving CV.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-cyber-dark">
        <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading Profile & CV Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-cyber-dark text-zinc-700 dark:text-zinc-300 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <SleekToast />
      <main className="w-full mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Header */}
        <div className="mb-12 space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-panel-border pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase leading-tight">
              Construct Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-pink">Professional CV</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl mt-1">
              Build an automated, parse-ready CV optimized for recruiters, ATS systems, and tech leads.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded shadow hover:shadow-lg transition-all"
            >
              {saving ? 'Saving...' : 'Preview & Print ↗'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Info Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 bg-accent-cyan" />
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Job Title / Headline</label>
                <input
                  type="text"
                  placeholder="Senior Full Stack Engineer"
                  value={personalInfo.position}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, position: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Phone Number *</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Address / Location</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Links Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 bg-accent-pink" />
              Online Links
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">LinkedIn URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.in/in/username"
                  value={links.linkedIn}
                  onChange={(e) => setLinks({ ...links, linkedIn: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Portfolio URL</label>
                <input
                  type="text"
                  placeholder="https://myportfolio.com"
                  value={links.portfolio}
                  onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">GitHub URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  value={links.github}
                  onChange={(e) => setLinks({ ...links, github: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Twitter / X URL</label>
                <input
                  type="text"
                  placeholder="https://x.com/username"
                  value={links.twitter}
                  onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                  className="w-full mt-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                />
              </div>
            </div>
          </section>

          {/* AI Professional Summary */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-accent-lime" />
                Professional Summary
              </h2>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="px-4 py-1.5 bg-accent-lime/20 border border-accent-lime text-accent-lime hover:bg-accent-lime hover:text-black transition-all font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 self-start"
              >
                {generatingSummary ? '✨ Generating...' : '✨ Generate with Gemini AI'}
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Write a brief professional summary or click 'Generate with Gemini AI'..."
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-accent-lime transition-colors leading-relaxed"
            />
          </section>

          {/* Work Experience Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-accent-cyan" />
                Work Experience
              </h2>
              <span className="text-xs font-mono text-accent-cyan">[{experiences.length}] ENTRIES</span>
            </div>

            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Role / Position"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 items-center">
                    <input
                      type="text"
                      placeholder="Start Date (e.g., Jan 2022)"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="End Date (e.g., Dec 2023)"
                        disabled={exp.isCurrent}
                        value={exp.isCurrent ? 'Present' : exp.endDate}
                        onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                        className="flex-1 bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors disabled:opacity-50"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(idx, 'isCurrent', e.target.checked)}
                          className="accent-accent-cyan"
                        />
                        Present
                      </label>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Description (Each line becomes a bullet point)"
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                    className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
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

          {/* Education Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-accent-pink" />
                Education
              </h2>
              <span className="text-xs font-mono text-accent-pink">[{educations.length}] ENTRIES</span>
            </div>

            <div className="space-y-6">
              {educations.map((edu, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="School / University"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g., Bachelor of Science)"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Field of Study / Department"
                      value={edu.department}
                      onChange={(e) => updateEducation(idx, 'department', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Start Year (e.g., 2018)"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(idx, 'startDate', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="End Year (e.g., 2022)"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(idx, 'endDate', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
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
              onClick={addEducation}
              className="mt-6 text-xs font-mono tracking-widest text-accent-pink uppercase hover:text-accent-cyan transition-colors flex items-center gap-2"
            >
              + Add Education
            </button>
          </section>

          {/* Skills Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 bg-accent-lime" />
              Skills *
            </h2>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
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

          {/* Projects Section */}
          <section className="bg-panel-bg border border-panel-border p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-accent-cyan" />
                Key Projects
              </h2>
              <span className="text-xs font-mono text-accent-cyan">[{projects.length}] PROJECTS</span>
            </div>

            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-cyber-dark/50 border border-zinc-800 space-y-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={(e) => updateProject(idx, 'name', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Project URL / Repo Link"
                      value={proj.link}
                      onChange={(e) => updateProject(idx, 'link', e.target.value)}
                      className="bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Technologies Used (Comma separated e.g. React, Next.js, Tailwind)"
                    value={proj.technologies.join(', ')}
                    onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                    className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                  />
                  <textarea
                    rows={3}
                    placeholder="Project Highlights / Description"
                    value={proj.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    className="w-full bg-white dark:bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:bg-accent-cyan/10 transition-all duration-300 rounded"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-accent-pink to-purple-600 text-white shadow-lg hover:shadow-accent-pink/30 transition-all duration-300 rounded"
            >
              {saving ? 'Saving...' : 'Save & Preview CV ↗'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}