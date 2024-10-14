"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { BellIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Badge } from "../ui/badge";

export default function NotificationButton({ unread }: { unread: number }) {
  const { data } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<{ count: number }>(),
    initialData: { count: unread },
    refetchInterval: 60 * 1000,
  });

  return (
    <Button variant="ghost" title="Notifications" asChild>
      <Link href="/notifications" className="relative">
        <BellIcon className="h-6 w-6"></BellIcon>
        <span className="ml-2 hidden lg:inline">Notifications</span>
        {data.count > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-2 left-6 h-6 w-6 items-center justify-center rounded-full p-0"
          >
            {data.count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
