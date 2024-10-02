import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { validateRequest } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import FollowButton from "@/components/FollowButton";

export const TrendsSidebar = async () => {
  return (
    <div className="sticky top-20 hidden h-full w-fit min-w-96 flex-col gap-4 rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2 lg:flex">
      <Suspense fallback={<TrendingTopicsSkeleton />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
};

const WhoToFollow = async () => {
  const { user } = await validateRequest();
  if (!user) {
    return null;
  }
  const userToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <h1 className="text-lg font-bold">Who to follow</h1>
      {userToFollow.map((user) => (
        <div
          key={user.id}
          className="flex w-full items-center justify-start gap-4 rounded-xl border-2 border-border p-4"
        >
          <UserAvatar avatarUrl={user.avatarUrl} />
          <Link
            href={`/users/${user.username}`}
            className="flex w-full flex-col items-start justify-start"
          >
            <h2 className="text-lg font-bold hover:underline">
              {user.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">"description"</p>
          </Link>
          <FollowButton userId={user.id} initialState={
            {
              isFollowedByUser: user.followers.some((follower) => follower.followerId === user.id),
              followers: user._count.followers,
            }
          } />
        </div>
      ))}
    </div>
  );
};

const getTrendingTopics = unstable_cache(async () => {
  const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
          SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
          FROM posts
          GROUP BY (hashtag)
          ORDER BY count DESC, hashtag ASC
          LIMIT 5
      `;

  return result.map((row) => ({
    hashtag: row.hashtag,
    count: Number(row.count),
  }));
}, ["trending-topics"], { revalidate: 3 * 60 * 60});

const TrendingTopics = async () => {
  const trendingTopics = await getTrendingTopics();
  return (
    <div className="flex flex-col items-start justify-start gap-4">
      <h1 className="text-lg font-bold">Trending topics</h1>
      {trendingTopics.map(({hashtag, count}) => (
        <div key={hashtag} className="flex w-full items-center justify-start gap-4 rounded-xl border-2 border-border p-4">
          <h2 className="text-lg font-bold hover:underline">{hashtag}</h2>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "post" : "posts"}
          </p>
        </div>
      ))}
    </div>
  );
};

const TrendingTopicsSkeleton = () => {
  return (
    <div className="flex w-full flex-col rounded-xl">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
