import { PostData } from "@/lib/types";
import { useState, useRef } from "react";
import { useSubmitCommentMutation } from "./mutation";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";

export default function CommentInput({ post }: { post: PostData }) {
  const [input, setInput] = useState<string>("");
  const mutation = useSubmitCommentMutation(post.id); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    mutation.mutate(
      { post, content: input },
      { onSuccess: () => setInput("") },
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form className="relative flex items-center gap-2" onSubmit={handleSubmit}>
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="rounded-xl resize-none focus:outline-none min-h-10 max-h-16 w-full overflow-y-auto bg-background p-2 pr-8"
        placeholder="Add a comment..."
        rows={1}
      />
      <Button
        type="submit"
        variant="ghost"
        disabled={!input.trim() || mutation.isPending}
        className="absolute right-0 top-1/2 h-[36px] w-[36px] -translate-y-1/2 p-0"
      >
        {!mutation.isPending ? <Send /> : <Loader2 className="animate-spin" />}
      </Button>
    </form>
  );
}
