import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  auth = {
    register: (data: {
      name: string;
      email: string;
      password: string;
      userType: 'applicant' | 'recruiter';
    }) => this.client.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
      this.client.post('/auth/login', data),

    logout: () => this.client.post('/auth/logout'),

    refreshToken: () => this.client.post('/auth/refresh-token'),
  };

  // Job endpoints
  jobs = {
    list: () => this.client.get('/jobs'),

    get: (id: string) => this.client.get(`/jobs/${id}`),

    create: (data: any) => this.client.post('/jobs', data),

    update: (id: string, data: any) => this.client.put(`/jobs/${id}`, data),

    delete: (id: string) => this.client.delete(`/jobs/${id}`),
  };

  // Applicant endpoints
  applicants = {
    getProfile: () => this.client.get('/applicants/profile'),

    updateProfile: (data: any) => this.client.put('/applicants/profile', data),

    getApplications: () => this.client.get('/applicants/applications'),

    submitApplication: (jobId: string) =>
      this.client.post('/applicants/applications', { jobId }),
  };

  // Recruiter endpoints
  recruiters = {
    getDashboard: () => this.client.get('/recruiters/dashboard'),

    getProfile: () => this.client.get('/recruiters/profile'),

    updateProfile: (data: any) => this.client.put('/recruiters/profile', data),

    getCandidates: () => this.client.get('/recruiters/candidates'),

    getCandidate: (id: string) => this.client.get(`/recruiters/candidates/${id}`),

    scheduleInterview: (candidateId: string, data: any) =>
      this.client.post(`/recruiters/candidates/${candidateId}/interview`, data),

    sendOffer: (candidateId: string, data: any) =>
      this.client.post(`/recruiters/candidates/${candidateId}/offer`, data),
  };
}

export default new ApiClient();
