"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import "react-loading-skeleton/dist/skeleton.css";
import { Post } from "@/components/posts/Post";
import { PostData, PostPage } from "@/lib/types";
import { Loader2 } from "lucide-react";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { PostSkeleton } from "@/components/posts/PostSkeleton";
export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/for-you`,
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

