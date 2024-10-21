import { AttachButton } from "@/components/posts/editor/AttachButton";

export function MediaPicker({
  onFileSelected,
}: {
  onFileSelected: (files: File[]) => void;
}) {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 px-4">
      <SocialIcon />
      <p className="text-lg text-muted-foreground">
        Drag and drop your images here
      </p>
      <AttachButton onFileSelected={onFileSelected} disabled={false}>
        <span className="text-sm">Select from PC</span>
      </AttachButton>
    </div>
  );
}

function SocialIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
