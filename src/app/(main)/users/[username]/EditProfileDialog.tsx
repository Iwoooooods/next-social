import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UpdateUserValues, updateUserSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Resizer from "react-image-file-resizer";
import CropImageDialog from "./CropImageDialog";
import { useUpdateUserProfileMutation } from "./mutation";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedAvatarUrl, setCroppedAvatarUrl] = useState<string | null>(null);

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
    },
  });

  const mutation = useUpdateUserProfileMutation();

  async function onSubmit(values: UpdateUserValues) {
    const newAvatarUrl = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`)
      : undefined;

    mutation.mutate(
      { values, avatar: newAvatarUrl },
      {
        onSuccess: () => {
          handleDialogClose(false);
        },
      },
    );
  }

  const handleDialogClose = (open: boolean) => {
    setCroppedAvatar(null);
    setCroppedAvatarUrl(null);
    form.reset();
    onOpenChange(open);
  };

  useEffect(() => {
    if (croppedAvatar) {
      setCroppedAvatarUrl(URL.createObjectURL(croppedAvatar));

      return () => {
        if (croppedAvatarUrl) {
          URL.revokeObjectURL(croppedAvatarUrl);
        }
        setCroppedAvatarUrl(null);
      };
    }
  }, [croppedAvatar, croppedAvatarUrl]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div>
          <AvatarUploader
            src={croppedAvatarUrl || user.avatarUrl || "/default-avatar.png"}
            handleImageCropped={setCroppedAvatar}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Give a short bio about yourself"
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton
                variant={"outline"}
                loading={mutation.isPending}
                type="submit"
              >
                Save
              </LoadingButton>
              <Button
                type="button"
                variant={"ghost"}
                onClick={() => handleDialogClose(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AvatarUploader({
  src,
  handleImageCropped,
}: {
  src: string;
  handleImageCropped: (blob: Blob | null) => void;
}) {
  const { toast } = useToast();
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageSelected = (image: File | undefined) => {
    if (!image) return;

    if (image.size > 4.5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 4.5MB",
        variant: "destructive",
      });
      return;
    }

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => {
        setImageToCrop(uri as File);
      },
      "file",
    );
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => handleImageSelected(e.target.files?.[0])}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="preview"
          width={96}
          height={96}
          className="rounded-full group-hover:opacity-80"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-20 text-white transition-colors duration-200 group-hover:bg-opacity-10">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCrop={handleImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}
