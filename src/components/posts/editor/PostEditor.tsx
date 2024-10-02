"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { EditorContent } from "@tiptap/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSubmitPostMutation } from "./mutation";
import "./styles.css";
import LoadingButton from "@/components/LoadingButton";

export const PostEditor = React.memo(() => {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
  });

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  const onSubmit = async () => {
    mutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent();
      },
    });
  };

  return (
    <div className="w-full rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2">
      <div className="flex w-full">
        <div className="flex items-center">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            className="mr-4 hidden sm:inline"
          />
        </div>
        <EditorContent
          editor={editor}
          className="max-h-32 w-full overflow-y-auto rounded-md bg-background p-4"
        />
      </div>
      <div className="mt-2 flex w-full justify-end">
        <LoadingButton
          variant="outline"
          loading={mutation.isPending}
          onClick={onSubmit}
          size="sm"
          disabled={input.trim().length === 0}
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
});
