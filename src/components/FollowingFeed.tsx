"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Post } from "@/components/posts/Post";
import { PostData, PostPage } from "@/lib/types";
import { Loader2 } from "lucide-react";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";

export default function FollowingFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/following`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") return <PostSkeleton />;
  if (status === "success" && !hasNextPage && posts.length === 0)
    return (
      <div className="text-center text-muted-foreground">No posts found</div>
    );
  if (status === "error")
    return <div>An error occurred while fetching posts</div>;

  return (
    <>
      <InfiniteScrollContainer
        onBottomReached={() => {
          console.log("hasNextPage", hasNextPage);
          hasNextPage && !isFetching && fetchNextPage();
        }}
      >
        {posts.map((post: PostData) => (
          <Post key={post.id} postProps={post} />
        ))}
        {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
      </InfiniteScrollContainer>
    </>
  );
}

const PostSkeleton = () => {
  return (
    <div className="mt-4 w-full rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton
            circle
            containerClassName="w-9 h-9"
            className="h-full w-full"
          />
          <Skeleton
            containerClassName="w-36 h-9"
            className="h-full w-full rounded-xl"
          />
        </div>
        <Skeleton className="max-h-32 w-full overflow-y-auto rounded-xl bg-background p-4" />
      </div>
    </div>
  );
};