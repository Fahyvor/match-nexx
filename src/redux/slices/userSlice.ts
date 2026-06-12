import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  state: string;
  country: string;
  years_of_experience: string;
  address: string;
  role: 'applicant' | 'recruiter';
  createdAt: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const loadAuth = () => {
  const raw = sessionStorage.getItem('auth');
  if (!raw) return { token: null, user: null };

  try {
    const parsed = JSON.parse(raw);

    if (Date.now() > parsed.expiry) {
      sessionStorage.removeItem('auth');
      return { token: null, user: null };
    }

    return {
      token: parsed.token,
      user: parsed.user,
    };
  } catch {
    sessionStorage.removeItem('auth');
    return { token: null, user: null };
  }
};

const auth = loadAuth();

const initialState: UserState = {
  user: auth.user,
  token: auth.token,
  loading: false,
  error: null,
  isAuthenticated: !!auth.token,
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
      sessionStorage.setItem('token', response.data.token);
      return { user: response.data.user, token: response.data.token };
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
      const res = await api.auth.login(data);

      // handle both shapes: res.data.data OR res.data
      const payload = res.data?.data ?? res.data;
      const { token, user } = payload;

      const expiry = Date.now() + 24 * 60 * 60 * 1000;

      sessionStorage.setItem(
        'auth',
        JSON.stringify({ token, user, expiry })
      );

      return { user, token };
    } catch (error: unknown) {
      console.error('LOGIN THUNK ERROR:', error);

      let message = 'Login failed';

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const err = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
              detail?: string;
            };
          };
        };

        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.auth.logout();

      // Clear sessionStorage
      sessionStorage.removeItem('auth');

      return null;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(apiError.response?.data?.error || 'Logout failed');
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
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
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
