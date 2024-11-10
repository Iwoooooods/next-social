import { cache } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { validateRequest } from "@/auth";
import UnauthorizedMessage from "@/components/UnauthorizedMessage";
import UserProfile from "./UserProfile";
import UserPosts from "./UserPosts";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Profile",
};

const getUser = async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  return user;
};

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return <UnauthorizedMessage />;
  }

  const user = await getUser(params.username, loggedInUser.id);

  if (!user) {
    notFound();
  }

  return (
    <main className="mt-4 flex h-full w-full flex-col items-center gap-4">
      <UserProfile user={user} loggedInUserId={loggedInUser.id} />
      <UserPosts userId={user.id} />
    </main>
  );
}
