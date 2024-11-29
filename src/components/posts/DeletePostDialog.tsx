import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeletePostMutation } from "./mutation";
import { PostData } from "@/lib/types";
import LoadingButton from "@/components/LoadingButton";
import { Trash2 } from "lucide-react";

export default function DeletePostDialog({
  open,
  onClose,
  post,
}: {
  open: boolean;
  onClose: () => void;
  post: PostData;
}) {
  const mutation = useDeletePostMutation();
  const handleOpen = (open: boolean) => {
    if (!open || !mutation.isPending) onClose();
  };
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            loading={mutation.isPending}
            variant="destructive"
            onClick={async () => {
              await Promise.all([
                mutation.mutate(post.id, { onSuccess: () => onClose() }),
                Promise.all(
                  post.attachments.map((attachment) =>
                    fetch(
                      `${process.env.FILE_SERVER_URL}/media-delete?url=${encodeURIComponent(
                        attachment.url,
                      )}`,
                      { method: "DELETE" },
                    ),
                  ),
                ),
              ]);
            }}
          >
            <Trash2 className="mr-2" />
            Delete
          </LoadingButton>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
