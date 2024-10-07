import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  BellIcon,
  MessageCircleIcon,
  BookmarkIcon,
} from "lucide-react";
import Link from "next/link";
import EditorDialog from "./posts/editor/EditorDialog";
import { useState } from "react";

export const MenuBar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "sticky top-20 z-50 flex h-fit w-fit flex-col items-start justify-center rounded-xl border-2 border-border bg-card text-card-foreground outline-2",
        className,
      )}
    >
      <Button variant="ghost" title="Home" asChild>
        <Link href="/">
          <HomeIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Notifications" asChild>
        <Link href="/notifications">
          <BellIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Notifications</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Messages" asChild>
        <Link href="/messages">
          <MessageCircleIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Messages</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Bookmarks" asChild>
        <Link href="/bookmarks">
          <BookmarkIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
      <EditorDialog />
    </div>
  );
};
