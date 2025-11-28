"use client";

import { useState } from "react";
import {
  LogOut,
  BarChart2,
  FileText,
  TimerIcon,
  Ban,
  CircleDollarSignIcon,
  Users,
  LayoutDashboard,
  XCircle,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { hasRole, canAccessPage } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { currentProfile, signOut } = useAuth();
  const [reportsOpen, setReportsOpen] = useState(
    pathname?.startsWith("/reports") || false
  );

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      path: "/",
      roles: ["user", "admin", "shareholder", "accountant", "cs", "ca"],
    },
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["shareholder", "admin", "accountant"],
    },
    {
      title: "Daily Report",
      icon: BarChart2,
      path: "/reports/daily",
      roles: ["admin", "shareholder", "accountant"],
      parent: "reports",
    },
    {
      title: "Monthly Report",
      icon: BarChart2,
      path: "/reports/monthly",
      roles: ["admin", "shareholder", "accountant"],
      parent: "reports",
    },
    {
      title: "Date Range Report",
      icon: BarChart2,
      path: "/reports/date-range",
      roles: ["admin", "shareholder", "accountant"],
      parent: "reports",
    },
    {
      title: "Statement",
      icon: FileText,
      path: "/reports/statement",
      roles: ["admin", "shareholder", "accountant"],
    },
    {
      title: "Service Fees",
      icon: CircleDollarSignIcon,
      path: "/service-fees",
      roles: ["user", "admin", "shareholder", "accountant"],
    },
    {
      title: "Overdue Loans",
      icon: TimerIcon,
      path: "/overdue",
      roles: ["ca", "admin", "shareholder"],
    },
    {
      title: "Blacklist",
      icon: Ban,
      path: "/blacklist",
      roles: ["cs", "ca", "admin", "shareholder"],
    },
    {
      title: "Exclude Disbursement",
      icon: XCircle,
      path: "/exclude-disbursement",
      roles: ["admin", "accountant"],
    },
    {
      title: "Profiles",
      icon: Users,
      path: "/profiles",
      roles: ["admin"],
    },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (!currentProfile?.role) return false;
    if (item.roles.includes(currentProfile.role)) {
      if (item.path === "/profiles") {
        return hasRole(currentProfile.role, ["admin"]);
      }
      return canAccessPage(currentProfile.role, item.path);
    }
    return false;
  });

  const reportsItems = visibleItems.filter((item) => item.parent === "reports");
  const otherItems = visibleItems.filter((item) => !item.parent);

  return (
    <Sidebar className="overflow-x-hidden">
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel className="overflow-x-hidden">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <Image
                src="https://drive.google.com/uc?id=1P0wjUyetjh_7ERCxjmhWARWi8Ig1qng5"
                alt="Company Logo"
                width={50}
                height={50}
                priority
                className="flex-shrink-0"
              />
              {/* <span className="font-semibold truncate">LoanLook</span> */}
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-x-hidden mt-4">
            <SidebarMenu className="overflow-x-hidden">
              {otherItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => router.push(item.path)}
                      className={cn(
                        "py-5 transition-colors",
                        active
                          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                          : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <Link href={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {reportsItems.length > 0 && (
                <Collapsible
                  open={reportsOpen}
                  onOpenChange={setReportsOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={cn(
                          "py-5 transition-colors",
                          "hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <BarChart2 className="h-4 w-4" />
                        <span>Reports</span>
                        <ChevronRight
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform duration-200",
                            reportsOpen && "rotate-90"
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="ml-4 space-y-1">
                        {reportsItems.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          return (
                            <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton
                                asChild
                                onClick={() => router.push(item.path)}
                                className={cn(
                                  "py-5 transition-colors",
                                  active
                                    ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                                    : "hover:bg-primary/10 hover:text-primary"
                                )}
                              >
                                <Link href={item.path}>
                                  <Icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="overflow-x-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="py-5 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
