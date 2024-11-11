// import { TrendsSidebar } from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Collects from "@/app/(main)/collects/Collects";

export const metadata: Metadata = {
  title: "Collects",
};

export default function CollectsPage() {
  return (
    <main className="flex h-full w-full gap-4 py-4">
      <div className="flex h-full w-full flex-col items-center justify-start">
        <Collects />
      </div>
      {/* <div className="hidden lg:block py-4">
        <TrendsSidebar />
      </div> */}
    </main>
  );
}
