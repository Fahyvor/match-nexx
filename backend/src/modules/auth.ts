import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

type UpdateUserType = Partial<typeof users.$inferInsert>;

/* =========================
   PASSWORD HELPERS
========================= */
export const hashPassword = (password: string): string => {
  return Buffer.from(password).toString("base64");
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return Buffer.from(password).toString("base64") === hash;
};

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  state: string;
  country: string;
  years_of_experience: number;
  role: "applicant" | "recruiter" | "admin";
}) => {
  // check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    throw { status: 409, error: "Email already registered" };
  }

  if (data.password.length < 8) {
    throw { status: 400, error: "Password must be at least 8 characters" };
  }

  const newUser = {
    id: randomUUID(),
    email: data.email,
    password: hashPassword(data.password),
    firstName: data.firstName,
    lastName: data.lastName,
    state: data.state,
    country: data.country,
    years_of_experience: data.years_of_experience,
    role: data.role,
  };

  const inserted = await db.insert(users).values(newUser).returning();

  return {
    success: true,
    user: inserted[0],
  };
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (email: string, password: string) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  const isValid = verifyPassword(password, user.password);

  if (!isValid) {
    throw { status: 401, error: "Invalid email or password" };
  }

  return {
    success: true,
    user,
  };
};

export const updateUser = async (data: {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  state?: string;
  country?: string;
  years_of_experience?: number;
  role?: "applicant" | "recruiter" | "admin";
}) => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, data.id))
    .limit(1);

  if (existing.length === 0) {
    throw { status: 404, error: "User not found" };
  }

  const updatedUser: UpdateUserType = {
    updatedAt: new Date(),
  };

  if (data.firstName) updatedUser.firstName = data.firstName;
  if (data.lastName) updatedUser.lastName = data.lastName;
  if (data.email) updatedUser.email = data.email;
  if (data.state) updatedUser.state = data.state;
  if (data.country) updatedUser.country = data.country;
  if (data.years_of_experience !== undefined)
    updatedUser.years_of_experience = data.years_of_experience;
  if (data.role) updatedUser.role = data.role;

  if (data.password) {
    if (data.password.length < 8) {
      throw { status: 400, error: "Password must be at least 8 characters" };
    }
    updatedUser.password = hashPassword(data.password);
  }

  const updated = await db
    .update(users)
    .set(updatedUser)
    .where(eq(users.id, data.id))
    .returning();

  return {
    success: true,
    user: updated[0],
  };
};