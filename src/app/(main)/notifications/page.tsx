import { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your notifications",
};

export default function NotificationsPage() {
  return (
    <main className="flex h-full w-full gap-4">
      <div className="mt-4 flex h-full w-full max-w-5xl min-h-[672px] overflow-hidden rounded-xl border-2 border-border bg-card text-card-foreground outline-2">
        <Notifications />
        <div className="h-full w-full flex-1">chat container</div>
      </div>
    </main>
  );
}
