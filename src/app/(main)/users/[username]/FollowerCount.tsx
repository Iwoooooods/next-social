"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";

export default function FollowerCount({
  userId,
  initialState,
}: {
  userId: string;
  initialState: FollowerInfo;
}) {
  const { data } = useFollowerInfo(userId, initialState);
  return (
    <p>
      <span className="font-bold">{data?.followers}</span> followers
    </p>
  );
}
