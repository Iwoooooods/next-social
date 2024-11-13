"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { updatePostSchema } from "@/lib/validation";

export async function updatePost(input: {
  postId: string;
  content: string;
  title: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("User not found");
  }

  const { content, title, mediaIds, postId } = updatePostSchema.parse(input);

  const updatedPost = await prisma.$transaction(async (tx) => {
    await tx.media.deleteMany({
      where: {
        postId: postId,
      },
    });

    const post = await tx.post.update({
      where: {
        id: postId,
        userId: user.id,
      },
      data: {
        content,
        title,
        attachments: {
          connect: mediaIds.map((id) => ({ id })),
        },
      },
      include: getPostDataInclude(user.id),
    });

    return post;
  });

  return updatedPost;
}
