import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface ApplicantProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  portfolio?: string;
  resume?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
}

interface ApplicantState {
  profile: ApplicantProfile | null;
  experiences: Experience[];
  educations: Education[];
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicantState = {
  profile: null,
  experiences: [],
  educations: [],
  applications: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchApplicantProfile = createAsyncThunk(
  'applicant/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.applicants.getProfile();
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateApplicantProfile = createAsyncThunk(
  'applicant/updateProfile',
  async (data: Partial<ApplicantProfile>, { rejectWithValue }) => {
    try {
      const response = await api.applicants.updateProfile(data);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const fetchApplications = createAsyncThunk(
  'applicant/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.applicants.getApplications();
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to fetch applications');
    }
  }
);

export const submitApplication = createAsyncThunk(
  'applicant/submitApplication',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.applicants.submitApplication(jobId);
      return response;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Failed to submit application');
    }
  }
);

const applicantSlice = createSlice({
  name: 'applicant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchApplicantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload as unknown as ApplicantProfile;
      })
      .addCase(fetchApplicantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateApplicantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplicantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload as unknown as ApplicantProfile;
      })
      .addCase(updateApplicantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Applications
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        const apps = action.payload;
        state.applications = Array.isArray(apps) ? (apps as unknown as Application[]) : [apps as unknown as Application];
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Submit Application
    builder
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.push(action.payload as unknown as Application);
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = applicantSlice.actions;
export default applicantSlice.reducer;
