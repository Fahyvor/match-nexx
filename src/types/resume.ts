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
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  links: LinksInfo;
  skills: string[];
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  professionalSummary?: string;
}
