import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = '/api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  state: string;
  country: string;
  years_of_experience: number;
  email: string;
  password: string;
  userType: 'applicant' | 'recruiter';
}

export interface Cv {
  cv: File;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JobData {
  title: string;
  description: string;
  location: string;
  salary?: number;
  requirements: string[];
  type?: 'full-time' | 'part-time' | 'contract' | 'remote';
}

export interface ApplicantProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  state?: string;
  country?: string;
  years_of_experience?: number;
  skills?: string[];
  bio?: string;
}

export interface RecruiterProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
}

export interface InterviewData {
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export interface OfferData {
  salary: number;
  startDate: string;
  notes?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const data = sessionStorage.getItem('auth');
      if (data) {
        const { token } = JSON.parse(data);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  auth = {
    register: (data: RegisterData) =>
      this.client.post('/auth/register', data),

    login: (data: LoginData) =>
      this.client.post('/auth/login', data),

    logout: () =>
      this.client.post('/auth/logout'),

    refreshToken: () =>
      this.client.post('/auth/refresh-token'),
  };

  // Job endpoints
  jobs = {
    list: () =>
      this.client.get('/jobs'),

    get: (id: string) =>
      this.client.get(`/jobs/${id}`),

    create: (data: JobData) =>
      this.client.post('/jobs', data),

    update: (id: string, data: Partial<JobData>) =>
      this.client.put(`/jobs/${id}`, data),

    delete: (id: string) =>
      this.client.delete(`/jobs/${id}`),
  };

  // Applicant endpoints
  applicants = {
    getProfile: () =>
      this.client.get('/applicant/profile'),

    updateApplication: (data: ApplicantProfileData) =>
      this.client.put('/applicant/profile', data),

    getApplications: () =>
      this.client.get('/applicant/applications'),

    parseCV: (data: Cv) => 
      this.client.post('/applicant/parse-cv', data),

    completeProfile: (data: ApplicantProfileData) =>
      this.client.put('/applicant/complete-profile', data),

    submitApplication: (jobId: string) =>
      this.client.post(`/applicant/apply/${jobId}`)

    // submitApplication: (jobId: string) =>
    //   this.client.post('/applicant/apply', { jobId }),
  };

  // Recruiter endpoints
  recruiters = {
    getDashboard: () =>
      this.client.get('/recruiters/dashboard'),

    getProfile: () =>
      this.client.get('/recruiters/profile'),

    updateProfile: (data: RecruiterProfileData) =>
      this.client.put('/recruiters/profile', data),

    getCandidates: () =>
      this.client.get('/recruiters/candidates'),

    getCandidate: (id: string) =>
      this.client.get(`/recruiters/candidates/${id}`),

    scheduleInterview: (candidateId: string, data: InterviewData) =>
      this.client.post(`/recruiters/candidates/${candidateId}/interview`, data),

    sendOffer: (candidateId: string, data: OfferData) =>
      this.client.post(`/recruiters/candidates/${candidateId}/offer`, data),
  };
}

export default new ApiClient();