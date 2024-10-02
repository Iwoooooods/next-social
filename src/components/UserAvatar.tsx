import { cn } from "@/lib/utils";
import Image from "next/image";

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: {
  avatarUrl?: string | null;
  size?: number | null;
  className?: string | null;
}) {
  return (
    <Image
      src={avatarUrl ?? "/default-avatar.png"}
      alt="User Avatar"
      width={size ?? 36}
      height={size ?? 36}
      className={cn("rounded-full", className)}
    />
  );
}
