"use client";

import { formatDate } from "date-fns";
import { FollowerInfo, UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "./FollowerCount";
import { useSession } from "../../SessionProvider";
import EditProfileButton from "./EditProfileButton";
import Linkify from "@/components/Linkify";

export default function UserProfile({
  user,
  loggedInUserId,
}: {
  user: UserData;
  loggedInUserId: string;
}) {
  const { user: loggedInUser } = useSession();

  const followerInfo: FollowerInfo = {
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInUserId,
    ),
    followers: user._count.followers,
  };

  return (
    <div className="flex h-fit w-full items-center justify-center gap-4 rounded-xl border-2 border-border bg-card p-4 text-card-foreground">
      <div className="py-16 pr-16">
        <UserAvatar avatarUrl={user.avatarUrl} size={96} />
      </div>
      <div className="flex min-w-72 flex-col items-start gap-2">
        <div className="flex w-full items-center">
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          {loggedInUser?.id === user.id ? (
            <EditProfileButton user={user} className="ml-auto" />
          ) : (
            <FollowButton
              userId={user.id}
              initialState={followerInfo}
              className="ml-auto"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <FollowerCount userId={user.id} initialState={followerInfo} />
          <p>
            <span className="font-bold">{user._count.following}</span> following
          </p>
          <p>
            <span className="font-bold">{user._count.posts}</span> posts
          </p>
        </div>
        <p>member since {formatDate(new Date(user.createdAt), "MMM d yyyy")}</p>
        <hr className="w-full" />
        <Linkify>
          {user.bio && <div className="whitespace-pre-wrap">{user.bio}</div>}
        </Linkify>
      </div>
    </div>
  );
}
