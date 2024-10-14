import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { validateRequest } from "@/auth";

export async function GET(
  request: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(user.id),
    });

    return Response.json(post);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
