import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import { getPostDataInclude } from "@/lib/types";
import { PostPage } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 4;
    const { user } = await validateRequest();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      where: {
        userId: params.userId,
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
