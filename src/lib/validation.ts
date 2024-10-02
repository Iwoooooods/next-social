import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email"),
  username: requiredString.regex(/^[a-zA-Z0-9_]+$/, "Invalid username"),
  password: requiredString.min(8, "Password must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
});

export const updateUserSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Bio must be at most 1000 characters"),
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;
  