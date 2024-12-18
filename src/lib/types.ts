import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    createdAt: true,
    bio: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        followers: true,
        following: true,
        posts: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: {
      orderBy: {
        order: "asc",
      },
    },
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    collections: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface CollectionInfo {
  isCollectedByUser: boolean;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    post: {
      select: {
        userId: true,
      },
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentPage {
  comments: CommentData[];
  nextCursor: string | null;
}

export function getNotificationInclude(loggedInUserId: string) {
  return {
    issuer: {
      select: getUserDataSelect(loggedInUserId),
    },
    post: {
      select: {
        content: true,
        attachments: true,
      },
    },
  } satisfies Prisma.NotificationInclude;
}

export type NotificationData = Prisma.NotificationGetPayload<{
  include: ReturnType<typeof getNotificationInclude>;
}>;

export interface NotificationPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface NotificationCount {
  unread: number;
}
