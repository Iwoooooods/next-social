import { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = {
    title: "Messages",
    description: "Messages",
};

export default function MessagesPage() {

    return <main className="relative size-full overflow-hidden rounded-xl border-2 border-border bg-card text-card-foreground outline-2 mt-4">
        <Chat />    
    </main>
}
