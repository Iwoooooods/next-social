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
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const Post = ({ postProps }: { postProps: PostData }) => {
  return (
    <article className="group w-full rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex flex-col items-start gap-2">
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
  function extractTags(content: string, regex: RegExp) {
    const matches = content.match(regex) || [];
    return matches;
  }
  return (
    <Dialog>
      <DialogTrigger className="flex w-full flex-col items-center justify-center gap-2">
        <div className="group relative aspect-auto h-72 w-full overflow-hidden">
          <Image
            src={postProps.attachments[0].url}
            alt="media"
            width={9999}
            height={9999}
            className="absolute h-full w-full object-cover"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2">
          {extractTags(postProps.content, /#(\w+)/g).map((tag, index) => (
            <span key={index} className="text-primary">
            {tag}
            </span>
          ))}
        </div>
      </DialogTrigger>
      <DialogContent className="h-[92vh] max-w-[80vw] border-none bg-transparent p-0">
        <PostDetail postProps={postProps} />
      </DialogContent>
    </Dialog>
  );
};

const PostDetail = ({ postProps }: { postProps: PostData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="group relative flex aspect-auto h-full w-full flex-1 flex-col overflow-hidden bg-card">
        <Image
          src={postProps.attachments[currentIndex].url}
          alt="media"
          fill
          className="absolute object-contain"
        />
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1) % postProps.attachments.length,
              )
            }
            className="absolute left-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
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
            className="absolute right-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
          >
            <ArrowRight size={36} />
          </Button>
        )}
        <div className="mb-4 mt-auto flex w-full items-center justify-center gap-1 bg-transparent opacity-0 group-hover:opacity-50">
          {postProps.attachments.map((attachment, index) => (
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
      <div className="flex h-full w-full flex-1 flex-col gap-2 bg-card p-4 text-card-foreground">
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
          <PostMoreButton
            className="ml-auto flex opacity-0 group-hover:opacity-100"
            post={postProps}
          />
        </div>
        <Linkify>
          <p className="w-full whitespace-pre-line break-words p-2 text-start">
            {postProps.content}
          </p>
        </Linkify>
      </div>
    </div>
  );
};
