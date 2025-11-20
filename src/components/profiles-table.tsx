"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoanPagination } from "@/components/loan-pagination";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { canUpdate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { format } from "date-fns";

export function ProfilesTable({
  refreshToken = 0,
  onLoadingChange,
  resetToPage1 = false,
  onResetPage1Complete,
}: {
  refreshToken?: number;
  onLoadingChange?: (loading: boolean) => void;
  resetToPage1?: boolean;
  onResetPage1Complete?: () => void;
}) {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [updatingRoles, setUpdatingRoles] = React.useState<Set<number>>(
    new Set()
  );
  const { toast } = useToast();
  const { currentProfile, loadUserProfile, loginId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canUpdateRole = canUpdate(currentProfile?.role);

  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize =
    Number.isNaN(Number(pageSizeParam)) || !pageSizeParam
      ? 10
      : Math.max(1, parseInt(pageSizeParam));
  const page =
    Number.isNaN(Number(pageParam)) || !pageParam
      ? 1
      : Math.max(1, parseInt(pageParam));

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchProfiles = React.useCallback(async () => {
    try {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      const supabase = createClient();

      // Get total count
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error fetching count:", countError);
        setTotalCount(0);
      } else {
        setTotalCount(count || 0);
      }

      // Get profiles with pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching profiles:", error);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setProfiles([]);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [page, pageSize, onLoadingChange]);

  React.useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles, refreshToken]);

  React.useEffect(() => {
    if (resetToPage1 && page !== 1) {
      setPage(1);
      if (onResetPage1Complete) {
        onResetPage1Complete();
      }
    }
  }, [resetToPage1, page, onResetPage1Complete]);

  const handleRoleChange = async (profileId: number, newRole: string) => {
    setUpdatingRoles((prev) => new Set(prev).add(profileId));

    try {
      const supabase = createClient();

      console.log("Updating profile role:", { profileId, newRole });

      const { error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
        })
        .eq("id", profileId);

      if (error) {
        console.error("Failed to update profile role - Error details:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.message ||
            error.details ||
            "Failed to update profile role. Please check your permissions.",
        });
        return;
      }

      // Update local state immediately
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, role: newRole, updated_at: new Date().toISOString() }
            : p
        )
      );

      // If updating current user's profile, reload their profile in AuthContext
      if (currentProfile?.id === profileId && loadUserProfile && loginId) {
        await loadUserProfile(loginId);
      }

      toast({
        title: "Success",
        description: "Profile role updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile role - Exception:", {
        error,
        message: error?.message,
        stack: error?.stack,
      });
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message || "An error occurred while updating the role.",
      });
    } finally {
      setUpdatingRoles((prev) => {
        const next = new Set(prev);
        next.delete(profileId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No profiles found.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.id}</TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.full_name || "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={profile.role}
                      onValueChange={(value) =>
                        handleRoleChange(profile.id, value)
                      }
                      disabled={updatingRoles.has(profile.id) || !canUpdateRole}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="cs">CS</SelectItem>
                        <SelectItem value="ca">CA</SelectItem>
                        <SelectItem value="shareholder">Shareholder</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {profile.created_at
                      ? format(
                          new Date(profile.created_at),
                          "MMM dd, yyyy HH:mm"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {profile.updated_at
                      ? format(
                          new Date(profile.updated_at),
                          "MMM dd, yyyy HH:mm"
                        )
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <LoanPagination
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={setPage}
      />
    </div>
  );
}
