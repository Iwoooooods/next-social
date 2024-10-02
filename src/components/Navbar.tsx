"use client";

import Image from "next/image";
import SearchField from "./SearchField";
import UserButton from "./UserButton";
import ThemeToggle from "./ThemeToggle";
import { BluetoothSearching } from "lucide-react";

export default function Navbar() {
  return (
    <div className="sticky top-0 flex h-16 w-full items-center justify-between border-b-2 border-border outline-2 px-4 bg-card text-card-foreground z-50">
      {/* <Image src="/logo.svg" alt="logo" width={32} height={32} /> */}
      <BluetoothSearching className="size-8" />
      <SearchField className="mx-auto" />
      <ThemeToggle />
      <UserButton className="focus-visible:ring-0 ml-2" />
    </div>
  );
}
