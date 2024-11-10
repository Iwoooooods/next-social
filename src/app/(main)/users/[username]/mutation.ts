import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { UpdateUserValues } from "@/lib/validation";
import { updateUserProfile } from "./action";
import { useRouter } from "next/navigation";

export function useUpdateUserProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserValues;
      avatar?: File;
    }) => {
      const resp =
        avatar &&
        (await fetch(`/api/file-upload/avatar?fileName=${avatar.name}`, {
          method: "POST",
          body: avatar,
        }));
      const avatarUrl = (await resp?.json())?.url;

      return updateUserProfile({ ...values, avatarUrl });
    },
    onSuccess: async () => {
      router.refresh();

      toast({
        title: "Profile updated",
        description: "Your profile has been updated",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
      });
    },
  });

  return mutation;
}
