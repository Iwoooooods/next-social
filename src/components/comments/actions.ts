"use server";

import { getCommentDataInclude, PostData } from "@/lib/types";
import { validateRequest } from "@/auth";
import { createCommentSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  const { content: contentValidated } = createCommentSchema.parse({ content });
  // const [newComment] = await prisma.$transaction([
  //   prisma.comment.create({
  //     data: {
  //       content: contentValidated,
  //       postId: post.id,
  //       userId: user.id,
  //     },
  //     include: getCommentDataInclude(user.id),
  //   }),
  //   ...(post.userId !== user.id
  //     ? [
  //         prisma.notification.create({
  //           data: {
  //             recipientId: post.userId,
  //             issuerId: user.id,
  //             type: "COMMENT",
  //             postId: post.id,
  //           },
  //         }),
  //       ]
  //     : []),
  // ]);

  // return newComment;
  const result = await prisma.$transaction(async (tx) => {
    const newComment = await tx.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    });
    if (post.userId !== user.id) {
      await tx.notification.create({
        data: {
          recipientId: post.userId,
          issuerId: user.id,
          type: "COMMENT",
          postId: post.id,
          commentId: newComment.id,
        },
      });
    }
    return newComment;
  });
  return result;
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  const comment = await prisma.comment.findFirst({
    where: { id },
    include: getCommentDataInclude(user.id),
  });
  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== user.id) throw new Error("Unauthorized");
  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });
  return deletedComment;
}
