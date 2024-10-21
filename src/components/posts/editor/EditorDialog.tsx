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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const imageWidth = 512;
const textEditorWidth = 384;

export default function EditorDialog() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"crop" | "text">("crop");
  const mediaUploader = useMediaUpload();
  const [aspectRatio, setAspectRatio] = useState<number>(1);

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
      <DialogTrigger className="flex w-full items-center rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground">
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
          <MediaPreview
            setOpen={setOpen}
            uploader={mediaUploader}
            onFileSelected={onFileSelected}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
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
  currentStep,
  setCurrentStep,
  setOpen,
  aspectRatio,
  setAspectRatio,
}: {
  uploader: ReturnType<typeof useMediaUpload>;
  onFileSelected: (files: File[]) => void;
  currentStep: "crop" | "text";
  setCurrentStep: Dispatch<SetStateAction<"crop" | "text">>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  aspectRatio: number;
  setAspectRatio: Dispatch<SetStateAction<number>>;
}) {
  const width = imageWidth;
  const mutation = useSubmitPostMutation();
  const aspectRatioOptions = [
    { label: "1:1", value: 1 },
    // { label: "16:9", value: 9 / 16 },
    { label: "3:4", value: 3 / 4 },
  ];
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
        placeholder: "What's on your mind?",
      }),
    ],
    autofocus: true,
  });
  const titleRef = useRef<HTMLInputElement>(null);

  const input = editor?.getText({ blockSeparator: "\n" }) || "";
  const title = titleRef.current?.value || "";

  const onPostSubmit = async () => {
    mutation.mutate(
      {
        content: input,
        title,
        mediaIds: uploader.attachments
          .map((attachment) => attachment.mediaId)
          .filter(Boolean) as string[],
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

  const handleAspectRatioChange = (newRatio: string) => {
    if (uploader.attachments.length > 1) {
      // Don't allow changing aspect ratio if there's more than one image
      return;
    }
    const ratio = parseFloat(newRatio);
    setAspectRatio(ratio);
    // Recrop all images with the new aspect ratio
    cropperRefs.forEach((ref) => {
      const cropper = ref.current?.cropper;
      if (cropper) {
        cropper.setAspectRatio(ratio);
        cropper.setCropBoxData({
          left: 0,
          top: 0,
          width: width,
          height: width / ratio,
        });
      }
    });
  };

  useEffect(() => {
    setCropperRefs(
      uploader.attachments.map(() => createRef<ReactCropperElement>()),
    );
  }, [uploader.attachments]);

  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden pt-2">
      <div className="z-100 relative top-[-4px] flex w-full items-center justify-between px-4">
        <Button
          variant="ghost"
          onClick={handleLastStep}
          className="h-[24px] w-[24px] bg-card p-0 text-card-foreground hover:bg-card-foreground hover:text-card"
        >
          <ArrowLeft size={24} />
        </Button>
        {currentStep === "crop" ? (
          <LoadingButton
            disabled={uploader.attachments.some(
              (attachment) => !attachment.isCropped,
            )}
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
            disabled={
              mutation.isPending ||
              title.trim().length === 0 ||
              input.trim().length === 0
            }
            className="h-[36px] w-[36px] rounded-full bg-card p-0 text-card-foreground hover:bg-card-foreground hover:text-card"
          >
            Post
          </LoadingButton>
        )}
      </div>
      {currentStep === "crop" && (
        <Tabs
          value={aspectRatio.toString()}
          onValueChange={handleAspectRatioChange}
          className="mb-4"
        >
          <TabsList className="flex flex-wrap gap-2">
            {aspectRatioOptions.map((option) => (
              <TabsTrigger
                key={option.label}
                value={option.value.toString()}
                disabled={uploader.attachments.length > 1}
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      <div className="relative flex h-full w-full overflow-hidden">
        <div
          className="group relative flex items-center justify-center overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${width / aspectRatio}px`,
          }}
        >
          {uploader.attachments.map((attachment, index) =>
            currentStep === "crop" ? (
              <div
                key={index}
                className={`duration-600 absolute inset-0 transition-opacity ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
              >
                <MemoCropper
                  src={URL.createObjectURL(attachment.file)}
                  cropperRef={cropperRefs[index]}
                  aspectRatio={aspectRatio}
                />
              </div>
            ) : (
              <div
                key={index}
                className={`duration-600 absolute inset-0 transition-opacity ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src={URL.createObjectURL(attachment.file)}
                  alt=""
                  width={9999}
                  height={9999}
                  className="object-cover"
                />
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
              <AttachmentButton
                onFileSelected={onFileSelected}
                disabled={false}
                className="absolute left-1/2 top-1/2 h-fit w-fit -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 p-0 opacity-0 group-hover:opacity-100"
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
            titleRef={titleRef}
            size={{ width, height: width / aspectRatio }}
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
    aspectRatio,
  }: {
    src: string;
    cropperRef: RefObject<ReactCropperElement>;
    aspectRatio: number;
  }) => {
    const width = 512;
    const height = width / aspectRatio;

    return (
      <Cropper
        src={src}
        style={{ height: "100%", width: "100%" }}
        aspectRatio={aspectRatio}
        viewMode={1}
        dragMode="move"
        background={false}
        cropBoxMovable={false}
        cropBoxResizable={false}
        toggleDragModeOnDblclick={false}
        autoCropArea={1}
        responsive={true}
        guides={false}
        center={true}
        minCropBoxWidth={width}
        minCropBoxHeight={height}
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
  editor,
  size,
  titleRef,
}: {
  editor: Editor | null;
  titleRef: RefObject<HTMLInputElement>;
  size: { width: number; height: number };
}) {
  const { user } = useSession();

  return (
    <div
      className="relative w-full max-w-sm space-y-4 border-2 border-border bg-card p-4 text-card-foreground outline-2"
      style={{ height: size.height, maxHeight: size.height }}
    >
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex items-center">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            className="mr-4 hidden sm:inline"
          />
        </div>
        <Input
          ref={titleRef}
          placeholder="Add a title to make people see you!"
          className="rounded-none border-2 border-border bg-transparent"
        />
        <EditorContent
          editor={editor}
          className={`h-full max-h-full w-full overflow-y-auto rounded-md bg-transparent p-4`}
        />
      </div>
    </div>
  );
}
