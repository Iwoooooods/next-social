"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  title: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("User not found");
  }

  const { content, title, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      title,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
