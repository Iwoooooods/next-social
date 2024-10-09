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
import { useDeleteCommentMutation } from "./mutation";
import { CommentData } from "@/lib/types";
import LoadingButton from "@/components/LoadingButton";
import { Trash2 } from "lucide-react";

export default function DeleteCommentDialog({
  open,
  onClose,
  comment,
}: {
  open: boolean;
  onClose: () => void;
  comment: CommentData;
}) {
  const mutation = useDeleteCommentMutation();
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
          {<LoadingButton
            loading={mutation.isPending}
            variant="destructive"
            onClick={() => {
              mutation.mutate(comment.id, { onSuccess: () => onClose() });
            }}
          >
            <Trash2 className="mr-2" />
            Delete
          </LoadingButton>}
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
