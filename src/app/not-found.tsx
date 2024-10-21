import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-4xl font-bold">404 - Not Found</h1>
      <p className="mb-8 text-xl text-gray-600">
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="px-4 py-2">
        <Button
          variant="outline"
          className="bg-card-foreground text-card"
          size="lg"
        >
          Go back to Home
        </Button>
      </Link>
    </div>
  );
}
