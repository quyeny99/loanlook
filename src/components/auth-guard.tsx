"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        // Not authenticated, redirect to login
        router.replace("/login");
        return;
      }

      // Authenticated, allow access
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!localStorage.getItem("userId")) {
        setIsChecking(false);
        router.replace("/login");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
