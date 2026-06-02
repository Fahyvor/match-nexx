import { registerUser, loginUser, createToken, verifyBearerToken } from '../utils/auth';

export const authController = {

  register: async (data: {
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
  }): Promise<{
    success: boolean;
    message: string;
    data?: { id: string; email: string; name: string; role: string };
    error?: string;
  }> => {
    const result = registerUser({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: data.userType,
    });

    if (!result.success) {
      return { success: false, message: 'Registration failed', error: result.error };
    }

    const user = result.user!;
    return {
      success: true,
      message: 'User registered successfully',
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  login: async (
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { token: string; user: { id: string; email: string; name: string; role: string } };
    error?: string;
  }> => {
    const result = loginUser(email, password);

    if (!result.success) {
      return { success: false, message: 'Login failed', error: result.error };
    }

    const user = result.user!;
    const token = result.token!;

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    };
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'Logged out successfully' };
  },

  refreshToken: async (
    authHeader?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { token: string };
    error?: string;
  }> => {
    const payload = verifyBearerToken(authHeader);

    if (!payload) {
      return { success: false, message: 'Invalid or expired token', error: 'Unauthorized' };
    }

    const token = createToken(payload.userId, payload.email, payload.role);
    return { success: true, message: 'Token refreshed successfully', data: { token } };
  },

  // Stubs — implement when ready
  // getAllUsers
  // getCurrentUser
  // getUserById
  // updateUser
  // deleteUser
  // updatePassword
  // forgotPassword
};