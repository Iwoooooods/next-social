"use client";

import { Button } from "@/components/ui/button";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useQueryClient, useMutation } from "@tanstack/react-query";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
  className?: string;
}

export default function FollowButton({
  userId,
  initialState,
  className,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClinet = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];
  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`);
    },
    onMutate: async () => {
      queryClinet.cancelQueries({ queryKey });
      const previousData = queryClinet.getQueryData<FollowerInfo>(queryKey);
      queryClinet.setQueryData<FollowerInfo>(queryKey, () => {
        return {
          followers:
            (previousData?.followers || 0) + (data.isFollowedByUser ? -1 : 1),
          isFollowedByUser: !previousData?.isFollowedByUser,
        };
      });
      return { previousData };
    },
    onError: (error, _, context) => {
      queryClinet.setQueryData(queryKey, context?.previousData);
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => mutate()}
      className={cn("hover:bg-transparent", className)}
    >
      {data.isFollowedByUser ? (
        <Heart color="#ff8585" fill="#ff8585" />
      ) : (
        <Heart />
      )}
    </Button>
  );
}
