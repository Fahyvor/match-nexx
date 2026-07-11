import { useState } from 'react';

interface Experience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  year: string;
}

export default function CVBuilder() {
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, company: '', role: '', startDate: '', endDate: '', description: '' }
  ]);
  const [education, setEducation] = useState<Education[]>([
    { id: 1, school: '', degree: '', field: '', year: '' }
  ]);
  const [skills, setSkills] = useState<string[]>(['']);

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now(),
      school: '',
      degree: '',
      field: '',
      year: ''
    }]);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const removeEducation = (id: number) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white">
      <main className="max-w-5xl mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Header */}
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel-bg border border-zinc-800 text-[11px] font-mono tracking-widest text-accent-cyan">
            <span className="w-1.5 h-1.5 bg-accent-cyan animate-ping" />
            CV_BUILDER_ACTIVE
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-tight">
            Construct Your <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-cyan to-accent-pink">Professional Profile</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">Build an automated, parse-ready profile optimized for ATS systems and direct delivery to tech leads.</p>
        </div>

        <div className="space-y-8">
          {/* Work Experience Section */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2 h-2 bg-accent-cyan" />
                Work Experience
              </h2>
              <span className="text-[10px] font-mono text-accent-cyan">[{experiences.length}] ENTRIES</span>
            </div>

            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-6 bg-cyber-dark/50 border border-zinc-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].company = e.target.value;
                        setExperiences(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].role = e.target.value;
                        setExperiences(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].startDate = e.target.value;
                        setExperiences(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].endDate = e.target.value;
                        setExperiences(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  <textarea
                    placeholder="Job Description"
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].description = e.target.value;
                      setExperiences(updated);
                    }}
                    className="w-full bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600 min-h-24"
                  />
                  {experiences.length > 1 && (
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-xs font-mono text-accent-pink hover:underline"
                    >
                      // Remove Entry
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addExperience}
              className="mt-6 text-xs font-mono tracking-widest text-accent-cyan uppercase hover:text-accent-pink transition-colors flex items-center gap-2"
            >
              + Add Experience
            </button>
          </section>

          {/* Education Section */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2 h-2 bg-accent-pink" />
                Education
              </h2>
              <span className="text-[10px] font-mono text-accent-pink">[{education.length}] ENTRIES</span>
            </div>

            <div className="space-y-6">
              {education.map((edu, idx) => (
                <div key={edu.id} className="p-6 bg-cyber-dark/50 border border-zinc-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="School/University"
                      value={edu.school}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].school = e.target.value;
                        setEducation(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors placeholder:text-zinc-600"
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={edu.field}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].field = e.target.value;
                        setEducation(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors placeholder:text-zinc-600"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year"
                      value={edu.year}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].year = e.target.value;
                        setEducation(updated);
                      }}
                      className="bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-pink transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  {education.length > 1 && (
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="text-xs font-mono text-accent-cyan hover:underline"
                    >
                      // Remove Entry
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addEducation}
              className="mt-6 text-xs font-mono tracking-widest text-accent-pink uppercase hover:text-accent-cyan transition-colors flex items-center gap-2"
            >
              + Add Education
            </button>
          </section>

          {/* Skills Section */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                <span className="w-2 h-2 bg-accent-lime" />
                Skills
              </h2>
              <span className="text-[10px] font-mono text-accent-lime">[{skills.length}] SKILLS</span>
            </div>

            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g., React, TypeScript, Node.js"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx] = e.target.value;
                      setSkills(updated);
                    }}
                    className="flex-1 bg-cyber-dark border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:border-accent-lime transition-colors placeholder:text-zinc-600"
                  />
                  {skills.length > 1 && (
                    <button
                      onClick={() => removeSkill(idx)}
                      className="text-xs font-mono text-accent-pink hover:underline"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addSkill}
              className="mt-4 text-xs font-mono tracking-widest text-accent-lime uppercase hover:text-accent-pink transition-colors flex items-center gap-2"
            >
              + Add Skill
            </button>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8">
            <button className="flex-1 relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 overflow-hidden group">
              <span className="relative z-10">Save Draft</span>
              <div className="absolute inset-0 bg-accent-cyan transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
            </button>
            <button className="flex-1 relative px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink hover:shadow-[0_0_30px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group">
              <span className="relative z-10">Publish Profile</span>
              <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}