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
  Menu,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { hasRole, canAccessPage } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentProfile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();

    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });

    router.push("/login");
    router.refresh();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const NavButtons = ({ showText = true }: { showText?: boolean }) => (
    <>
      {/* Dashboard - shareholder, admin, accountant only */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/dashboard") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/dashboard")}
            className={showText ? "w-full justify-start" : ""}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="ml-2">Dashboard</span>
          </Button>
        )}
      {/* Application Report - user, admin, shareholder */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/reports/daily") &&
        (showText ? (
          <>
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/reports/daily")}
              className="w-full justify-start"
            >
              <BarChart2 className="h-4 w-4" />
              <span className="ml-2">Daily Report</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/reports/monthly")}
              className="w-full justify-start"
            >
              <BarChart2 className="h-4 w-4" />
              <span className="ml-2">Monthly Report</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/reports/date-range")}
              className="w-full justify-start"
            >
              <BarChart2 className="h-4 w-4" />
              <span className="ml-2">Date Range Report</span>
            </Button>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <BarChart2 className="h-4 w-4" />
                <span className="ml-2">Application Report</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem
                onSelect={() => handleNavigation("/reports/daily")}
              >
                Daily
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleNavigation("/reports/monthly")}
              >
                Monthly
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleNavigation("/reports/date-range")}
              >
                Date Range
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      {/* Statement - user, admin, shareholder */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/reports/statement") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/reports/statement")}
            className={showText ? "w-full justify-start" : ""}
          >
            <FileText className="h-4 w-4" />
            <span className="ml-2">Statement</span>
          </Button>
        )}
      {/* Service Fees - user, admin, shareholder */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/service-fees") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/service-fees")}
            className={showText ? "w-full justify-start" : ""}
          >
            <CircleDollarSignIcon className="h-4 w-4" />
            <span className="ml-2">Service Fees</span>
          </Button>
        )}
      {/* Overdue Loans - ca, admin, shareholder */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/overdue") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/overdue")}
            className={showText ? "w-full justify-start" : ""}
          >
            <TimerIcon className="h-4 w-4" />
            <span className="ml-2">Overdue Loans</span>
          </Button>
        )}
      {/* Blacklist - cs, ca, admin, shareholder */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/blacklist") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/blacklist")}
            className={showText ? "w-full justify-start" : ""}
          >
            <Ban className="h-4 w-4" />
            <span className="ml-2">Blacklist</span>
          </Button>
        )}
      {/* Exclude Disbursement - user, admin, shareholder, accountant, ca */}
      {currentProfile?.role &&
        canAccessPage(currentProfile.role, "/exclude-disbursement") && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/exclude-disbursement")}
            className={showText ? "w-full justify-start" : ""}
          >
            <XCircle className="h-4 w-4" />
            <span className="ml-2">Exclude Disbursement</span>
          </Button>
        )}
      {/* Profiles - admin only */}
      {currentProfile?.role && hasRole(currentProfile.role, ["admin"]) && (
        <Button
          variant="ghost"
          onClick={() => handleNavigation("/profiles")}
          className={showText ? "w-full justify-start" : ""}
        >
          <Users className="h-4 w-4" />
          <span className="ml-2">Profiles</span>
        </Button>
      )}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between border-b bg-background p-2 sm:p-3 md:p-4">
      {/* Logo - Left side */}
      <div className="flex items-center flex-shrink-0">
        <Link href={"/"} className="flex items-center gap-2">
          <Image
            src="https://drive.google.com/uc?id=1P0wjUyetjh_7ERCxjmhWARWi8Ig1qng5"
            alt="Company Logo"
            width={isMobile ? 40 : 60}
            height={isMobile ? 40 : 60}
            priority
            className="flex-shrink-0"
          />
        </Link>
      </div>

      {/* Desktop Navigation - Center */}
      {!isMobile && (
        <div className="flex items-center gap-1 md:gap-2 lg:gap-4 overflow-x-auto flex-1 justify-center px-2">
          <NavButtons showText={false} />
        </div>
      )}

      {/* Right side - Mobile menu button or Sign Out */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {isMobile ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                <NavButtons showText={true} />
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full justify-start mt-4"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="hidden sm:flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">Sign Out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
