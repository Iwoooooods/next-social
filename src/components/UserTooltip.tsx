"use client";

import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { PropsWithChildren } from "react";
import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import FollowButton from "./FollowButton";
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo } from "@/lib/types";
import Link from "next/link";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ user, children }: UserTooltipProps) {
  const { user: loggedInUser } = useSession();

  const followerState: FollowerInfo = {
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInUser.id,
    ),
    followers: user._count.followers,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col gap-2 p-2">
            <div className="flex w-full items-center gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar avatarUrl={user.avatarUrl} size={48} />
              </Link>
              <div>
                <Link href={`/users/${user.username}`}>
                  <h3>{user.displayName}</h3>
                </Link>
                <Link href={`/users/${user.username}`}>
                  <p className="hover:underline">@{user.username}</p>
                </Link>
              </div>
              {user.id !== loggedInUser.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
