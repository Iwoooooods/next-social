import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
  url?: string;
  isCropped?: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { isUploading, startUpload } = useUploadThing("attachment", {
    onUploadProgress: setUploadProgress,

    onClientUploadComplete(res) {
      setAttachments((prev: Attachment[]) =>
        prev.map((attachment) => {
          const uploadResult = res.find((r) => r.name === attachment.file.name);
          if (!uploadResult) return attachment;

          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
            url: uploadResult.url,
          };
        }),
      );
    },

    onUploadError(error) {
      setAttachments((prev) =>
        prev.filter((attachment) => !attachment.isUploading),
      );

      toast({
        title: "Error",
        description: "An error occurred while uploading your attachments",
        variant: "destructive",
      });
    },
  });

  async function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        title: "Uploading",
        description: "Please wait while your attachments are uploaded",
      });
      return;
    }

    if (attachments.length > 5) {
      toast({
        title: "Maximum number of attachments reached",
        description: "You can only upload a maximum of 5 attachments",
        variant: "destructive",
      });
      return;
    }

    await startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.file.name !== fileName),
    );
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(0);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    uploadProgress,
    removeAttachment,
    reset,
    isUploading,
    setAttachments,
  };
}
