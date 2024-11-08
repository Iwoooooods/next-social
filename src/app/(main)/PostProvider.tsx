"use client";

import { PostData } from "@/lib/types";
import { createContext, useContext, useState } from "react";

interface PostContextType {
  open: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  postId: string | null;
}

const PostContext = createContext<PostContextType | null>(null);

export default function PostProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [open, setOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  function onOpen(id: string) {
    setPostId(id);
    setOpen(true);
  }

  function onClose() {
    setPostId(null);
    setOpen(false);
  }

  return (
    <PostContext.Provider value={{ open, onOpen, onClose, postId }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePost must be used within a PostProvider");
  return context;
}
