import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn(
        "w-fit focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" /> : props.children}
    </Button>
  );
}
