import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const {user: loggedInUser} = await validateRequest();
    if (!loggedInUser) {
      return Response.json({error: "Unauthorized"}, { status: 401 });
    }
    
    const post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      select: {
        likes: {
            where: {
                userId: loggedInUser.id
            },
            select: {
                userId: true
            }
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return new Response(null, { status: 404 });
    }

    const data: LikeInfo = {
        likes: post._count.likes,
        isLikedByUser: post.likes.length > 0
    }
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(postId);
    const like = await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
      create: {
        userId: loggedInUser.id,
        postId,
      },
      update: {},
    });
    
    return Response.json({ success: true, like: like }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.like.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId: params.postId,
      },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

