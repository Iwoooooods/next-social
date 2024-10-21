"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, Scissors, Trash } from "lucide-react";
import useMediaUpload, { Attachment } from "@/hooks/useMediaUpload";
import { useEffect, useRef, createRef } from "react";
import LoadingButton from "@/components/LoadingButton";
import Image from "next/image";
import { useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSubmitPostMutation } from "./mutation";
import { memo, RefObject } from "react";
import { deleteAttachment } from "./action";
import "./styles.css";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePostSize } from "@/app/(main)/PostSizeProvider";
import { AttachButton } from "./AttachButton";
import TextEditor from "./TextEditor";

export default function MediaCropper({
  uploader,
  onFileSelected,
  currentStep,
  setCurrentStep,
  setOpen,
}: {
  uploader: ReturnType<typeof useMediaUpload>;
  onFileSelected: (files: File[]) => void;
  currentStep: "crop" | "text";
  setCurrentStep: (step: "crop" | "text") => void;
  setOpen: (open: boolean) => void;
}) {
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 4);
  const { imageWidth, textEditorWidth, setImageWidth } = usePostSize();
  const mutation = useSubmitPostMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cropperRefs, setCropperRefs] = useState<
    RefObject<ReactCropperElement>[]
  >([]);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What else do you want to share?",
      }),
    ],
    autofocus: true,
  });

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  const onPostSubmit = async () => {
    mutation.mutate(
      {
        content: input,
        mediaIds: uploader.attachments
          .map((attachment) => attachment.mediaId)
          .filter(Boolean) as string[],
        // mediaRatio: aspectRatio,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          uploader.reset();
          setAspectRatio(1);
          setCurrentStep("crop");
          setOpen(false);
        },
      },
    );
  };

  async function handleLastStep() {
    if (currentStep === "text") {
      setCurrentStep("crop");
      // delete the uploaded media
      await deleteAttachment(
        uploader.attachments
          .map((attachment) => {
            const fileName = attachment.url?.split("https://utfs.io/f/")[1];
            return fileName;
          })
          .filter(Boolean) as string[],
      );
    }
    if (currentStep === "crop") {
      uploader.reset();
    }
  }

  async function handleNextStep() {
    await uploader.startUpload(
      uploader.attachments.map((attachment) => attachment.file),
    );
    setCurrentStep("text");
  }

  function crop(index: number) {
    return new Promise<void>((resolve) => {
      const cropper = cropperRefs[index].current?.cropper;
      if (!cropper) {
        resolve();
        return;
      }
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          const newFile = new File(
            [blob],
            uploader.attachments[index].file.name,
            { type: "image/jpeg" },
          );
          uploader.setAttachments((prev: Attachment[]) =>
            prev.map((attachment, i) =>
              i === index
                ? { ...attachment, file: newFile, isCropped: true }
                : attachment,
            ),
          );
        }
        resolve();
      }, "image/jpeg");
    });
  }

  useEffect(() => {
    setCropperRefs(
      uploader.attachments.map(() => createRef<ReactCropperElement>()),
    );
  }, [uploader.attachments]);

  return (
    <div className="relative flex h-full max-h-[80vh] w-full flex-col justify-center overflow-hidden pt-2">
      <div className="relative top-[-4px] flex w-full items-center justify-between px-4">
        <Button
          variant="ghost"
          onClick={handleLastStep}
          className="h-[24px] w-[24px] bg-card p-0 text-card-foreground hover:bg-card-foreground hover:text-card"
        >
          <ArrowLeft size={24} />
        </Button>
        {currentStep === "crop" ? (
          <LoadingButton
            loading={uploader.isUploading}
            onClick={handleNextStep}
            variant="ghost"
            className="h-[24px] w-[24px] bg-card p-0 text-card-foreground hover:bg-card-foreground hover:text-card"
          >
            <ArrowRight size={24} />
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="outline"
            loading={mutation.isPending}
            onClick={onPostSubmit}
            disabled={mutation.isPending || input.trim().length === 0}
            className="h-[36px] w-[36px] rounded-full bg-card p-0 text-card-foreground hover:bg-card-foreground hover:text-card"
          >
            Post
          </LoadingButton>
        )}
      </div>

      <div className="relative flex h-full w-full overflow-hidden">
        <div
          className="group relative flex items-center justify-center overflow-hidden"
          style={{
            width: `${imageWidth}px`,
          }}
        >
          {uploader.attachments.map((attachment, index) =>
            currentStep === "crop" ? (
                <>
                <div
                key={index}
                className={`absolute inset-0 transition-opacity ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
              >
                <MemoCropper
                  src={URL.createObjectURL(attachment.file)}
                  cropperRef={cropperRefs[index]}
                />
              </div>
              <div style={{height: imageWidth}}></div>
              </>
              
            ) : (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={URL.createObjectURL(attachment.file)}
                    alt=""
                    fill
                    className="object-contain object-center"
                  />
                </div>
              </div>
            ),
          )}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              onClick={async () => {
                setCurrentIndex(
                  (prev) => (prev - 1) % uploader.attachments.length,
                );
              }}
              className="absolute left-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
            >
              <ArrowLeft size={36} />
            </Button>
          )}
          {currentIndex < uploader.attachments.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentIndex(
                  (prev) => (prev + 1) % uploader.attachments.length,
                );
              }}
              className="absolute right-[2%] top-1/2 h-fit w-fit -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
            >
              <ArrowRight size={36} />
            </Button>
          )}
          {currentStep === "crop" && (
            <>
              <AttachButton
                onFileSelected={onFileSelected}
                disabled={false}
                className="absolute left-1/2 top-1/2 h-fit w-fit -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
                variant="ghost"
              >
                <Plus size={36} />
              </AttachButton>
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
                className="absolute left-[5%] top-[5%] h-fit w-fit rounded-full bg-transparent p-0 opacity-0 hover:bg-transparent group-hover:opacity-100"
                variant="ghost"
              >
                <Trash size={24} />
              </Button>
              <Button
                onClick={async () => {
                  await crop(currentIndex);
                }}
                className="absolute right-[5%] top-[5%] h-fit w-fit rounded-full bg-transparent p-0 opacity-0 hover:bg-transparent group-hover:opacity-100"
                variant="ghost"
              >
                <Scissors size={24} />
              </Button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-1 bg-transparent opacity-0 group-hover:opacity-100">
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
        </div>
        {currentStep === "text" && (
          <TextEditor
            editor={editor}
            size={{
              width: textEditorWidth,
              height: imageWidth / (3 / 4),
            }}
          />
        )}
      </div>
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
    const [aspectRatio, setAspectRatio] = useState<number>(NaN);
    const { imageWidth: containerWidth } = usePostSize();
    const containerHeight = containerWidth;
    const aspectRatioOptions = [
      { label: "Original", value: NaN },
      { label: "1:1", value: 1 },
      { label: "3:4", value: 3 / 4 },
    ];

    const handleAspectRatioChange = (newRatio: string) => {
      const ratio = parseFloat(newRatio);
      setAspectRatio(ratio);
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        cropper.setAspectRatio(ratio);
      }
    };

    return (
      <div className="relative">
        <Tabs
          value={aspectRatio.toString()}
          onValueChange={handleAspectRatioChange}
          className="absolute left-2 top-2 z-50"
        >
          <TabsList className="flex flex-wrap gap-2">
            {aspectRatioOptions.map((option) => (
              <TabsTrigger key={option.label} value={option.value.toString()}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Cropper
          src={src}
          style={{ height: containerHeight, width: containerWidth }}
          viewMode={1}
          dragMode="move"
          center
          background={false}
          cropBoxMovable={false}
          cropBoxResizable={false}
          //   minCropBoxWidth={containerWidth}
          toggleDragModeOnDblclick={false}
          responsive={true}
          guides={false}
          ref={cropperRef}
        />
      </div>
    );
  },
);

MemoCropper.displayName = "MemoCropper";