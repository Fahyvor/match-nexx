import type { FC } from 'react';
import type { ResumeData } from '../types/resume';

interface Template01Props {
  resume: ResumeData;
}

const Template01: FC<Template01Props> = ({ resume }) => {
  const { personalInfo, links, skills, educations, experiences, projects, professionalSummary } = resume;

  const linkItems = [
    { label: 'Email', value: personalInfo.email ? `mailto:${personalInfo.email}` : '' },
    { label: 'Phone', value: personalInfo.phone },
    { label: 'LinkedIn', value: links.linkedIn },
    { label: 'Portfolio', value: links.portfolio },
    { label: 'GitHub', value: links.github },
    { label: 'Twitter', value: links.twitter },
  ].filter((item) => item.value);

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl w-full mx-auto shadow-lg rounded-sm font-sans border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-4 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900">
          {personalInfo.firstName || personalInfo.lastName
            ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
            : 'FULL NAME'}
        </h1>
        {personalInfo.position && (
          <p className="text-base font-semibold text-slate-600 uppercase tracking-wide mt-1">
            {personalInfo.position}
          </p>
        )}

        {personalInfo.address && (
          <p className="text-xs text-slate-500 mt-1">
            {personalInfo.address}
          </p>
        )}

        {linkItems.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-3 text-xs text-slate-600">
            {linkItems.map((item, idx) => (
              <span key={item.label} className="inline-flex items-center gap-1">
                {idx > 0 && <span className="text-slate-400">|</span>}
                <a
                  href={item.value}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-600 transition-colors font-medium"
                >
                  <span className="font-semibold text-slate-800">{item.label}:</span> {item.value.replace(/^mailto:/, '')}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 whitespace-nowrap">
              Professional Summary
            </h2>
            <div className="h-px bg-slate-300 w-full" />
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 whitespace-nowrap">
              Skills
            </h2>
            <div className="h-px bg-slate-300 w-full" />
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {skills.map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className="bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-md font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 whitespace-nowrap">
              Work Experience
            </h2>
            <div className="h-px bg-slate-300 w-full" />
          </div>
          <div className="space-y-4">
            {experiences.map((exp, idx) => {
              const bullets = exp.description
                ? exp.description
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                : [];

              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <div>
                      <span className="text-sm">{exp.role}</span>
                      <span className="text-slate-500 font-normal ml-2">@ {exp.company}</span>
                    </div>
                    <span className="text-slate-500 font-normal">
                      {exp.startDate} {exp.isCurrent ? '- Present' : exp.endDate && `- ${exp.endDate}`}
                    </span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 ml-4 list-disc text-xs text-slate-700 space-y-1">
                      {bullets.map((line, i) => (
                        <li key={i} className="leading-relaxed">{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Education */}
      {educations && educations.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 whitespace-nowrap">
              Education
            </h2>
            <div className="h-px bg-slate-300 w-full" />
          </div>
          <div className="space-y-3">
            {educations.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs">
                <div>
                  <p className="font-bold text-slate-900">{edu.institution}</p>
                  <p className="text-slate-600">
                    {edu.degree} {edu.department && `• ${edu.department}`}
                  </p>
                </div>
                <span className="text-slate-500 font-normal">
                  {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 whitespace-nowrap">
              Projects
            </h2>
            <div className="h-px bg-slate-300 w-full" />
          </div>
          <div className="space-y-4">
            {projects.map((proj, idx) => {
              const bullets = proj.description
                ? proj.description
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                : [];

              return (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{proj.name}</span>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="text-[11px] font-normal text-slate-500">
                          ({proj.technologies.join(', ')})
                        </span>
                      )}
                    </div>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-700 hover:underline font-medium"
                      >
                        View Project ↗
                      </a>
                    )}
                  </div>
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 ml-4 list-disc text-xs text-slate-700 space-y-1">
                      {bullets.map((line, i) => (
                        <li key={i} className="leading-relaxed">{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Template01;
