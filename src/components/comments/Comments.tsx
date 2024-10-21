import { CommentData, CommentPage, PostData } from "@/lib/types";
import Comment from "./Comment";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { usePost } from "@/app/(main)/PostProvider";

// Main component for displaying comments
export default function Comments({ post }: { post: PostData }) {
  // Get the pinnedCommentId from the PostProvider context
  const { pinnedCommentId } = usePost();
  const queryClient = useQueryClient();

  // Set up infinite query for fetching comments
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
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
      staleTime: Infinity,
    });

  // Effect to handle pinned comment and sorting
  useEffect(() => {
    queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
      ["comments", post.id],
      (oldData) => {
        if (!oldData) return oldData;

        if (pinnedCommentId) {
          // Find the pinned comment
          const pinnedComment = oldData.pages
            .flatMap((page) => page.comments)
            .find((comment) => comment.id === pinnedCommentId);

          if (!pinnedComment) return oldData;

          // Reorder comments to put pinned comment first
          const newPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                comments: [
                  pinnedComment,
                  ...page.comments.filter(
                    (comment) => comment.id !== pinnedCommentId,
                  ),
                ],
              };
            }
            return {
              ...page,
              comments: page.comments.filter(
                (comment) => comment.id !== pinnedCommentId,
              ),
            };
          });

          return {
            ...oldData,
            pages: newPages,
          };
        } else {
          // Restore original sorting (by creation time, newest first)
          const allComments = oldData.pages.flatMap((page) => page.comments);
          const sortedComments = allComments.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          const newPages = [
            {
              comments: sortedComments,
              nextCursor: oldData.pages[oldData.pages.length - 1].nextCursor,
            },
          ];

          return {
            ...oldData,
            pages: newPages,
          };
        }
      },
    );
  }, [pinnedCommentId, post.id, queryClient, data]);

  // Flatten comments from all pages
  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <InfiniteScrollContainer
      onBottomReached={() => {
        // Fetch next page when scrolling to bottom
        hasNextPage && !isFetching && fetchNextPage();
      }}
    >
      {/* Render individual comments */}
      {comments.map((comment: CommentData) => (
        <Comment key={comment.id} comment={comment} />
      ))}
      {/* Show loading indicator when fetching next page */}
      {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
    </InfiniteScrollContainer>
  );
}
