import { Button } from "./ui/button";
import Image from "next/image";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchField({className}: {className?: string}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} action="/search" method="GET" className={className}>
      <div className="relative">
        <Input
          name="query"
          placeholder="Search"
          className="focus-visible:ring-0 bg-gray-100"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          disabled={!query.trim()}
          variant="ghost"
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent hover:text-accent-foreground hover:scale-110"
        >
          <Image src="/search.svg" alt="search" width={16} height={16} />
        </Button>
      </div>
    </form>
  );
}
