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
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import LikeButton from "./LikeButton";
import CollectButton from "./CollectionButton";
import CommentInput from "@/components/comments/CommentInput";
import Comments from "@/components/comments/Comments";
import { AspectRatio } from "../ui/aspect-ratio";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { usePost } from "@/app/(main)/PostProvider";
import { usePathname } from "next/navigation";

const imageWidth = Number(process.env.DIALOG_IMAGE_WIDTH ?? "512");
const textWidth = Number(process.env.DIALOG_TEXT_WIDTH ?? "384");

export const Post = ({ postProps }: { postProps: PostData }) => {
  return (
    <>
      <div className="group ml-2 mt-4 inline-block w-[240px] overflow-hidden text-card-foreground outline-2">
        {postProps.attachments.length > 0 && (
          <DetailDialog postProps={postProps} />
        )}
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2">
          <div className="self-start">{postProps.title}</div>
          <div className="flex w-full items-center justify-start gap-2">
            <UserTooltip user={postProps.user}>
              <UserAvatar avatarUrl={postProps.user.avatarUrl} />
            </UserTooltip>
            <div className="flex flex-col text-sm">
              <Link href={`/users/${postProps.user.username}`}>
                <span className="font-bold">{postProps.user.username}</span>
              </Link>
              <span className="text-xs text-gray-500">
                {formatDate(postProps.createdAt)}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Image
                src="/heart-angle.svg"
                alt="heart"
                width={16}
                height={16}
              />
              <span className="text-xs text-gray-500">
                {postProps._count.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const DetailDialog = ({ postProps }: { postProps: PostData }) => {
  const { open, onClose, onOpen, postId } = usePost();
  const pathname = usePathname();
  return (
    <>
      <AspectRatio ratio={3 / 4}>
        <Button className="group relative aspect-auto h-full w-full overflow-hidden rounded-xl">
          <Image
            src={postProps.attachments[0].url}
            alt="media"
            fill
            onClick={() => onOpen(postProps.id)}
            objectFit="cover"
          />
        </Button>
        {pathname === `/users/${postProps.user.username}` && (
          <PostMoreButton
            className="absolute right-2 top-2 flex opacity-0 group-hover:opacity-100"
            post={postProps}
          />
        )}
      </AspectRatio>

      <Dialog open={open && postId === postProps.id} onOpenChange={onClose}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-[896px] overflow-hidden border-none bg-card p-0 text-card-foreground"
        >
          <VisuallyHidden.Root>
            <DialogHeader></DialogHeader>
            <DialogDescription></DialogDescription>
          </VisuallyHidden.Root>
          <PostDetail postProps={postProps} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const PostDetail = ({ postProps }: { postProps: PostData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="flex items-center justify-center">
      <div
        className={`group relative flex flex-col overflow-hidden bg-card`}
        style={{ width: `${imageWidth}px` }}
      >
        <div className="relative h-full w-full">
          <Image
            src={postProps.attachments[currentIndex].url}
            alt="media"
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full"
            priority
          />
        </div>
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
          height: `${imageWidth / (3 / 4)}px`,
        }}
      >
        <div className="no-scrollbar flex max-h-[calc(100%-110px)] flex-col gap-2 overflow-y-scroll">
          <div className="flex w-full items-center justify-start gap-4">
            <UserAvatar avatarUrl={postProps.user.avatarUrl} />
            <div className="flex flex-col">
              <Link href={`/users/${postProps.user.username}`}>
                <span className="font-bold">{postProps.user.username}</span>
              </Link>
              <span className="text-gray-500">
                {formatDate(postProps.createdAt)}
              </span>
            </div>
          </div>
          <Linkify>
            <h1 className="text-lg font-bold">{postProps.title}</h1>
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
