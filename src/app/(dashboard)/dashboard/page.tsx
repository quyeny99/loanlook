"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import LoanDashboard from "@/components/loan-dashboard";
import { useAuth } from "@/context/AuthContext";
import { canAccessPage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { currentProfile } = useAuth();

  useEffect(() => {
    // In a real app, you'd verify a token stored in localStorage or a cookie.
    // For this example, we'll use a simple flag in localStorage.
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsAuthenticated(true);
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check access permission - only shareholder, admin, accountant can access
  if (currentProfile && !canAccessPage(currentProfile.role, "/dashboard")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto">
        <LoanDashboard />
      </main>
    </div>
  );
}
