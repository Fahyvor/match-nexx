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
          sessionStorage.removeItem('auth');
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
      this.client.post('/auth/user/logout'),

    refreshToken: () =>
      this.client.post('/auth/refresh-token'),

    getCurrentUser: () => 
      this.client.get('/auth/get-single-user')
  };

  // Job endpoints
  jobs = {
    list: () =>
      this.client.get('/jobs/all-jobs'),

    get: (id: string) =>
      this.client.get(`/jobs/get-single-job/${id}`),

    create: (data: JobData) =>
      this.client.post('/jobs/create-job', data),

    update: (id: string, data: Partial<JobData>) =>
      this.client.put(`/jobs/update-job/${id}`, data),

    delete: (id: string) =>
      this.client.delete(`/jobs/delete-job/${id}`),

    getRecruiterJobs: () =>
      this.client.get('/jobs/recruiter-jobs'),
  };

  // Applicant endpoints
  applicants = {
    getProfile: () =>
      this.client.get('/applicant/profile'),

    updateApplication: (data: ApplicantProfileData) =>
      this.client.put('/applicant/profile', data),

    getApplications: () =>
      this.client.get('/applicant/applications'),

    uploadCV: (file: File) => {
      const formData = new FormData();
      formData.append('cv', file);
      return this.client.put('/applicant/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    parseCV: (data: Cv) => {
      const formData = new FormData();
      formData.append('cv', data.cv);
      return this.client.post('/applicant/parse-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    completeProfile: (data: ApplicantProfileData) =>
      this.client.put('/applicant/complete-profile', data),

    submitApplication: (jobId: string) =>
      this.client.post(`/applicant/apply/${jobId}`),
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

  // CV Builder endpoints
  cv = {
    getMe: () =>
      this.client.get('/cv/me'),

    create: (data: any) =>
      this.client.post('/cv/create', data),

    generateSummary: (data: any) =>
      this.client.post('/cv/generate-summary', data),
  };

  // Payment endpoints
  payments = {
    initializeSubscription: (plan: 'monthly' | 'yearly') =>
      this.client.post('/payments/cv/initialize', { plan }),

    verifyPayment: async (data: { checkoutId: string; chargeId?: string }) => {
      const response = await axios.post("/api/payments/cv/verify", data);
      return response.data;
    },

    activateSubscription: (plan: 'monthly' | 'yearly' = 'monthly') =>
      this.client.post('/payments/recruiter/activate', { plan }),

    getSubscriptionStatus: () =>
      this.client.get('/payments/status'),

    initializeCvPayment: () =>
      this.client.post('/payments/cv/initialize'),

    verifyCvPayment: () =>
      this.client.post('/payments/cv/verify'),

    getCvStatus: () =>
      this.client.get('/payments/cv/status'),
  };
}

export default new ApiClient();