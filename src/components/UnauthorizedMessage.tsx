"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UnauthorizedMessage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/sign-in');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-gray-600 mb-2">Please sign in to view this page.</p>
      <p className="text-gray-500">Redirecting to sign-in page in 3 seconds...</p>
    </div>
  );
};

export default UnauthorizedMessage;