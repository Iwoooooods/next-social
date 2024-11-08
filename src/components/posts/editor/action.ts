"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";
import { UTApi } from "uploadthing/server";

export async function submitPost(input: {
  content: string;
  title: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("User not found");
  }

  const { content, mediaIds, title } = createPostSchema.parse(input);

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

export async function deleteAttachment(keys: string | string[]) {
  await new UTApi().deleteFiles(keys);
}
