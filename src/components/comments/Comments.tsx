import { CommentData, CommentPage, PostData } from "@/lib/types";
import Comment from "./Comment";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"; 
import { Loader2 } from "lucide-react";

export default function Comments({ post }: { post: PostData }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/${post.id}/comments`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<CommentPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (firstPage) => firstPage.nextCursor,
    // select: (data) => ({
    //   pages: [...data.pages].reverse(),
    //   pageParams: [...data.pageParams].reverse(),
    // }),
  });
  
  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <InfiniteScrollContainer
        onBottomReached={() => {
          hasNextPage && !isFetching && fetchNextPage();
        }}
    >
      {comments.map((comment: CommentData) => (
        <Comment key={comment.id} comment={comment} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
    </InfiniteScrollContainer>
  );
}
