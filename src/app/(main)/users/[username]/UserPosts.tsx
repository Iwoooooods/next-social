"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { PostPage } from "@/lib/types";
import { PostSkeleton } from "@/components/posts/PostSkeleton";
import { Post } from "@/components/posts/Post";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";

export default function UserPosts({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
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
    <InfiniteScrollContainer
      onBottomReached={() => {
        hasNextPage && !isFetching && fetchNextPage();
      }}
      className="grid grid-cols-2 content-start gap-4 md:grid-cols-3 lg:grid-cols-4"
    >
      {posts.map((post) => (
        <Post key={post.id} postProps={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
    </InfiniteScrollContainer>
  );
}
