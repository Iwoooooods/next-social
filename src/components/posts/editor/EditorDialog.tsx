"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useMediaUpload from "@/hooks/useMediaUpload";
import { useState } from "react";
import { DialogDescription } from "@/components/ui/dialog";
import "cropperjs/dist/cropper.css";
import { deleteAttachment } from "./action";
import "./styles.css";
import { usePostSize } from "@/app/(main)/PostSizeProvider";
import { MediaPicker } from "./MediaPicker";
import MediaCropper from "./MediaCropper";

export default function EditorDialog() {
  const { imageWidth, textEditorWidth } = usePostSize();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"crop" | "text">("crop");
  const mediaUploader = useMediaUpload();

  const onFileSelected = (files: File[]) => {
    mediaUploader.setAttachments((prev) => [
      ...prev,
      ...files.map((file) => {
        const extension = file.name.split(".").pop();
        const newFileName = `${file.name.replace(`.${extension}`, "")}_${crypto.randomUUID()}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });
        return { file: renamedFile, isUploading: false };
      }),
    ]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={async (open) => {
        setOpen(open);
        // reset the media uploader when the dialog is closed
        if (!open) {
          mediaUploader.reset();
          setCurrentStep("crop");
          await deleteAttachment(
            mediaUploader.attachments
              .map((attachment) => {
                const fileName = attachment.url?.split("https://utfs.io/f/")[1];
                return fileName;
              })
              .filter(Boolean) as string[],
          );
        }
      }}
    >
      <DialogTrigger className="flex size-full items-center rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground">
        <SquarePen className="h-6 w-6" />
        <span className="ml-2 hidden text-sm font-medium lg:inline">
          Create
        </span>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col items-center gap-2 overflow-hidden border-none bg-card p-0 text-card-foreground"
        style={{
          maxWidth:
            mediaUploader.attachments.length > 0 && currentStep === "text"
              ? `${imageWidth + textEditorWidth}px`
              : imageWidth,
        }}
      >
        <DialogHeader className="px-4 py-2">
          <DialogTitle className="text-center">Create a new post</DialogTitle>
          <DialogDescription className="text-center">
            What's on your mind?
          </DialogDescription>
        </DialogHeader>
        {mediaUploader.attachments.length === 0 ? (
          <MediaPicker onFileSelected={onFileSelected} />
        ) : (
          <MediaCropper
            setOpen={setOpen}
            uploader={mediaUploader}
            onFileSelected={onFileSelected}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
