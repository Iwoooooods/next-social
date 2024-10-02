import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HomeIcon, BellIcon, MessageCircleIcon, BookmarkIcon } from "lucide-react";
import Link from "next/link";
  
export const MenuBar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "sticky top-20 flex flex-col h-fit w-fit items-start justify-center bg-card text-card-foreground outline-2 border-2 border-border rounded-xl z-50",
        className,
      )}
    >
      <Button variant="ghost" title="Home" asChild>
        <Link href="/">
          <HomeIcon className="h-6 w-6" />
          <span className="hidden lg:inline ml-2">Home</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Notifications" asChild>
        <Link href="/notifications">
          <BellIcon className="h-6 w-6" />
          <span className="hidden lg:inline ml-2">Notifications</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Messages" asChild>
        <Link href="/messages">
          <MessageCircleIcon className="h-6 w-6" />
          <span className="hidden lg:inline ml-2">Messages</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Bookmarks" asChild>
        <Link href="/bookmarks">
          <BookmarkIcon className="h-6 w-6" />
          <span className="hidden lg:inline ml-2">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
};
