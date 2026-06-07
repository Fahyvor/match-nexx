import { dbHelpers, generateId } from './database';
import type { User } from '../models/User';

// Hash password (in production, use bcrypt)
export const hashPassword = (password: string): string => {
  return Buffer.from(password).toString('base64');
};

// Verify password
export const verifyPassword = (password: string, hash: string): boolean => {
  return Buffer.from(password).toString('base64') === hash;
};

// Create JWT token
export const createToken = (userId: string, email: string, role: string): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  })).toString('base64');

  return `${header}.${payload}.signature`;
};

// Verify token and extract payload
export const verifyToken = (token: string): { userId: string; email: string; role: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

// Register new user
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  role: 'applicant' | 'recruiter';
}): { success: boolean; user?: User; message?: string } => {
  const existingUser = dbHelpers.getUserByEmail(data.email);
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }

  if (data.password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }

  const userId = generateId();
  const user: User = {
    id: userId,
    email: data.email,
    name: data.name,
    password: hashPassword(data.password),
    role: data.role,
    profileComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdUser = dbHelpers.createUser(user);
  return { success: true, user: createdUser };
};

// Login user
export const loginUser = (
  email: string,
  password: string,
): { success: boolean; user?: User; token?: string; error?: string } => {
  const user = dbHelpers.getUserByEmail(email);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!verifyPassword(password, user.password)) {
    return { success: false, error: 'Invalid password' };
  }

  const token = createToken(user.id, user.email, user.role);
  return { success: true, user, token };
};

// Verify bearer token from Authorization header
export const verifyBearerToken = (
  authHeader?: string,
): { userId: string; email: string; role: string } | null => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  return verifyToken(authHeader.slice(7));
};