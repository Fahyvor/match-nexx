// User model interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  state: string;
  country: string;
  years_of_experience: number;
  userType: 'applicant' | 'recruiter';
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  websiteUrl?: string;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'profileComplete'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'role'>>;
