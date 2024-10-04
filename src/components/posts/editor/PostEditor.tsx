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
import useMediaUpload from "@/hooks/useMediaUpload";
import { Attachment } from "@/hooks/useMediaUpload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";
import { useRef } from "react";

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
          className="max-h-32 w-full overflow-y-auto rounded-md bg-background p-4"
        />
      </div>
      {attachments.length > 0 && (
        <div className={cn("flex gap-2 p-2")}>
          {attachments.map((attachment: Attachment) => (
            <AttachmentPreview
              key={attachment.file.name}
              attachment={attachment}
              removeAttachment={removeAttachment}
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
  key,
  attachment,
  removeAttachment,
}: {
  key: string;
  attachment: Attachment;
  removeAttachment: (mediaId: string) => void;
}) => {
  const src = URL.createObjectURL(attachment.file);
  return (
    <div className="relative w-fit" key={key}>
      {attachment.file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment"
          width={100}
          height={100}
          className={cn(
            "relative",
            attachment.isUploading && "opacity-50",
          )}
        />
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
          onClick={() => removeAttachment(attachment.file.name)}
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
