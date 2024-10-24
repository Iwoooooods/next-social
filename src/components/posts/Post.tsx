"use client";

import { CommentPage, PostData } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { PostMoreButton } from "./PostMoreButton";
import Linkify from "../Linkify";
import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import LikeButton from "./LikeButton";
import CollectButton from "./CollectionButton";
import CommentInput from "@/components/comments/CommentInput";
import Comments from "@/components/comments/Comments";
import { AspectRatio } from "../ui/aspect-ratio";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { usePost } from "@/app/(main)/PostProvider";
import { useSession } from "@/app/(main)/SessionProvider";
import { usePostSize } from "@/app/(main)/PostSizeProvider";
import "./post.module.css";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

export const Post = ({ postProps }: { postProps: PostData }) => {
  return (
    <article className="group w-full overflow-hidden rounded-xl border-2 border-border bg-card pt-4 text-card-foreground outline-2">
      <div className="flex flex-col items-center justify-between gap-2">
        <div className="flex w-full items-center justify-start gap-4 px-4">
          <UserTooltip user={postProps.user}>
            <Link href={`/users/${postProps.user.username}`}>
              <UserAvatar avatarUrl={postProps.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div className="flex flex-col">
            <Link href={`/users/${postProps.user.username}`}>
              <span className="font-bold">{postProps.user.username}</span>
            </Link>
            <span className="text-gray-500">
              {formatDate(postProps.createdAt)}
            </span>
          </div>
          <PostMoreButton
            className="ml-auto flex opacity-0 group-hover:opacity-100"
            post={postProps}
          />
        </div>
        {postProps.attachments.length > 0 && (
          <DetailDialog postProps={postProps} />
        )}
      </div>
    </article>
  );
};

export const DetailDialog = ({ postProps }: { postProps: PostData }) => {
  // function extractTags(content: string, regex: RegExp) {
  //   const matches = content.match(regex) || [];
  //   return matches;
  // }
  const { open, onClose, onOpen, postId } = usePost();
  // const { imageWidth, textEditorWidth } = usePostSize();
  return (
    <>
      <Button className="group relative aspect-auto h-72 w-full overflow-hidden rounded-none">
        <Image
          src={postProps.attachments[0].url}
          alt="media"
          fill
          onClick={() => onOpen(postProps.id)}
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          objectFit="cover"
        />
      </Button>
      <Dialog open={open && postId === postProps.id} onOpenChange={onClose}>
        <DialogContent
          className="border-none bg-card p-0 text-card-foreground overflow-hidden max-w-[478px] md:max-w-[862px]"
          // style={{ maxWidth: `${imageWidth + textEditorWidth}px` }}
        >
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              See what&apos;s happening in the world right now
            </DialogDescription>
          </VisuallyHidden.Root>
          <PostDetail postProps={postProps} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const PostDetail = ({ postProps}: { postProps: PostData}) => { 
  const { user: loggedInUser } = useSession();
  const { imageWidth, textEditorWidth } = usePostSize();
  const [currentIndex, setCurrentIndex] = useState(0);
  // const { pinnedCommentId, setPinnedCommentId } = usePost();
  // const queryClient = useQueryClient();

  // useEffect(() => {
  //   if (pinnedCommentId) {
  //     // Update the query data to pin the comment
    //   queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(['comments', postProps.id], (oldData) => {
    //     if (!oldData) return;

    //     const pinnedComment = oldData.pages.flatMap(page => page.comments).find(comment => comment.id === pinnedCommentId);
        
    //     if (!pinnedComment) return oldData;

    //     const newPages = oldData.pages.map((page, index) => {
    //       if (index === 0) {
    //         return {
    //           ...page,
    //           comments: [pinnedComment, ...page.comments.filter(comment => comment.id !== pinnedCommentId)]
    //         };
    //       }
    //       return {
    //         ...page,
    //         comments: page.comments.filter(comment => comment.id !== pinnedCommentId)
    //       };
    //     });

    //     return {
    //       ...oldData,
    //       pages: newPages
    //     };
    //   });
    // }
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center md:flex-row max-h-[90vh] overflow-hidden rounded-2xl">
      <div
        className={`group relative flex flex-col bg-card`}
        style={{ width: `${imageWidth}px` }}
      >
        <AspectRatio
          ratio={3 / 4}
          className="relative h-full w-full"
        >
          <Image
            src={postProps.attachments[currentIndex].url}
            alt="media"
            fill
            className="object-contain object-center"
          />
        </AspectRatio>
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1) % postProps.attachments.length,
              )
            }
            className="absolute left-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
          >
            <ArrowLeft size={36} />
          </Button>
        )}
        {currentIndex < postProps.attachments.length - 1 && (
          <Button
            variant="ghost"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev + 1) % postProps.attachments.length,
              )
            }
            className="absolute right-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
          >
            <ArrowRight size={36} />
          </Button>
        )}
        <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-1 bg-transparent opacity-0 group-hover:opacity-100">
          {postProps.attachments.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex
                  ? "bg-card-foreground"
                  : "bg-card-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
      <div
        className={`relative flex max-w-sm flex-col gap-2 bg-card p-4 text-card-foreground h-full w-[478px] md:w-[384px]`}
        // style={{
        //   width: `${textEditorWidth}px`,
        //   // height: `${imageWidth / (postProps.mediaRatio ?? 1)}px`,
        // }}
      >
        <div className="no-scrollbar flex flex-col overflow-y-scroll max-h-[calc(100%-96px)]">
          <div className="flex w-full items-center justify-start gap-4">
            <UserTooltip user={postProps.user}>
              <Link href={`/users/${postProps.user.username}`}>
                <UserAvatar avatarUrl={postProps.user.avatarUrl} />
              </Link>
            </UserTooltip>
            <div className="flex flex-col">
              <Link href={`/users/${postProps.user.username}`}>
                <span className="font-bold">{postProps.user.username}</span>
              </Link>
              <span className="text-gray-500">
                {formatDate(postProps.createdAt)}
              </span>
            </div>
            {/* <PostMoreButton className="ml-auto mr-4 flex" post={postProps} /> */}
          </div>
          <Linkify>
            <p className="w-full whitespace-pre-line break-words text-start">
              {postProps.content}
            </p>
          </Linkify>
          <hr className="w-full py-2" />
          <Comments post={postProps}/>
        </div>
        <div className="absolute bottom-0 left-0 flex max-h-36 w-full flex-col gap-1 p-2">
          <div className="flex items-start justify-start gap-2 px-2">
            <LikeButton
              postId={postProps.id}
              initialState={{
                likes: postProps._count.likes,
                isLikedByUser: postProps.likes.some(
                  (like) => like.userId === loggedInUser?.id,
                ),
              }}
              className="h-[36px] w-[36px] rounded-full p-0"
            />
            <CollectButton
              postId={postProps.id}
              initialState={{
                isCollectedByUser: postProps.collections.some(
                  (collection) => collection.userId === loggedInUser?.id,
                ),
              }}
              className="h-[36px] w-[36px] rounded-full p-0"
            />
          </div>
          <CommentInput post={postProps} />
        </div>
      </div>
    </div>
  );
};
