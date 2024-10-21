"use server";

import { LoginValues, loginSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { verify } from "@/lib/validation";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { lucia } from "@/auth";

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (!existingUser || !existingUser.passwordHash) {
      console.log("no such user");
      return { error: "Invalid credentials" };
    }
    const passwordMatch = verify(password, existingUser.passwordHash);

    if (!passwordMatch) {
      console.log("password does not match");
      return { error: "Invalid credentials" };
    }

    const session = await lucia.createSession(existingUser.id, {});
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
    console.log("error", error);
    return { error: "Invalid credentials" };
  }
}
