import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { JobData } from '../../utils/api';

interface Job {
  id: string;
  recruiterId: string;
  title: string;
  company?: string;
  description?: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  requirements?: string[];
  experienceLevel?: string;
  deadline?: string;
  status: 'open' | 'closed' | 'on-hold';
  totalApplicants: number;
  createdAt: string;
  updatedAt: string;
}

interface JobFilters {
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  searchTerm?: string;
}

interface JobsState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: JobsState = {
  jobs: [],
  filteredJobs: [],
  selectedJob: null,
  filters: {},
  loading: false,
  error: null,
  totalCount: 0,
};

// Async Thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.jobs.list();
      return Array.isArray(response) ? response : response?.data || [];
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.jobs.get(jobId);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch job');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.jobs.create(jobData as unknown as JobData);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (
    { jobId, data }: { jobId: string; data: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.jobs.update(jobId, data);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to update job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      await api.jobs.delete(jobId);
      return jobId;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to delete job');
    }
  }
);

export const applyForJob = createAsyncThunk(
  'jobs/applyForJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.applicants.submitApplication(jobId);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to apply for job');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredJobs = state.jobs;
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.filteredJobs = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Job By ID
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload as unknown as Job;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Job
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        const job = action.payload as unknown as Job;
        state.jobs.unshift(job);
        state.filteredJobs.unshift(job);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Job
    builder
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload as unknown as Job;
        const index = state.jobs.findIndex((job) => job.id === updated.id);
        if (index !== -1) {
          state.jobs[index] = updated;
          const filteredIndex = state.filteredJobs.findIndex((job) => job.id === updated.id);
          if (filteredIndex !== -1) {
            state.filteredJobs[filteredIndex] = updated;
          }
        }
        if (state.selectedJob?.id === updated.id) {
          state.selectedJob = updated;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Job
    builder
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        const jobId = action.payload;
        state.jobs = state.jobs.filter((job) => job.id !== jobId);
        state.filteredJobs = state.filteredJobs.filter((job) => job.id !== jobId);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Apply For Job
    builder
      .addCase(applyForJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForJob.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, setSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
