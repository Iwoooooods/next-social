import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  QueryFilters,
} from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserValues } from "@/lib/validation";
import { updateUserProfile } from "./action";

export function useUpdateUserProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async () => {
      const queryFilter: QueryFilters = {
        queryKey: ["user-posts"],
      };

      await queryClient.invalidateQueries(queryFilter);
      router.refresh();

      toast({
        title: "Profile updated",
        description: "Your profile has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
      });
    },
  });

  return mutation;
}
