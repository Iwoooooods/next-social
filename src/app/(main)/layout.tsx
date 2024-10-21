import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";
import { MenuBar } from "@/components/MenuBar";
import PostProvider from "./PostProvider";
import PostSizeProvider from "./PostSizeProvider";

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
        <PostSizeProvider>
          <div className="flex flex-col">
            <Navbar />
            <div className="mx-auto flex h-full w-full justify-center gap-2 px-4">
              <MenuBar className="mt-4 px-2 py-4" />
              {children}
            </div>
          </div>
        </PostSizeProvider>
      </PostProvider>
    </SessionProvider>
  );
}
