"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { PostPage, PostData } from "@/lib/types";
import { PostSkeleton } from "@/components/posts/PostSkeleton";
import { Post } from "@/components/posts/Post";

export default function Collects() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["collects"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/collected",
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
      <div className="text-center text-muted-foreground">No collects found</div>
    );
  if (status === "error")
    return <div>An error occurred while fetching posts</div>;

  return (
    <>
      <InfiniteScrollContainer
        onBottomReached={() => {
          hasNextPage && !isFetching && fetchNextPage();
        }}
        className="grid grid-cols-2 content-start gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {posts.map((post: PostData) => (
          <Post key={post.id} postProps={post} />
        ))}
        {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
      </InfiniteScrollContainer>
    </>
  );
}
