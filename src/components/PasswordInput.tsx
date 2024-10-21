import React, { useState } from "react";
import { InputProps } from "./ui/input";
import { Input } from "./ui/input"; 
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          {...props}
          ref={ref}
          className={cn(
            "flex h-10 w-full outline-none",
            className,
          )}
        />
        <Button
          variant="ghost"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 transform text-muted-foreground bg-transparent hover:bg-transparent"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
