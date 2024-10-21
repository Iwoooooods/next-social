import { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";

export default function TextEditor({
  editor,
  size,
}: {
  editor: Editor | null;
  size: { width: number; height: number };
}) {
  const { user } = useSession();
  return (
    <div
      className="relative w-full max-w-sm space-y-4 border-2 border-border bg-card p-4 text-card-foreground outline-2"
      style={{ height: size.height, maxHeight: size.height }}
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            className="mr-4 hidden sm:inline"
          />
        </div>
        <EditorContent
          editor={editor}
          className="h-full max-h-full w-full overflow-y-auto rounded-md bg-transparent p-4"
        />
      </div>
    </div>
  );
}
