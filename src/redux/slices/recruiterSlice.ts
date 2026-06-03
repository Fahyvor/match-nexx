import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import type { InterviewData, OfferData } from '../../utils/api';

interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  scheduledInterviews: number;
  offersExtended: number;
  recentApplications: Record<string, unknown>[];
  upcomingInterviews: Record<string, unknown>[];
}

interface Candidate {
  id: string;
  name?: string;
  email?: string;
  headline?: string;
  skills: string[];
  applications: Record<string, unknown>[];
  matchScore?: number;
}

interface RecruiterState {
  profile: RecruiterProfile | null;
  dashboard: DashboardStats | null;
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecruiterState = {
  profile: null,
  dashboard: null,
  candidates: [],
  selectedCandidate: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchRecruiterProfile = createAsyncThunk(
  'recruiter/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.recruiters.getProfile();
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateRecruiterProfile = createAsyncThunk(
  'recruiter/updateProfile',
  async (data: Partial<RecruiterProfile>, { rejectWithValue }) => {
    try {
      const response = await api.recruiters.updateProfile(data);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'recruiter/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.recruiters.getDashboard();
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch dashboard');
    }
  }
);

export const fetchCandidates = createAsyncThunk(
  'recruiter/fetchCandidates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.recruiters.getCandidates();
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch candidates');
    }
  }
);

export const fetchCandidateDetails = createAsyncThunk(
  'recruiter/fetchCandidateDetails',
  async (candidateId: string, { rejectWithValue }) => {
    try {
      const response = await api.recruiters.getCandidate(candidateId);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch candidate details');
    }
  }
);

export const scheduleInterview = createAsyncThunk(
  'recruiter/scheduleInterview',
  async (
    { candidateId, data }: { candidateId: string; data: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.recruiters.scheduleInterview(candidateId, data as unknown as InterviewData);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to schedule interview');
    }
  }
);

export const sendOffer = createAsyncThunk(
  'recruiter/sendOffer',
  async (
    { candidateId, data }: { candidateId: string; data: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.recruiters.sendOffer(candidateId, data as unknown as OfferData);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to send offer');
    }
  }
);

const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchRecruiterProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload as unknown as RecruiterProfile;
      })
      .addCase(fetchRecruiterProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateRecruiterProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecruiterProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload as unknown as RecruiterProfile;
      })
      .addCase(updateRecruiterProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload as unknown as DashboardStats;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Candidates
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        const candidates = action.payload;
        state.candidates = Array.isArray(candidates) ? (candidates as unknown as Candidate[]) : [candidates as unknown as Candidate];
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Candidate Details
    builder
      .addCase(fetchCandidateDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCandidate = action.payload as unknown as Candidate;
      })
      .addCase(fetchCandidateDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Schedule Interview
    builder
      .addCase(scheduleInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleInterview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Send Offer
    builder
      .addCase(sendOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOffer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedCandidate } = recruiterSlice.actions;
export default recruiterSlice.reducer;
