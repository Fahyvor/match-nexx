import type { FC } from 'react';
import type { ResumeData } from '../types/resume';

interface Template02Props {
  resume: ResumeData;
}

const formatResumeDate = (dateStr?: string) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
    const date = new Date(year, month);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }
  return dateStr;
};

const Template02: FC<Template02Props> = ({ resume }) => {
  const {
    personalInfo,
    links,
    skills,
    educations,
    experiences,
    projects,
    references,
    professionalSummary,
    researchInterests,
    academicProfile,
    researchExperiences,
    skillCategories,
    transferableSkills,
    careerObjective,
    referencesNote,
  } = resume;

  const fullName =
    personalInfo.firstName || personalInfo.lastName
      ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
      : 'FULL NAME';

  const positionTitle = personalInfo.position || '';

  // Fallback to professional summary if academic profile is not explicitly filled
  const effectiveAcademicProfile = academicProfile || professionalSummary;

  // Derive research experiences if empty: map projects or use default
  const effectiveResearchExp =
    researchExperiences && researchExperiences.length > 0
      ? researchExperiences
      : projects && projects.length > 0
      ? projects.map((p) => ({
          projectRole: 'Research & Technical Project',
          title: p.name,
          institution: 'Academic / Research Institution',
          year: '',
          objective: p.description,
          responsibilities: p.technologies ? [`Technologies & Tools: ${p.technologies.join(', ')}`] : [],
          relevance: p.link ? `Repository/Publication: ${p.link}` : undefined,
        }))
      : [];

  // Grouped skills fallback if skillCategories not provided
  const effectiveSkillCategories =
    skillCategories && skillCategories.length > 0
      ? skillCategories
      : skills && skills.length > 0
      ? [
          {
            category: 'Technical and Research Skills',
            items: skills,
          },
        ]
      : [];

  return (
    <div className="bg-white text-zinc-900 w-full max-w-4xl mx-auto p-8 sm:p-12 shadow-lg rounded-sm font-serif print:shadow-none print:border-none print:p-0 border border-zinc-200">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-sans">
          {fullName}
        </h1>

        {positionTitle && (
          <p className="text-sm sm:text-base font-bold text-zinc-800 mt-1">
            {positionTitle}
          </p>
        )}

        <div className="mt-2 text-xs sm:text-sm text-zinc-700 space-y-0.5">
          {personalInfo.address && <p>{personalInfo.address}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {personalInfo.phone && (
              <p>
                <strong className="font-semibold text-zinc-900">Phone:</strong> {personalInfo.phone}
              </p>
            )}
            {personalInfo.email && (
              <p>
                <strong className="font-semibold text-zinc-900">Email:</strong>{' '}
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-blue-700 hover:underline"
                >
                  {personalInfo.email}
                </a>
              </p>
            )}
            {links?.linkedIn && (
              <p>
                <strong className="font-semibold text-zinc-900">LinkedIn:</strong>{' '}
                <a
                  href={links.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {links.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                </a>
              </p>
            )}
          </div>
        </div>

        <hr className="mt-4 border-zinc-900 border-t-2" />
      </header>

      {/* RESEARCH INTERESTS */}
      {researchInterests && researchInterests.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-2">
            RESEARCH INTERESTS
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-zinc-800 space-y-1 leading-relaxed">
            {researchInterests.map((interest, idx) => (
              <li key={idx}>{interest}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ACADEMIC PROFILE */}
      {effectiveAcademicProfile && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-2">
            ACADEMIC PROFILE
          </h2>
          <div className="text-xs sm:text-sm text-zinc-800 leading-relaxed space-y-2 text-justify">
            {effectiveAcademicProfile.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {educations && educations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-3">
            EDUCATION
          </h2>
          <div className="space-y-4">
            {educations.map((edu, idx) => (
              <div key={idx} className="text-xs sm:text-sm text-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-950">
                  {edu.institution}
                </h3>
                <p className="font-bold text-zinc-900 mt-0.5">
                  {edu.degree}
                  {edu.department && ` in ${edu.department}`}
                </p>
                {edu.location && <p className="text-zinc-600">{edu.location}</p>}
                
                <div className="mt-1 space-y-0.5">
                  {(edu.studyPeriod || (edu.startDate && edu.endDate)) && (
                    <p>
                      <strong className="font-semibold text-zinc-900">Study period:</strong>{' '}
                      {edu.studyPeriod || `${edu.startDate} – ${edu.endDate}`}
                    </p>
                  )}
                  {edu.degreeConferred && (
                    <p>
                      <strong className="font-semibold text-zinc-900">Degree conferred:</strong>{' '}
                      {edu.degreeConferred}
                    </p>
                  )}
                  {edu.cgpa && (
                    <p>
                      <strong className="font-semibold text-zinc-900">CGPA:</strong> {edu.cgpa}
                    </p>
                  )}
                  {edu.classification && (
                    <p>
                      <strong className="font-semibold text-zinc-900">Classification:</strong>{' '}
                      {edu.classification}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* UNDERGRADUATE RESEARCH EXPERIENCE / RESEARCH EXPERIENCE */}
      {effectiveResearchExp.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-3">
            UNDERGRADUATE RESEARCH EXPERIENCE
          </h2>
          <div className="space-y-5">
            {effectiveResearchExp.map((research, idx) => (
              <div key={idx} className="text-xs sm:text-sm text-zinc-800 space-y-1.5">
                {research.projectRole && (
                  <h3 className="font-bold text-sm text-zinc-900">
                    {research.projectRole}
                  </h3>
                )}
                <p className="font-bold text-zinc-950">
                  {research.title}
                </p>
                {research.institution && (
                  <p className="text-zinc-600 italic">
                    {research.institution} {research.year && `| ${research.year}`}
                  </p>
                )}

                {research.objective && (
                  <p className="mt-2 text-justify">
                    <strong className="font-semibold text-zinc-950">Research objective:</strong>{' '}
                    {research.objective.replace(/^Research objective:\s*/i, '')}
                  </p>
                )}

                {research.responsibilities && research.responsibilities.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-zinc-950">
                      Experimental approach and responsibilities:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 leading-relaxed">
                      {research.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {research.relevance && (
                  <p className="mt-2 text-justify">
                    <strong className="font-semibold text-zinc-950">Research relevance:</strong>{' '}
                    {research.relevance.replace(/^Research relevance:\s*/i, '')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROFESSIONAL EXPERIENCE */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-3">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experiences.map((exp, idx) => {
              const bullets = exp.description
                ? exp.description
                    .split('\n')
                    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
                    .filter(Boolean)
                : [];

              return (
                <div key={idx} className="text-xs sm:text-sm text-zinc-800">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-950">
                    {exp.role}
                  </h3>
                  <p className="font-bold text-zinc-800 mt-0.5">
                    {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </p>
                  <p className="text-zinc-600 mt-0.5">
                    {formatResumeDate(exp.startDate)}{' '}
                    {exp.isCurrent ? '– Present' : exp.endDate && `– ${formatResumeDate(exp.endDate)}`}
                  </p>
                  {bullets.length > 0 && (
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 leading-relaxed">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TECHNICAL AND RESEARCH SKILLS */}
      {effectiveSkillCategories.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-3">
            TECHNICAL AND RESEARCH SKILLS
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-800">
            {effectiveSkillCategories.map((cat, idx) => (
              <div key={idx}>
                <p className="font-bold text-zinc-950 mb-1">
                  {cat.category}
                </p>
                <ul className="list-disc pl-5 space-y-0.5 leading-relaxed">
                  {cat.items.map((item, iIdx) => (
                    <li key={iIdx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TRANSFERABLE SKILLS */}
      {transferableSkills && transferableSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-2">
            TRANSFERABLE SKILLS
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-zinc-800 space-y-1 leading-relaxed">
            {transferableSkills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* CAREER OBJECTIVE */}
      {careerObjective && (
        <section className="mb-6">
          <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-2">
            CAREER OBJECTIVE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed text-justify">
            {careerObjective}
          </p>
        </section>
      )}

      {/* REFERENCES */}
      <section className="mb-4">
        <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-zinc-950 font-sans mb-2">
          REFERENCES
        </h2>
        {references && references.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-800">
            {references.map((ref, idx) => (
              <div key={idx} className="border-l-2 border-zinc-400 pl-3">
                <p className="font-bold text-zinc-950">{ref.name}</p>
                <p className="font-medium text-zinc-800">{ref.position}</p>
                <p className="text-zinc-600">{ref.company}</p>
                {ref.email && <p className="text-blue-700">{ref.email}</p>}
                {ref.phone && <p>{ref.phone}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-zinc-700 italic">
            {referencesNote || 'Academic and professional references available upon request.'}
          </p>
        )}
      </section>
    </div>
  );
};

export default Template02;
