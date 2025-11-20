"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessPage } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart2,
  FileText,
  CircleDollarSignIcon,
  TimerIcon,
  Ban,
  Users,
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

export default function Home() {
  const router = useRouter();
  const { currentProfile, loginId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStatements: 0,
    totalServiceFees: 0,
    recentStatements: 0,
    recentServiceFees: 0,
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    // Fetch quick stats
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const last7Days = format(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        );

        // Get total statements count
        const { count: totalStatements } = await supabase
          .from("loan_statements")
          .select("*", { count: "exact", head: true });

        // Get total service fees count
        const { count: totalServiceFees } = await supabase
          .from("loan_service_fees")
          .select("*", { count: "exact", head: true });

        // Get recent statements (last 7 days)
        const { count: recentStatements } = await supabase
          .from("loan_statements")
          .select("*", { count: "exact", head: true })
          .gte("payment_date", last7Days);

        // Get recent service fees (last 7 days)
        const { count: recentServiceFees } = await supabase
          .from("loan_service_fees")
          .select("*", { count: "exact", head: true })
          .gte("payment_date", last7Days);

        setStats({
          totalStatements: totalStatements || 0,
          totalServiceFees: totalServiceFees || 0,
          recentStatements: recentStatements || 0,
          recentServiceFees: recentServiceFees || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentProfile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allQuickLinks = [
    {
      title: "Dashboard",
      description: "View loan dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/dashboard",
    },
    {
      title: "Daily Report",
      description: "Daily application reports",
      icon: BarChart2,
      href: "/reports/daily",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/reports/daily",
    },
    {
      title: "Monthly Report",
      description: "Monthly application reports",
      icon: BarChart2,
      href: "/reports/monthly",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/reports/monthly",
    },
    {
      title: "Date Range Report",
      description: "Date range application reports",
      icon: BarChart2,
      href: "/reports/date-range",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/reports/date-range",
    },
    {
      title: "Statement",
      description: "Loan payment statements",
      icon: FileText,
      href: "/reports/statement",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/reports/statement",
    },
    {
      title: "Service Fees",
      description: "Manage service fees",
      icon: CircleDollarSignIcon,
      href: "/service-fees",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      page: "/service-fees",
    },
    {
      title: "Overdue Loans",
      description: "Track overdue loans",
      icon: TimerIcon,
      href: "/overdue",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      page: "/overdue",
    },
    {
      title: "Blacklist",
      description: "Manage blacklisted customers",
      icon: Ban,
      href: "/blacklist",
      color: "text-red-600",
      bgColor: "bg-red-50",
      page: "/blacklist",
    },
    {
      title: "Profiles",
      description: "Manage user profiles",
      icon: Users,
      href: "/profiles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      page: "/profiles",
    },
  ];

  const quickLinks = allQuickLinks.filter((link) =>
    currentProfile?.role ? canAccessPage(currentProfile.role, link.page) : false
  );

  return (
    <div className="min-h-screen w-full pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
            {currentProfile?.full_name
              ? `, ${currentProfile.full_name}`
              : currentProfile?.username
              ? `, ${currentProfile.username}`
              : ""}
            !
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your loan management system.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Statements
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStatements}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.recentStatements} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Service Fees
              </CardTitle>
              <CircleDollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServiceFees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.recentServiceFees} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {currentProfile?.role || "User"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Account permissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Access
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quickLinks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.href}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(link.href)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-3 rounded-lg ${link.bgColor} ${link.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="mt-4">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-blue-900">Getting Started</CardTitle>
                <CardDescription className="text-blue-700 mt-2">
                  Use the quick access cards above to navigate to different
                  sections of the system. Each section provides detailed
                  information and management tools for your loan operations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
