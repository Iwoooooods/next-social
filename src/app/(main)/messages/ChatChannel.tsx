import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  ChannelHeaderProps,
} from "stream-chat-react";
import { cn } from "@/lib/utils";

export default function ChatChannel({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <div className={cn("w-full md:block", open ? "hidden" : "block")}>
      <Channel>
        <Window>
          <ChatChannelHeader onOpen={onOpen} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface ChatChannelHeaderProps extends ChannelHeaderProps {
  onOpen: () => void;
}

function ChatChannelHeader({ onOpen, ...props }: ChatChannelHeaderProps) {
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center h-full p-2 md:hidden">
        <Button
          size="icon"
          onClick={onOpen}
          variant="ghost"
        >
          <Menu size={24} />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}
