"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Notification from "./Notification";
import kyInstance from "@/lib/ky";
import { NotificationPage } from "@/lib/types";
import { useEffect } from "react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch(`/api/notifications/mark-as-read`),
    onSuccess: () => {
      // queryClient.invalidateQueries({queryKey: ["notifications"]});
      queryClient.setQueryData(["unread-notifications"], {
        unread: 0,
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") return <NotificationSkeleton />;
  if (status === "success" && !hasNextPage && notifications.length === 0)
    return (
      <div className="text-center text-muted-foreground">
        No notifications found
      </div>
    );
  if (status === "error")
    return <div>An error occurred while fetching notifications</div>;

  return (
    <>
      <InfiniteScrollContainer
        onBottomReached={() => {
          hasNextPage && !isFetching && fetchNextPage();
        }}
        className="max-w-64 gap-0 border-r-2 border-border bg-card text-card-foreground outline-2"
      >
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
        {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
      </InfiniteScrollContainer>
    </>
  );
}

function NotificationSkeleton() {
  return (
    <div className="border-r-2 border-border bg-card text-card-foreground outline-2">
      <div className="flex max-h-24 w-full max-w-64 flex-col gap-2 px-4 py-2">
        <div className="flex h-1/2 w-full items-center gap-2">
          <Skeleton className="h-9 w-9 bg-background" />
          <Skeleton className="h-9 w-36 rounded-xl bg-background" />
        </div>
        <Skeleton className="max-h-32 w-full overflow-y-auto rounded-xl bg-background p-4" />
      </div>
    </div>
  );
}
