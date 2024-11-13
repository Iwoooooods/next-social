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
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Minus, Plus, Scissors } from "lucide-react";
import Image from "next/image";
import { useState, useRef, RefObject } from "react";
import MediaCropper from "./MediaCropper";
import { EditorContent } from "@tiptap/react";
import { ReactCropperElement } from "react-cropper";
import { Editor } from "@tiptap/react";
import { useSession } from "@/app/(main)/SessionProvider";
import { Input } from "@/components/ui/input";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSubmitPostMutation } from "@/components/posts/editor/mutation";
import LoadingButton from "@/components/LoadingButton";
import "@/assets/css/styles.css";

export default function PostPreview({
  attachments,
  fileInputRef,
  setAttachments,
}: {
  attachments: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
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

  const mutation = useSubmitPostMutation();

  const titleRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const input = editor?.getText({ blockSeparator: "\n" }) || "";
  const title = titleRef.current?.value || "";

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

  async function handlePostSubmit() {
    setIsLoading(true);
    const mediaIds: string[] = [];
    for (const attachment of attachments) {
      const resp = await fetch(
        `/api/file-upload/medias?fileName=${attachment.name}`,
        {
          method: "POST",
          body: attachment,
        },
      );
      mediaIds.push((await resp.json()).id);
    }
    mutation.mutate(
      {
        content: input,
        title,
        mediaIds,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setAttachments([]);
          titleRef.current!.value = "";
          setIsLoading(false);
          dialogCloseRef.current?.click();
        },
      },
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`group relative flex w-[512px] flex-col overflow-hidden bg-card`}
      >
        <div className="relative h-full w-full">
          <Image
            src={URL.createObjectURL(attachments[currentIndex])}
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
      </div>
      <div className="relative hidden h-full w-[384px] max-w-sm flex-col gap-2 bg-card p-4 text-card-foreground md:flex">
        <TextEditor editor={editor} titleRef={titleRef} />
        <LoadingButton
          disabled={!input || !title || attachments.length === 0}
          loading={isLoading}
          variant="outline"
          onClick={handlePostSubmit}
          className="absolute bottom-6 right-6"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

function TextEditor({
  editor,
  titleRef,
}: {
  editor: Editor | null;
  titleRef: RefObject<HTMLInputElement>;
}) {
  const { user } = useSession();

  return (
    <div className="relative h-full w-full max-w-sm bg-card p-4 text-card-foreground">
      <div className="flex items-center">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          className="mr-4 hidden sm:inline"
        />
      </div>
      <Input
        ref={titleRef}
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
