import { useQuery } from "@tanstack/react-query";
import { FollowerInfo } from "@/lib/types";
import kyInstance from "@/lib/ky";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  return useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });
}
