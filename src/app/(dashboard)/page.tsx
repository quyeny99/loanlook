'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoanDashboard from '@/components/loan-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd verify a token stored in localStorage or a cookie.
    // For this example, we'll use a simple flag in localStorage.
    const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
    if (loggedIn) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto">
        <LoanDashboard />
      </main>
    </div>
  );
}
