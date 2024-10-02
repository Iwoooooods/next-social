import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link href="/" className="px-4 py-2">
      <Button variant="outline" className='bg-card-foreground text-card' size="lg">
        Go back to Home
      </Button>
      </Link>
    </div>
  );
}