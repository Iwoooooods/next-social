import { PostData } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { PostMoreButton } from "./PostMoreButton";
import Linkify from "../Linkify";

export const Post = ({ postProps }: { postProps: PostData }) => {
  return (
    <article className="w-full rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2 group">
      <div className="flex flex-col items-start">
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
          <PostMoreButton className="ml-auto flex opacity-0 group-hover:opacity-100" post={postProps} />
        </div>
        <Linkify>
          <p className="p-4 whitespace-pre-line break-words">{postProps.content}</p>
        </Linkify>
      </div>
    </article>
  );
};
