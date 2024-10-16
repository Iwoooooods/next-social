import { StreamChat } from "stream-chat";

const streamSeverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_KEY!,
    process.env.NEXT_PUBLIC_STREAM_SECRET!,
);

export default streamSeverClient;