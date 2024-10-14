import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggerInUser } = await validateRequest();

    if (!loggerInUser) {
      return new Response("error: unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        followers: {
          where: {
            followerId: loggerInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return new Response("error: user not found", { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: user.followers.length > 0,
    };

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response("error: " + error, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggerInUser } = await validateRequest();

    if (!loggerInUser) {
      return new Response("error: unauthorized", { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggerInUser.id,
            followingId: params.userId,
          },
        },
        update: {},
        create: {
          followerId: loggerInUser.id,
          followingId: params.userId,
        },
      }),
      ...(params.userId !== loggerInUser.id
        ? [
            prisma.notification.create({
              data: {
                recipientId: params.userId,
                issuerId: loggerInUser.id,
                type: "FOLLOW",
              },
            }),
          ]
        : []),
    ]);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("error: " + error, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggerInUser } = await validateRequest();

    if (!loggerInUser) {
      return new Response("error: unauthorized", { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggerInUser.id,
          followingId: params.userId,
        },
      }),
      ...(params.userId !== loggerInUser.id
        ? [
            prisma.notification.deleteMany({
              where: {
                recipientId: params.userId,
                issuerId: loggerInUser.id,
                type: "FOLLOW",
              },
            }),
          ]
        : []),
    ]);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("error: " + error, { status: 500 });
  }
}
