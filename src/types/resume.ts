export interface PersonalInfo {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  address: string;
}

export interface LinksInfo {
  linkedIn: string;
  portfolio: string;
  github: string;
  twitter: string;
  facebook?: string;
}

export interface EducationEntry {
  institution: string;
  department: string;
  degree: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  location?: string;
  studyPeriod?: string;
  degreeConferred?: string;
  cgpa?: string;
  classification?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  location?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface ReferenceEntry {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship?: string;
}

export interface ResearchExperienceEntry {
  projectRole?: string;
  title: string;
  institution: string;
  year?: string;
  objective?: string;
  responsibilities?: string[];
  relevance?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export type CvTemplateType = 'professional' | 'academic';

export interface ResumeData {
  templateType?: CvTemplateType;
  personalInfo: PersonalInfo;
  links: LinksInfo;
  skills: string[];
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  references?: ReferenceEntry[];
  professionalSummary?: string;

  // Academic / Research CV fields
  researchInterests?: string[];
  academicProfile?: string;
  researchExperiences?: ResearchExperienceEntry[];
  skillCategories?: SkillCategory[];
  transferableSkills?: string[];
  careerObjective?: string;
  referencesNote?: string;
}
