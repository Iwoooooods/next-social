import { useEffect } from "react";
import { useState } from "react";
import { useSession } from "../SessionProvider";
import { StreamChat } from "stream-chat";
import kyInstance from "@/lib/ky";

export default function useInitializationChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },
        async () =>
          await kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setChatClient(client);
      });

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => {
          console.log(error);
        })
        .then(() => {
          console.log("Disconnected from StreamChat");
        });
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}
