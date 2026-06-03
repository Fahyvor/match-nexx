import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'applicant' | 'recruiter';
  profileComplete: boolean;
  createdAt: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
      address: string;
      state: string;
      country: string;
      years_of_experience: number;
      userType: 'applicant' | 'recruiter';
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.auth.register(data);
      localStorage.setItem('token', response.token);
      return { user: response.user, token: response.token };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (
    data: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.auth.login(data);
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);

      return { user, token };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.auth.logout();

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');

      return null;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'user/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.auth.refreshToken();
      const { token } = response.data;

      localStorage.setItem('token', token);
      return token;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Token refresh failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
