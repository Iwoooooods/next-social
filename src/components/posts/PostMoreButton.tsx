import { Button } from "@/components/ui/button";
import { MoreHorizontal, PenTool, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import DeletePostDialog from "./DeletePostDialog";
import { cn } from "@/lib/utils";
import { PostData } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";
import PostEditDialog from "@/components/post-edit/PostEditDialog";
import NewPostDialog from "./editor/NewPostDialog";

export const PostMoreButton = ({
  className,
  post,
}: {
  className?: string;
  post: PostData;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user } = useSession();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              className,
            )}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {user?.id === post.user.id && (
            <>
              {" "}
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <span className="flex w-auto items-center text-accent-foreground">
                  <PenTool className="mr-2" />
                  Edit
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                <span className="flex w-auto items-center text-destructive">
                  <Trash2 className="mr-2" />
                  Delete
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostDialog
        post={post}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
      <PostEditDialog
        post={post}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />
    </>
  );
};
