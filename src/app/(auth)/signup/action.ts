"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { SignUpValues, signUpSchema } from "@/lib/validation";
import { hash } from "@/lib/validation";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { email, username, password } = signUpSchema.parse(credentials);

    const passwordHash = hash(password);

    const userId = generateIdFromEntropySize(10);
    const existingUserName = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (existingUserName) {
      return { error: "Username already exists" };
    }
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existingEmail) {
      return { error: "Email already exists" };
    }
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        passwordHash,
        displayName: username,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Failed to sign up" };
  }
}
