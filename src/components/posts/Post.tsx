"use client";

import { PostData } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { PostMoreButton } from "./PostMoreButton";
import Linkify from "../Linkify";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
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

const imageWidth = 512;
const textWidth = 384;

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

const DetailDialog = ({ postProps }: { postProps: PostData }) => {
  // function extractTags(content: string, regex: RegExp) {
  //   const matches = content.match(regex) || [];
  //   return matches;
  // }
  return (
    <Dialog>
      <DialogTrigger className="flex w-full flex-col items-center justify-center">
        <div className="group relative aspect-auto h-72 w-full overflow-hidden">
          <Image
            src={postProps.attachments[0].url}
            alt="media"
            fill
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            objectFit="cover"
          />
        </div>
        {/* <div className="flex w-full flex-wrap gap-2">
          {extractTags(postProps.content, /#(\w+)/g).map((tag, index) => (
            <span key={index} className="text-primary">
            {tag}
            </span>
          ))}
        </div> */}
      </DialogTrigger>
      <DialogContent
        className={`border-none bg-card p-0 text-card-foreground`}
        style={{ maxWidth: `${imageWidth + textWidth}px` }}
      >
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
          <DialogDescription>
            See what's happening in the world right now
          </DialogDescription>
        </VisuallyHidden.Root>
        <PostDetail postProps={postProps} />
      </DialogContent>
    </Dialog>
  );
};

const PostDetail = ({ postProps }: { postProps: PostData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="flex items-center justify-center">
      <div
        className={`group relative flex flex-col overflow-hidden bg-card`}
        style={{ width: `${imageWidth}px` }}
      >
        <AspectRatio
          ratio={postProps.mediaRatio ?? 1}
          className="relative h-full w-full"
        >
          <Image
            src={postProps.attachments[currentIndex].url}
            alt="media"
            fill
            objectFit="cover"
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
        className={`relative hidden max-w-sm flex-col gap-2 bg-card p-4 text-card-foreground md:flex`}
        style={{
          width: `${textWidth}px`,
          height: `${imageWidth / (postProps.mediaRatio ?? 1)}px`,
        }}
      >
        <div className="no-scrollbar flex max-h-[calc(100%-110px)] flex-col overflow-y-scroll">
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
          <Comments post={postProps} />
        </div>
        <div className="absolute bottom-0 left-0 flex max-h-36 w-full flex-col gap-1 p-2">
          <div className="flex items-start justify-start gap-2 px-2">
            <LikeButton
              postId={postProps.id}
              initialState={{
                likes: postProps._count.likes,
                isLikedByUser: postProps.likes.some(
                  (like) => like.userId === postProps.user.id,
                ),
              }}
              className="h-[36px] w-[36px] rounded-full p-0"
            />
            <CollectButton
              postId={postProps.id}
              initialState={{
                isCollectedByUser: postProps.collections.some(
                  (collection) => collection.userId === postProps.user.id,
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
