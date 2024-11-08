import { TrendsSidebar } from "@/components/TrendsSidebar";
import ForYouFeed from "@/components/ForYouFeed";
import FollowingFeed from "@/components/FollowingFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function Home() {
  return (
    <main className="flex h-full w-full gap-4">
      <div className="flex h-full w-full flex-col items-center justify-start gap-4 py-4">
        <Tabs defaultValue="for-you" className="w-full max-w-[1024px]">
          <TabsList className="max-w-[640px]">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      {/* <TrendsSidebar /> */}
    </main>
  );
}
