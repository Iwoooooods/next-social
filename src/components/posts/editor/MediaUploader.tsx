import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PostPreview from "@/components/posts/editor/PostPreview";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import "./styles.css";

function InstagramMedia({
  width = 48,
  height = 48,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function MediaUploader() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 px-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelected(e.target.files)}
        className="sr-only hidden"
      />
      <p className="text-xl text-muted-foreground">
        Drag and drop your images here
      </p>
      <InstagramMedia width={96} height={96} />
      <Button
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
          }
        }}
        variant="outline"
      >
        <span className="text-md">Select from PC</span>
      </Button>
      {attachments.length > 0 && (
        <Dialog open onOpenChange={() => setAttachments([])}>
          <DialogContent className="min-h-[512px] max-w-[896px] overflow-hidden bg-card p-0 text-card-foreground">
            <PostPreview
              attachments={attachments}
              setAttachments={setAttachments}
              fileInputRef={fileInputRef}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
