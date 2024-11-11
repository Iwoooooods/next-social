import { CommentData } from "@/lib/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CommentMoreButton } from "./CommentMoreButton";

export default function Comment({ comment }: { comment: CommentData }) {
  return (
    <div className="group relative flex w-full flex-col">
      <CommentMoreButton
        comment={comment}
        className="invisible absolute right-0 top-0 group-hover:visible"
      />
      <div className="flex w-full items-center justify-start gap-4">
        <UserTooltip user={comment.user}>
          <UserAvatar avatarUrl={comment.user.avatarUrl} />
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
