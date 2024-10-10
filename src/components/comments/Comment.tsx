import { CommentData } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CommentMoreButton } from "./CommentMoreButton";

export default function Comment({ comment }: { comment: CommentData }) {
  return (
    <div className="relative group flex flex-col w-full">
      <CommentMoreButton comment={comment} className="absolute top-0 right-0 group-hover:visible invisible"/>
      <div className="flex w-full items-center justify-start gap-4">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} />
          </Link>
        </UserTooltip>
        <div className="flex flex-col">
          <Link href={`/users/${comment.user.username}`}>
            <span className="font-bold">{comment.user.username}</span>
          </Link>
          <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500">{comment.content}</span>
      </div>
    </div>
  );
}
