import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "@/components/Navbar";
import {MenuBar} from "@/components/MenuBar";

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
      <div className="flex flex-col">
        <Navbar />
        <div className="flex mx-auto max-w-screen-xl w-full h-full px-4 gap-2">
          <MenuBar className="py-4 px-2 mt-4" />
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
