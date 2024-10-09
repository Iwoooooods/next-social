import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CommentData } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";
import DeleteCommentDialog from "./DeleteCommentDialog";        

export const CommentMoreButton = ({
  className,
  comment,
}: {
  className?: string;
  comment: CommentData;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useSession();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "",
              className,
            )}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(user?.id === comment.user.id || user?.id === comment.post.userId) && (
            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
              <span className="text-destructive flex items-center w-auto">
                <Trash2 className="mr-2" />
                Delete
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentDialog
        comment={comment}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};
