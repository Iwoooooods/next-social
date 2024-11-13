import { PostData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Minus, Plus, Scissors } from "lucide-react";
import Image from "next/image";
import { useState, useRef, RefObject, useEffect } from "react";
import MediaCropper from "@/components/posts/editor/MediaCropper";
import { EditorContent } from "@tiptap/react";
import { ReactCropperElement } from "react-cropper";
import { Editor } from "@tiptap/react";
import { useSession } from "@/app/(main)/SessionProvider";
import { Input } from "@/components/ui/input";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSavePostMutation } from "@/components/post-edit/mutation";
import LoadingButton from "@/components/LoadingButton";
import "@/assets/css/styles.css";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function PostEditDialog({
  post,
  open,
  onClose,
}: {
  post: PostData;
  open: boolean;
  onClose: () => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    autofocus: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>(
    post.attachments.map((attachment) => {
      return new File(
        [attachment.url], // Using URL as minimal blob data
        attachment.url.split("/").pop() || "image.jpg",
        {
          type: "image/jpeg",
          lastModified: new Date().getTime(),
        },
      );
    }),
  );

  const mutation = useSavePostMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const input = editor?.getText({ blockSeparator: "\n" }) || "";
  const title = titleRef.current?.value || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function initializeAttachments(post: PostData) {
      const files = await Promise.all(
        post.attachments.map(async (attachment) => {
          const response = await fetch(attachment.url);
          const blob = await response.blob();
          return new File(
            [blob],
            attachment.url.split("/").pop() || "image.jpg",
            {
              type: response.headers.get("content-type") || "image/jpeg",
            },
          );
        }),
      );
      setAttachments(files);
    }

    if (post) {
      initializeAttachments(post);
      editor?.commands.setContent(post.content);
    }
  }, [post, open]);

  function crop() {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        const newFile = new File([blob], attachments[currentIndex].name, {
          type: "image/jpeg",
        });
        setAttachments((prev) =>
          prev.map((attachment, index) =>
            index === currentIndex ? newFile : attachment,
          ),
        );
      }
    }, "image/jpeg");
    dialogCloseRef.current?.click();
  }

  async function handlePostSaved() {
    try {
      setIsLoading(true);
      const mediaIds = await Promise.all(
        attachments.map(async (attachment) => {
          const resp = await fetch(
            `/api/file-upload/medias?fileName=${attachment.name}`,
            {
              method: "POST",
              body: attachment,
            },
          );
          return (await resp.json()).id;
        }),
      );

      mutation.mutate(
        {
          postId: post.id,
          content: input,
          title,
          mediaIds,
        },
        {
          onSuccess: async () => {
            onClose();
            editor?.commands.clearContent();
            setAttachments([]);
            setIsLoading(false);

            await Promise.all([
              queryClient.refetchQueries({
                queryKey: ["user-posts", post.user.id],
              }),
              post.attachments.map((attachment) =>
                fetch(
                  `/api/file-upload/media-delete?url=${encodeURIComponent(
                    attachment.url,
                  )}`,
                  { method: "DELETE" },
                ).catch((error) => {
                  throw error;
                }),
              ),
            ]);
          },
        },
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileSelected = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    if (filesArray.some((file) => file.size > 4.5 * 1024 * 1024)) {
      toast({
        title: "Error",
        description: "Image size must be less than 4.5MB",
        variant: "destructive",
      });
      return;
    }

    setAttachments((prev) => [...prev, ...filesArray]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-h-[512px] max-w-[896px] overflow-hidden bg-card p-0 text-card-foreground">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
        </VisuallyHidden.Root>
        <div className="flex items-center justify-center">
          <div
            className={`group relative flex w-[512px] flex-col overflow-hidden bg-card`}
          >
            <div className="relative h-full w-full">
              <Image
                src={
                  attachments[currentIndex]
                    ? URL.createObjectURL(attachments[currentIndex])
                    : "/placeholder.jpg"
                }
                alt="media-preview"
                width={0}
                height={0}
                sizes="100vw"
                className="h-auto w-full"
                priority
              />
            </div>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1) % attachments.length)
                }
                className="absolute left-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
              >
                <ArrowLeft size={36} />
              </Button>
            )}
            {currentIndex < attachments.length - 1 && (
              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % attachments.length)
                }
                className="absolute right-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
              >
                <ArrowRight size={36} />
              </Button>
            )}
            <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-1 bg-transparent opacity-0 group-hover:opacity-100">
              {attachments.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex
                      ? "bg-card-foreground"
                      : "bg-card-foreground/30"
                  }`}
                />
              ))}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelected(e.target.files)}
              className="sr-only hidden"
            />
            <Button
              variant="ghost"
              className="absolute bottom-4 right-4 size-9 p-0"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
            >
              <Plus size={24} />
            </Button>
            {attachments.length === 1 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute bottom-4 left-4 size-9 p-0"
                  >
                    <Minus size={24} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Images</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Are you sure you want to reset all images? This will reset
                    all images to the original ones.
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setAttachments((prev) =>
                          prev.filter((_, index) => index !== currentIndex),
                        );
                        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
                      }}
                    >
                      Reset
                    </Button>
                    <DialogClose ref={dialogCloseRef} asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {attachments.length > 1 && (
              <Button
                variant="ghost"
                className="absolute bottom-4 left-4 size-9 p-0"
                onClick={() => {
                  setAttachments((prev) =>
                    prev.filter((_, index) => index !== currentIndex),
                  );
                  setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
                }}
              >
                <Minus size={24} />
              </Button>
            )}
            {attachments[currentIndex] && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 p-0"
                  >
                    <Scissors size={24} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crop image</DialogTitle>
                  </DialogHeader>
                  <MediaCropper
                    src={URL.createObjectURL(attachments[currentIndex])}
                    cropperRef={cropperRef}
                  />
                  <DialogFooter>
                    <Button onClick={() => crop()}>Crop</Button>
                    <DialogClose ref={dialogCloseRef} asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="relative hidden h-full w-[384px] max-w-sm flex-col gap-2 bg-card p-4 text-card-foreground md:flex">
            <TextEditor
              editor={editor}
              titleRef={titleRef}
              initialTitle={post.title}
            />
            <LoadingButton
              disabled={!input || !title || attachments.length === 0}
              loading={isLoading}
              variant="outline"
              onClick={handlePostSaved}
              className="absolute bottom-6 right-6"
            >
              Save
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TextEditor({
  editor,
  titleRef,
  initialTitle,
}: {
  editor: Editor | null;
  titleRef: RefObject<HTMLInputElement>;
  initialTitle: string;
}) {
  const { user } = useSession();

  return (
    <div className="relative h-full w-full max-w-sm border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex items-center">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          className="mr-4 hidden sm:inline"
        />
      </div>
      <Input
        ref={titleRef}
        value={initialTitle}
        placeholder="Title Here..."
        className="rounded-none border-none bg-transparent px-2 py-1 text-lg"
      />
      <EditorContent
        editor={editor}
        className={`h-full max-h-full w-full overflow-y-auto rounded-md bg-transparent px-2 py-1`}
      />
    </div>
  );
}
