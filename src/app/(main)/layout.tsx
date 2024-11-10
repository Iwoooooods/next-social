import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";
import { MenuBar } from "@/components/MenuBar";
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
          <div className="mx-auto flex h-full w-full max-w-7xl justify-center gap-2 px-4">
            <MenuBar className="mt-4 px-2 py-4" />
            {children}
          </div>
        </div>
      </PostProvider>
    </SessionProvider>
  );
}
