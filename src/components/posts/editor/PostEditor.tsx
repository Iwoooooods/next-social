"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { EditorContent } from "@tiptap/react";
import React from "react";
import { useSubmitPostMutation } from "./mutation";
import "./styles.css";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { Attachment } from "@/hooks/useMediaUpload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";
import { useRef } from "react";
import { deleteAttachment } from "./action";

export const PostEditor = React.memo(() => {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const {
    attachments,
    startUpload,
    removeAttachment,
    reset: resetMediaUpload,
    uploadProgress,
    isUploading,
  } = useMediaUpload();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
  });

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  const onSubmit = async () => {
    console.log("onSubmit", attachments);
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments
          .map((attachment) => attachment.mediaId)
          .filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUpload();
        },
      },
    );
  };

  const handleRemoveAttachment = async (fileName: string, url?: string) => {
    if (!url) return;
    const urlFileName = url.split(`/f/`)[1];
    removeAttachment(fileName);
    await deleteAttachment(urlFileName);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(event.clipboardData.items)
    .filter(item => item.kind === "file")
    .map((item) => item.getAsFile()) as File[];
    startUpload(files);
    // console.log(files);
  };

  return (
    <div className="w-full space-y-4 rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex w-full">
        <div className="flex items-center">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            className="mr-4 hidden sm:inline"
          />
        </div>
        <EditorContent
          editor={editor}
          onPaste={handlePaste}
          className="max-h-32 w-full overflow-y-auto rounded-md bg-background p-4"
        />
      </div>
      {attachments.length > 0 && (
        <div className={cn("flex gap-2 p-2 flex-wrap")}>
          {attachments.map((attachment: Attachment) => (
            <AttachmentPreview
              attachment={attachment}
              removeAttachment={handleRemoveAttachment}
            />
          ))}
        </div>
      )}
      <div className="mt-2 flex w-full items-center justify-end">
        <LoadingButton
          variant="outline"
          loading={mutation.isPending}
          onClick={onSubmit}
          size="sm"
          disabled={input.trim().length === 0 || isUploading}
        >
          Post
        </LoadingButton>
        <AttachmentButton onFileSelected={startUpload} disabled={isUploading} />
      </div>
    </div>
  );
});

const AttachmentPreview = ({
  attachment,
  removeAttachment,
}: {
  attachment: Attachment;
  removeAttachment: (fileName: string, url?: string) => void;
}) => {
  const src = URL.createObjectURL(attachment.file);
  return (
    <div className="relative w-fit">
      {attachment.file.type.startsWith("image") ? (
        <div className="w-36 h-36 overflow-hidden relative">
          <Image
            src={src}
            alt="Attachment"
            width={9999}
            height={9999}
            className={cn("absolute w-full h-full object-cover", attachment.isUploading && "opacity-50")}
          />
        </div>
      ) : (
        <video controls className="h-full w-full">
          <source src={src} type={attachment.file.type} />
        </video>
      )}
      {attachment.isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => removeAttachment(attachment.file.name, attachment.url)}
          className="absolute right-0 top-0 h-fit w-fit p-0 hover:bg-transparent"
        >
          <X size={24} />
        </Button>
      )}
    </div>
  );
};

const AttachmentButton = ({
  onFileSelected,
  disabled,
}: {
  onFileSelected: (files: File[]) => void;
  disabled: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        type="file"
        accept="image/*,video/*"
        ref={inputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            onFileSelected(files);
            e.target.value = "";
          }
        }}
        className="sr-only hidden"
      />
      <LoadingButton
        variant="ghost"
        disabled={disabled}
        loading={disabled}
        onClick={() => inputRef.current?.click()}
        className="hover:bg-transparent"
      >
        <Plus size={24} />
      </LoadingButton>
    </div>
  );
};
