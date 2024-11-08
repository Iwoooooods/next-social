import { validateRequest } from "@/auth";
import { getPostDataInclude, PostPage } from "@/lib/types";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;
    const { user } = await validateRequest();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    }
    return Response.json(data);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
