import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

export default function InfiniteScrollContainer({
  onBottomReached,
  className,
  children,
}: InfiniteScrollContainerProps) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={cn("flex w-full flex-col items-center justify-start gap-4", className)}>
      {children}
      <div ref={ref} />
    </div>
  );
}
