import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // in Lucia, we use cookies and sesssions instead of JWTs
    // because JWTs are not in control of the server,
    // cookies here will not expire and we only need to delete the session from the database for logout
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  // return the login user attributes to the frontend
  getUserAttributes(databaseUserAttributes) {
    return {
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      googleId: databaseUserAttributes.googleId,
      avatarUrl: databaseUserAttributes.avatarUrl,
      bio: databaseUserAttributes.bio,
    };
  },
});

// extend the Lucia type to add our own attributes
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// this interface defines the attributes of the user that we want for frontend after login
interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  googleId: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }
    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (error) {}
    return result;
  },
);
