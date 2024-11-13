"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import { MediaUploader } from "@/components/posts/editor/MediaUploader";

export default function NewPostDialog() {
  return (
    <Dialog>
      <DialogTrigger className="flex w-full items-center rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground">
        <SquarePen className="h-6 w-6" />
        <span className="ml-2 hidden text-sm font-medium lg:inline">
          Create
        </span>
      </DialogTrigger>
      <DialogContent className="rounded-xl bg-card text-card-foreground sm:max-w-[512px]">
        <DialogHeader className="px-4 py-2">
          <DialogTitle className="text-center">Create a new post</DialogTitle>
          <DialogDescription className="text-center">
            What&apos;s on your mind?
          </DialogDescription>
        </DialogHeader>
        <MediaUploader />
      </DialogContent>
    </Dialog>
  );
}
