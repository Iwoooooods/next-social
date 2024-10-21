"use client";

import { PostData } from "@/lib/types";
import { createContext, useContext, useState } from "react";

interface PostContextType {
  open: boolean;
  onOpen: (id: string, pinnedCommentId?: string) => void;
  onClose: () => void;
  postId: string | null;
  pinnedCommentId: string | undefined;
  setPinnedCommentId: (id: string | undefined) => void;
}

const PostContext = createContext<PostContextType | null>(null);

export default function PostProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [open, setOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [pinnedCommentId, setPinnedCommentId] = useState<string | undefined>();

  function onOpen(id: string, pinnedCommentId?: string) {
    setPostId(id);
    setPinnedCommentId(pinnedCommentId);
    setOpen(true);
  }

  function onClose() {
    setPostId(null);
    setPinnedCommentId(undefined);
    setOpen(false);
  }

  return (
    <PostContext.Provider value={{ open, onOpen, onClose, postId, pinnedCommentId, setPinnedCommentId }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePost must be used within a PostProvider");
  return context;
}
