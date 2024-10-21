"use client";

import { createContext, useContext, useState } from "react";

interface PostSizeContextType {
  imageWidth: number;
  textEditorWidth: number;
  setImageWidth: (width: number) => void;
  setTextEditorWidth: (width: number) => void;
}

const PostSizeContext = createContext<PostSizeContextType | null>(null);

export default function PostSizeProvider({ children }: React.PropsWithChildren<{}>) {
  const [imageWidth, setImageWidth] = useState<number>(478);
  const [textEditorWidth, setTextEditorWidth] = useState<number>(384);

  return (
    <PostSizeContext.Provider value={{ imageWidth, textEditorWidth, setImageWidth, setTextEditorWidth }}>
      {children}
    </PostSizeContext.Provider>
  );
}

export function usePostSize() {
  const context = useContext(PostSizeContext);
  if (!context) throw new Error("usePostSize must be used within a PostSizeProvider");
  return context;
}
