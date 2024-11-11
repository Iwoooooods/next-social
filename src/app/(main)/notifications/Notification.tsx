"use client";

import { NotificationData, NotificationPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { NotificationType } from "@prisma/client";
import { usePost } from "../PostProvider";
import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { PostDetail } from "@/components/posts/Post";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { deleteNotification } from "@/components/notifications/action";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import UserTooltip from "@/components/UserTooltip";

export default function Notification({
  notification,
}: {
  notification: NotificationData;
}) {
  const notificationTypeMap: Record<NotificationType, { message: string }> = {
    FOLLOW: {
      message: `followed you`,
    },
    COMMENT: {
      message: `sent a comment`,
    },
    LIKE: {
      message: `liked your post`,
    },
    COLLECTION: {
      message: `collected your post`,
    },
    MENTION: {
      message: `mentioned you in a post`,
    },
  };
  const { message } = notificationTypeMap[notification.type];
  const { open, onClose, onOpen, postId } = usePost();
  const [post, setPost] = useState<PostData | undefined>();
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: async (deletedNotification) => {
      const queryFilter: QueryFilters = { queryKey: ["notifications"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<NotificationPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          console.log(oldData);

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              notifications: page.notifications.filter(
                (n) => n.id !== deletedNotification.id,
              ),
            })),
          };
        },
      );
      toast({
        description: "Notification deleted",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete notification",
      });
    },
  });

  async function handleClick() {
    if (!notification.postId) return;
    const post = await kyInstance
      .get(`/api/posts/${notification.postId}`)
      .json<PostData>();
    setPost(post);
    onOpen(post.id);
  }

  async function handleNotificationDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!notification.id) return;
    mutate(notification.id);
  }

  return (
    <>
      <div className="flex w-full flex-col items-center px-4">
        <Button
          variant="ghost"
          onClick={handleClick}
          className="block h-fit w-full cursor-pointer justify-start rounded-none px-2 py-0"
          asChild
        >
          <div
            className={cn(
              "relative flex w-full items-center justify-start gap-4 overflow-hidden",
              !notification.read && "bg-primary/10",
            )}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Minus
                size={24}
                className="cursor-pointer"
                onClick={handleNotificationDelete}
              />
            )}
            <UserTooltip user={notification.issuer}>
              <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={48} />
            </UserTooltip>
            <div className="flex h-24 w-full flex-col items-center justify-center">
              <span className="w-full font-bold">
                {notification.issuer.displayName}
              </span>
              <span className="w-full">{message}</span>
            </div>
            {notification.post && (
              <Image
                src={notification.post.attachments[0].url}
                alt="post image"
                width={64}
                height={64}
                className="aspect-square rounded-xl object-cover"
              />
            )}
          </div>
        </Button>
        <hr className="w-full border-t-2 border-border" />

        {post && (
          <Dialog
            open={open && postId === notification.postId}
            onOpenChange={onClose}
          >
            <DialogContent className="z-50 max-w-[896px] overflow-hidden border-none bg-card p-0 text-card-foreground">
              <VisuallyHidden.Root>
                <DialogHeader></DialogHeader>
                <DialogDescription></DialogDescription>
              </VisuallyHidden.Root>
              <PostDetail postProps={post} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
