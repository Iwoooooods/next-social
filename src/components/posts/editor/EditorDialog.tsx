"use client";

import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SquarePen, ArrowLeft, ArrowRight, X, Plus } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useMediaUpload, { Attachment } from "@/hooks/useMediaUpload";
import { useEffect, useRef, useCallback } from "react";
import LoadingButton from "@/components/LoadingButton";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DialogDescription } from "@/components/ui/dialog";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent } from "@tiptap/react";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { useSubmitPostMutation } from "./mutation";
import { Dispatch, SetStateAction, memo, RefObject } from "react";

export default function EditorDialog() {
  const [open, setOpen] = useState(false);

  const mediaUploader = useMediaUpload();

  const onFileSelected = (files: File[]) => {
    mediaUploader.setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({ file, isUploading: false })),
    ]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          mediaUploader.reset();
        }
      }}
    >
      <DialogTrigger className="flex w-full items-center rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground">
        <SquarePen className="h-6 w-6" />
        <span className="ml-2 hidden text-sm font-medium lg:inline">
          Create
        </span>
      </DialogTrigger>
      <DialogContent
        className={`flex flex-col items-center gap-2 overflow-hidden border-none bg-card p-0 text-card-foreground`}
      >
        <DialogHeader className="p-4">
          <DialogTitle className="text-center">Create a new post</DialogTitle>
          <DialogDescription className="text-center">
            What's on your mind?
          </DialogDescription>
        </DialogHeader>
        {mediaUploader.attachments.length === 0 ? (
          <MediaPicker onFileSelected={onFileSelected} />
        ) : (
          <MediaPreview
            uploader={mediaUploader}
            onFileSelected={onFileSelected}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface MediaPickerProps {
  onFileSelected: (files: File[]) => void;
}

function MediaPicker({ onFileSelected }: MediaPickerProps) {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 px-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
      <p className="text-lg text-muted-foreground">
        Drag and drop your images here
      </p>
      <AttachmentButton onFileSelected={onFileSelected} disabled={false}>
        <span className="text-sm">Select from PC</span>
      </AttachmentButton>
    </div>
  );
}

function MediaPreview({
  uploader,
  onFileSelected,
}: {
  uploader: ReturnType<typeof useMediaUpload>;
  onFileSelected: (files: File[]) => void;
}) {
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const width = 512;
  const [showContinueButton, setShowContinueButton] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cropperRef = useRef<ReactCropperElement>(null);

  async function handleContinue() {
    crop(currentIndex);
    // await uploader.startUpload(
    //   uploader.attachments.map((attachment) => attachment.file),
    // );
    setShowContinueButton(false);
    setTextEditorOpen(true);
  }

  function crop(index: number) {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        const newFile = new File(
          [blob],
          uploader.attachments[index].file.name,
          {
            type: "image/jpeg",
          },
        );
        uploader.setAttachments((prev: Attachment[]) =>
          prev.map((attachment, i) =>
            i === index ? { ...attachment, file: newFile } : attachment,
          ),
        );
      }
    }, "image/jpeg");
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden">
      <div className="left-0 top-[-36px] flex w-full items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            uploader.reset();
          }}
          className="w-fit p-0 hover:bg-transparent"
        >
          <ArrowLeft size={24} />
          <span className="text-sm">back</span>
        </Button>
        {(showContinueButton || uploader.isUploading) && (
          <LoadingButton
            loading={uploader.isUploading}
            onClick={handleContinue}
            variant="ghost"
            className="w-fit p-0 hover:bg-transparent"
          >
            <span className="text-sm">continue</span>
            <ArrowRight size={24} />
          </LoadingButton>
        )}
      </div>
      <div
        className={`group relative flex h-[${width * aspectRatio}px] w-[${width}px] flex-col overflow-hidden`}
      >
        <div className={`relative flex h-[${width * aspectRatio}px] w-[${width}px] items-center`}>
          {uploader.attachments.map((attachment, index) => (
            <div key={index} className="inset-0 transition-opacity duration-300 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}">
              <MemoCropper
                src={URL.createObjectURL(attachment.file)}
                cropperRef={cropperRef}
              />
            </div>
          ))}
          <Button onClick={() => setCurrentIndex((currentIndex - 1 + uploader.attachments.length) % uploader.attachments.length)} className="absolute left-0 top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50">Previous</Button>
          <Button onClick={() => setCurrentIndex((currentIndex + 1) % uploader.attachments.length)} className="absolute right-0 top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50">Next</Button>
          {/* {currentIndex > 0 && (
            <>
              <MemoCropper
                src={URL.createObjectURL(
                  uploader.attachments[currentIndex - 1].file,
                )}
                cropperRef={cropperRef}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  crop(currentIndex);
                  setCurrentIndex(
                    (prev) => (prev - 1) % uploader.attachments.length,
                  );
                }}
                className="absolute left-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
              >
                <ArrowLeft size={36} />
              </Button>
            </>
          )}
          <MemoCropper
            src={URL.createObjectURL(uploader.attachments[currentIndex].file)}
            cropperRef={cropperRef}
          />
          {currentIndex < uploader.attachments.length - 1 && (
            <>
              <MemoCropper
                src={URL.createObjectURL(
                  uploader.attachments[currentIndex + 1].file,
                )}
                cropperRef={cropperRef}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  crop(currentIndex);
                  setCurrentIndex(
                    (prev) => (prev + 1) % uploader.attachments.length,
                  );
                }}
                className="absolute right-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
              >
                <ArrowRight size={36} />
              </Button>
            </>
          )} */}
        </div>
        <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-1 bg-transparent opacity-0 group-hover:opacity-50">
          {uploader.attachments.map((_, index) => (
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
        <AttachmentButton
          onClick={() => {
            crop(currentIndex);
          }}
          onFileSelected={onFileSelected}
          disabled={false}
          className="absolute left-1/2 top-1/2 h-fit w-fit -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
          variant="ghost"
        >
          <Plus size={36} />
        </AttachmentButton>
        <Button
          onClick={() => {
            uploader.removeAttachment(
              uploader.attachments[currentIndex].file.name,
            );
            setCurrentIndex(
              // attachments.length - 1 because we are removing an attachment, and due to async nature of react, it might not be ready yet
              (prev) => (prev - 1) % (uploader.attachments.length - 1),
            );
          }}
          className="absolute right-[5%] top-[10%] h-fit w-fit rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-50"
          variant="ghost"
        >
          <X size={24} />
        </Button>
      </div>
      {textEditorOpen && (
        <TextEditor
          uploader={uploader}
          size={{ width, height: width * aspectRatio }}
        />
      )}
    </div>
  );
}

const MemoCropper = memo(
  ({
    src,
    cropperRef,
  }: {
    src: string;
    cropperRef: RefObject<ReactCropperElement>;
  }) => {
    const aspectRatio = 1;
    const width = 512;
    const onReady = useCallback(
      (event: Cropper.ReadyEvent<HTMLImageElement>) => {
        const cropper = event.currentTarget.cropper;
        const imageData = cropper.getImageData();
        const containerData = cropper.getContainerData();
        const zoom = Math.max(
          containerData.width / imageData.naturalWidth,
          containerData.height / imageData.naturalHeight,
        );
        cropper.zoomTo(zoom);
        cropper.setCropBoxData({
          left: 0,
          top: 0,
          width: width,
          height: width * aspectRatio,
        });
        cropper.setCanvasData({
          width: width,
          height: width * aspectRatio,
        });
      },
      [width, aspectRatio],
    );
    return (
      <Cropper
        src={src}
        viewMode={1}
        dragMode="move"
        aspectRatio={1}
        initialAspectRatio={1}
        cropBoxMovable={false}
        cropBoxResizable={false}
        minContainerWidth={width}
        minContainerHeight={width * aspectRatio}
        minCropBoxWidth={width}
        minCropBoxHeight={width * aspectRatio}
        minCanvasWidth={width}
        minCanvasHeight={width * aspectRatio}
        responsive={true}
        guides={true}
        center={true}
        zoomable={true}
        scalable={true}
        autoCropArea={1}
        checkOrientation={false}
        background={false}
        ready={onReady}
        // className={`relative transition-opacity duration-1000 ease-in-out`}
        ref={cropperRef}
      />
    );
  },
);

function AttachmentButton({
  onClick,
  onFileSelected,
  disabled,
  children,
  className,
  ...props
}: {
  onClick?: () => void;
  onFileSelected: (files: File[]) => void;
  disabled: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
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
        disabled={disabled}
        loading={disabled}
        onClick={() => {
          inputRef.current?.click();
          onClick?.();
        }}
        className={cn(
          "bg-transparent text-lg text-card-foreground hover:bg-card-foreground hover:text-card",
          className,
        )}
        {...props}
      >
        {children}
      </LoadingButton>
    </div>
  );
}

function TextEditor({
  uploader,
  size,
}: {
  uploader: ReturnType<typeof useMediaUpload>;
  size: { width: number; height: number };
}) {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
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
    // await startUpload(attachments.map((attachment) => attachment.file));
    mutation.mutate({
      content: input,
      mediaIds: uploader.attachments
        .map((attachment) => attachment.mediaId)
        .filter(Boolean) as string[],
    });
    editor?.commands.clearContent();
    uploader.reset();
  };

  return (
    <div className="h-full w-full space-y-4 border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex w-full">
        <div className="flex items-center">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            className="mr-4 hidden sm:inline"
          />
        </div>
        <EditorContent
          editor={editor}
          className="h-full w-full overflow-y-auto rounded-md bg-background p-4"
        />
      </div>
      {/* <div className="mt-2 flex w-full items-center justify-end">
        <LoadingButton
          variant="outline"
          loading={mutation.isPending || uploader.isUploading}
          onClick={onSubmit}
          size="sm"
          disabled={input.trim().length === 0 || uploader.isUploading}
        >
          Post
        </LoadingButton>
      </div> */}
    </div>
  );
}
