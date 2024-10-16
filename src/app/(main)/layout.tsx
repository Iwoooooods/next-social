import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";
import {MenuBar} from "@/components/MenuBar";
import PostProvider from "./PostProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) {
    redirect("/login");
  }
  return (
    <SessionProvider value={session}>
      <PostProvider>
        <div className="flex flex-col">
          <Navbar />
        <div className="flex justify-center mx-auto w-full h-full px-4 gap-2">
          <MenuBar className="py-4 px-2 mt-4" />
          {children}
          </div>
        </div>
      </PostProvider>
    </SessionProvider>
  );
}
