import { useRef } from "react";
import { cn } from "@/lib/utils";
import LoadingButton from "@/components/LoadingButton";


export function AttachButton({
    onClick,
    onFileSelected,
    disabled,
    children,
    className,
    ...props
  }: {
    onClick?: () => void;
    onFileSelected: (files: File[]) => void;
    disabled: boolean;
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) {
    const inputRef = useRef<HTMLInputElement>(null);
  
    return (
      <div>
        <input
          type="file"
          accept="image/*,video/*"
          ref={inputRef}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              onFileSelected(files);
              e.target.value = "";
            }
          }}
          className="sr-only hidden"
        />
        <LoadingButton
          disabled={disabled}
          loading={disabled}
          onClick={() => {
            inputRef.current?.click();
            onClick?.();
          }}
          className={cn(
            "bg-transparent text-lg text-card-foreground hover:bg-card-foreground hover:text-card",
            className,
          )}
          {...props}
        >
          {children}
        </LoadingButton>
      </div>
    );
  }
  