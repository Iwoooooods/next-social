import { useSession } from "@/app/(main)/SessionProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { User2Icon } from "lucide-react";
import { logout } from "@/app/(auth)/action";
import { useQueryClient } from "@tanstack/react-query";

export default function UserButton({ className }: { className?: string }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="border-none" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Logged in as {user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={`/users/${user.username}`} className="flex w-full items-center">
            <User2Icon className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear();
            logout();
          }}
        >
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
