import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { isUploading, startUpload } = useUploadThing("attachment", {

    onBeforeUploadBegin(files) {
      const renameFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });

      setAttachments((prev) => [
        ...prev,
        ...renameFiles.map((file) => ({ file, isUploading: true })),
      ]);

      return renameFiles;
    },

    onUploadProgress: setUploadProgress,

    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((attachment, index) => {
          const uploadResult = res.find((r) => r.name === attachment.file.name);
          if (!uploadResult) return attachment;

          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );

      toast({
        title: "Uploaded",
        description: "Your attachments have been uploaded",
      });
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

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        title: "Uploading",
        description: "Please wait while your attachments are uploaded",
      });
      return;
    }

    if (files.length + attachments.length > 5) {
      toast({
        title: "Maximum number of attachments reached",
        description: "You can only upload a maximum of 5 attachments",
        variant: "destructive",
      });
      return;
    }

    startUpload(files);
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
  };
}
