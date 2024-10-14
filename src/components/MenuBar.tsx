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
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import NotificationButton from "./notifications/NotificationButton";

export const MenuBar = async ({ className }: { className?: string }) => {
  const { user } = await validateRequest();
  if (!user) return;

  const unread = await prisma.notification.count({
    where: { recipientId: user.id, read: false },
  });

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
      <NotificationButton unread={unread} />
      {/* <Button variant="ghost" title="Notifications" asChild>
        <Link href="/notifications">
          <BellIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Notifications</span>
        </Link>
      </Button> */}
      <Button variant="ghost" title="Messages" asChild>
        <Link href="/messages">
          <MessageCircleIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Messages</span>
        </Link>
      </Button>
      <Button variant="ghost" title="Collects" asChild>
        <Link href="/collects">
          <BookmarkIcon className="h-6 w-6" />
          <span className="ml-2 hidden lg:inline">Collects</span>
        </Link>
      </Button>
      <EditorDialog />
    </div>
  );
};
