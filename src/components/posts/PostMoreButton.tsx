import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
export const PostMoreButton = ({
  className,
  post,
}: {
  className?: string;
  post: PostData;
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
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              className,
            )}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {user?.id === post.user.id && (
            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
              <span className="text-destructive flex items-center w-auto">
                <Trash2 className="mr-2" />
                Delete
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostDialog
        post={post}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};
