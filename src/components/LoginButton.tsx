import { ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface LoginButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoginButton({
  loading,
  disabled,
  className,
  ...props
}: LoginButtonProps) {
  return (
    <Button
      {...props}
      variant="outline"
      disabled={loading || disabled}
      className={cn(
        className,
        ""
      )}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : props.children}
    </Button>
  );
}
