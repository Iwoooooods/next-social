import { PostEditor } from "@/components/posts/editor/PostEditor";
import { TrendsSidebar } from "@/components/TrendsSidebar";
import ForYouFeed from "@/components/ForYouFeed";
import FollowingFeed from "@/components/FollowingFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function Home() {

  return (
    <div className="flex h-full w-full gap-4">
      <div className="h-full w-full flex flex-col items-center justify-start py-4 gap-4">
        <PostEditor />
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList>
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
      <TrendsSidebar />
    </div>
  );
}
