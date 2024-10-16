import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { MailPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import NewChatDialog from "./NewChatDialog";

export default function ChatSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useSession();

  const ChatChannelPreview = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose],
  );

  return (
    <div
      className={cn(
        "w-full flex-col md:flex md:w-64",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user.id] },
        }}
        showChannelSearch
        options={{ state: true, presence: true, limit: 10 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user.id] } },
            },
          },
        }}
        Preview={ChatChannelPreview}
      />
    </div>
  );
}

function MenuHeader({ onClose }: { onClose: () => void }) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <div className="flex h-[70px] items-center justify-between md:h-auto">
      <div className="flex h-full items-center justify-center p-2 md:hidden gap-2">
        <Button size="icon" onClick={onClose} variant="ghost">
          <X size={24} />
        </Button>
        <span className="text-lg font-semibold">Messages</span>
      </div>
      <div className="flex items-center justify-center p-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus size={24} />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          open={showNewChatDialog}
          onOpenChange={setShowNewChatDialog}
          onChatCreate={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}
