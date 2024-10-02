import Skeleton from "react-loading-skeleton";

export const PostSkeleton = () => {
    return (
      <div className="w-full rounded-xl border-2 border-border bg-card p-4 text-card-foreground outline-2">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton
              circle
              containerClassName="w-9 h-9"
              className="h-full w-full"
            />
            <Skeleton
              containerClassName="w-36 h-9"
              className="h-full w-full rounded-xl"
            />
          </div>
          <Skeleton className="max-h-32 w-full overflow-y-auto rounded-xl bg-background p-4" />
        </div>
      </div>
    );
  };
  
export default PostSkeleton;