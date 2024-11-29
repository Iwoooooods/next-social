import { PostData } from "@/lib/types";
import { useSubmitCommentMutation } from "./mutation";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function CommentInput({ post }: { post: PostData }) {
  //   const [input, setInput] = useState<string>("");
  const mutation = useSubmitCommentMutation(post.id);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Add a comment...",
      }),
    ],
  });
  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    mutation.mutate(
      { post, content: input },
      { onSuccess: () => editor?.commands.clearContent() },
    );
  }

  return (
    <form className="relative flex items-center gap-2" onSubmit={handleSubmit}>
      <EditorContent
        editor={editor}
        className="max-h-16 w-full overflow-y-auto bg-background p-2 pr-8 rounded-xl"
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
