// Auth Controller
import { registerUser, loginUser } from '../utils/auth';
// import type { User } from '../models/User';

export const authController = {
  // Register a new user
  register: async (data: {
    name: string;
    email: string;
    password: string;
    userType: 'applicant' | 'recruiter';
  }): Promise<{
    success: boolean;
    message: string;
    data?: { id: string; email: string; name: string; role: string };
    error?: string;
  }> => {
    const result = registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.userType,
    });

    if (!result.success) {
      return {
        success: false,
        message: 'Registration failed',
        error: result.error,
      };
    }

    const user = result.user!;
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  // Login user
  login: async (email: string, password: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      token: string;
      user: { id: string; email: string; name: string; role: string };
    };
    error?: string;
  }> => {
    const result = loginUser(email, password);

    if (!result.success) {
      return {
        success: false,
        message: 'Login failed',
        error: result.error,
      };
    }

    const user = result.user!;
    const token = result.token!;

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  },

  // Logout (frontend handles token removal)
  logout: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  },

  // Refresh token
  refreshToken: async (userId: string, email: string, role: string): Promise<{
    success: boolean;
    message: string;
    data?: { token: string };
    error?: string;
  }> => {
    // In production, validate that refresh token is valid
    const { createToken } = await import('../utils/auth');
    const token = createToken(userId, email, role);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    };
  },

  // Get All Users
  // Get a Single User
  // Update User
  // Delete User
  // Update Password
  // Forgot Password
};
