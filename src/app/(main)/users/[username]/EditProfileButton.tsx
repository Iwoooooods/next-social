"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UserData } from "@/lib/types";
import EditProfileDialog from "./EditProfileDialog";

export default function EditProfileButton({
  user,
  className,
}: {
  user: UserData;
  className?: string;
}) {
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const handleClick = () => {
    setProfileEditorOpen(true);
  };
  return (
    <>
      <Button
        variant={"outline"}
        onClick={handleClick}
        className={cn("bg-card text-card-foreground", className)}
      >
        Edit Profile
      </Button>
      <EditProfileDialog
        user={user}
        open={profileEditorOpen}
        onOpenChange={setProfileEditorOpen}
      />
    </>
  );
}
