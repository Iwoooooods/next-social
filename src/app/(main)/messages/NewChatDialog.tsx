import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DefaultStreamChatGenerics,
  SearchResults,
  useChatContext,
} from "stream-chat-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "../SessionProvider";
import { useState } from "react";
import { UserResponse } from "stream-chat";
import { useMutation, useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";
import { Check, Loader2, SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import LoadingButton from "@/components/LoadingButton";
import { useRouter } from "next/navigation";

export default function NewChatDialog({
  open,
  onOpenChange,
  onChatCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreate: () => void;
}) {
  const { client, setActiveChannel } = useChatContext();
  const { toast } = useToast();
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  if (!loggedInUser) router.push("/login");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const [selectedUsers, setSelectedUsers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([]);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", debouncedSearchInput],
    queryFn: async () =>
      await client.queryUsers(
        {
          id: { $ne: loggedInUser?.id },
          role: { $ne: "admin" },
          ...(debouncedSearchInput
            ? {
                $or: [
                  { name: { $autocomplete: debouncedSearchInput } },
                  { username: { $autocomplete: debouncedSearchInput } },
                ],
              }
            : {}),
        },
        { name: 1, username: 1 },
        { limit: 10 },
      ),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel("messaging", {
        members: [...selectedUsers.map((user) => user.id), loggedInUser.id],
        name:
          selectedUsers.length > 1
            ? loggedInUser.displayName +
              "," +
              selectedUsers.map((user) => user.name).join(",")
            : undefined,
      });
      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon
              size={24}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 focus:outline-none"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex w-full flex-wrap items-center gap-2 p-4">
              {selectedUsers.map((user) => (
                <SelectedUserTag
                  key={user.id}
                  user={user}
                  onRemove={() =>
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id),
                    )
                  }
                />
              ))}
            </div>
          )}
          <hr />
          <div>
            {isFetching && <Loader2 size={24} className="animate-spin" />}
            {isError && <p>An error occurred while fetching users</p>}
            {isSuccess && (
              <div className="flex w-full flex-col items-start gap-2 p-2">
                {data.users.map((user) => (
                  <SearchResult
                    key={user.id}
                    user={user}
                    selected={selectedUsers.some((u) => u.id === user.id)}
                    onClick={() => {
                      setSelectedUsers((prev) =>
                        prev.some((u) => u.id === user.id)
                          ? prev.filter((u) => u.id !== user.id)
                          : [...prev, user],
                      );
                    }}
                  />
                ))}
              </div>
            )}
            {isSuccess && data.users.length === 0 && (
              <p>No users found. Please try a different name.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <LoadingButton
            loading={mutation.isPending}
            disabled={selectedUsers.length === 0}
            variant="ghost"
            onClick={() => mutation.mutate()}
            className="w-full bg-card-foreground text-card"
          >
            Create
          </LoadingButton>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SearchResult({
  user,
  selected,
  onClick,
}: {
  user: UserResponse<DefaultStreamChatGenerics>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" onClick={onClick}>
      <div className="flex w-full items-center gap-2">
        <UserAvatar avatarUrl={user.image} size={32} />
        <div>{user.name}</div>
        <div className="text-muted-foreground">@{user.username}</div>
      </div>
      {selected && <Check size={24} className="ml-2" />}
    </Button>
  );
}

function SelectedUserTag({
  user,
  onRemove,
}: {
  user: UserResponse<DefaultStreamChatGenerics>;
  onRemove: () => void;
}) {
  return (
    <div className="relative">
      <UserAvatar avatarUrl={user.image} size={48} />
      <Button
        variant="ghost"
        onClick={onRemove}
        className="absolute -right-2 -top-2 size-6 p-0 hover:bg-transparent"
      >
        <X size={24} />
      </Button>
    </div>
  );
}
