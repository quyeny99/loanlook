"use client";

import * as React from "react";
import { parseISO } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Loan, OverdueLoanStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { LoanPagination } from "@/components/loan-pagination";
import { createClient } from "@/utils/supabase/client";
import {
  OVERDUE_CUSTOM_STATUS,
  OVERDUE_CUSTOM_STATUS_LABELS_EN,
  OVERDUE_CUSTOM_STATUS_COLORS,
  type OverdueCustomStatus,
} from "@/lib/constants";

type OverdueStatus = "all" | "active" | "late" | "warning" | "critical";

function getRowColorByDueDays(dueDays: number | null | undefined): string {
  if (dueDays === 0) return "bg-green-50 border-green-500 hover:bg-green-100";
  if (dueDays !== null && dueDays !== undefined) {
    if (dueDays >= 1 && dueDays <= 6)
      return "bg-yellow-50 border-yellow-500 hover:bg-yellow-100";
    if (dueDays >= 7 && dueDays <= 14)
      return "bg-orange-200 border-orange-500 hover:bg-orange-300";
    if (dueDays >= 15) return "bg-red-200 border-red-500 hover:bg-red-300";
  }
  return "";
}

type LoanWithCustomStatus = Loan & {
  custom_status?: string | null;
};

export function OverdueLoansTable({
  tab = "all",
  refreshToken = 0,
  onLoadingChange,
}: {
  tab?: OverdueStatus;
  refreshToken?: number;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [loans, setLoans] = React.useState<LoanWithCustomStatus[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingStatus, setUpdatingStatus] = React.useState<Set<string>>(
    new Set()
  );
  const [statusMap, setStatusMap] = React.useState<
    Map<string, OverdueLoanStatus>
  >(new Map());
  const { loginId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const fetchLoans = React.useCallback(async () => {
    const userId = loginId || localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const values = [
        "code",
        "customer__fullname",
        "product__name",
        "valid_from",
        "valid_to",
        "outstanding",
        "due_amount",
        "due_date",
        "due_days",
        "status",
        "status__name",
      ].join(",");

      // Build filter by tab
      let dueFilter: Record<string, number> = {};
      if (tab === "active") {
        dueFilter = { due_days__gte: 1, due_days__lte: 3, outstanding__gt: 0 };
      } else if (tab === "late") {
        dueFilter = { due_days__gte: 4, due_days__lte: 6 };
      } else if (tab === "warning") {
        dueFilter = { due_days__gte: 7, due_days__lte: 14 };
      } else if (tab === "critical") {
        dueFilter = { due_days__gte: 15 } as any;
      } else if (tab === "all") {
        dueFilter = { due_days__gte: 1, outstanding__gt: 0 };
      }

      const filter = encodeURIComponent(
        JSON.stringify({
          deleted: 0,
          ...dueFilter,
          create_time__date__gte: "2025-01-01",
        })
      );

      const url = `https://api.y99.vn/data/Loan/?values=${values}&sort=-id&login=${userId}&filter=${filter}`;

      // Fetch loans and overdue_loan_status in parallel
      const supabase = createClient();
      const overdueStatusQuery = supabase
        .from("overdue_loan_status")
        .select("*");

      const [response, { data: overdueStatusData, error: overdueStatusError }] =
        await Promise.all([fetch(url), overdueStatusQuery]);

      if (!response.ok) {
        console.error("API Error:", response.status);
        setLoans([]);
        return;
      }

      const data = await response.json();

      if (!data || !data.rows) {
        console.error("Invalid data structure:", data);
        setLoans([]);
        return;
      }

      const overdueLoans = data.rows || [];

      // Handle Supabase error
      if (overdueStatusError) {
        console.error(
          "Error fetching overdue loan status:",
          overdueStatusError
        );
      }

      // Create a map of loan_id -> OverdueLoanStatus
      const newStatusMap = new Map<string, OverdueLoanStatus>();
      if (overdueStatusData) {
        (overdueStatusData as OverdueLoanStatus[]).forEach((status) => {
          newStatusMap.set(status.loan_id, status);
        });
      }

      // Get list of current loan codes from overdueLoans
      const currentLoanCodes = new Set(
        overdueLoans.map((loan: Loan) => loan.code)
      );

      // Find status records that no longer exist in current overdueLoans
      // Only delete status records for loans that are no longer in the overdue list
      // This means the loan has been paid off or is no longer overdue
      const statusesToDelete: string[] = [];
      if (overdueStatusData) {
        (overdueStatusData as OverdueLoanStatus[]).forEach((status) => {
          if (!currentLoanCodes.has(status.loan_id)) {
            statusesToDelete.push(status.loan_id);
          }
        });
      }

      // Delete status records for loans that are no longer in overdueLoans
      // This happens when overdueLoans has changed (loans paid off, no longer overdue)
      if (statusesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("overdue_loan_status")
          .delete()
          .in("loan_id", statusesToDelete);

        if (deleteError) {
          console.error(
            "Error deleting overdue loan status records:",
            deleteError
          );
        } else {
          // Remove deleted records from newStatusMap
          statusesToDelete.forEach((loanId) => {
            newStatusMap.delete(loanId);
          });
        }
      }

      setStatusMap(newStatusMap);

      // Merge custom_status into loans based on loan.code = loan_id
      const loansWithStatus: LoanWithCustomStatus[] = overdueLoans.map(
        (loan: Loan) => ({
          ...loan,
          custom_status: newStatusMap.get(loan.code)?.custom_status || null,
        })
      );

      setLoans(loansWithStatus);
    } catch (error) {
      console.error("Failed to fetch overdue loans:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, [loginId, tab, refreshToken]);

  React.useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Notify parent about loading changes (for spinning reload icon like dashboard)
  React.useEffect(() => {
    if (onLoadingChange) onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    if (page !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleStatusChange = async (
    loanCode: string,
    newStatus: OverdueCustomStatus
  ) => {
    setUpdatingStatus((prev) => new Set(prev).add(loanCode));
    try {
      const supabase = createClient();
      const existingStatus = statusMap.get(loanCode);

      if (existingStatus) {
        // Update existing record
        const { error } = await supabase
          .from("overdue_loan_status")
          .update({
            custom_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("loan_id", loanCode);

        if (error) {
          console.error("Error updating overdue loan status:", error);
          throw error;
        }

        // Update local state
        const updatedStatus: OverdueLoanStatus = {
          ...existingStatus,
          custom_status: newStatus,
          updated_at: new Date().toISOString(),
        };
        setStatusMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(loanCode, updatedStatus);
          return newMap;
        });
      } else {
        // Create new record
        const newStatusRecord = {
          loan_id: loanCode,
          custom_status: newStatus,
        };

        const { data, error } = await supabase
          .from("overdue_loan_status")
          .insert(newStatusRecord)
          .select()
          .single();

        if (error) {
          console.error("Error creating overdue loan status:", error);
          throw error;
        }

        // Update local state
        if (data) {
          setStatusMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(loanCode, data as OverdueLoanStatus);
            return newMap;
          });
        }
      }

      // Update loans state
      setLoans((prev) =>
        prev.map((loan) =>
          loan.code === loanCode ? { ...loan, custom_status: newStatus } : loan
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optionally show toast notification here
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(loanCode);
        return newSet;
      });
    }
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formatDateString = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return dateFormatter.format(parseISO(dateString));
    } catch (error) {
      return dateString;
    }
  };

  const tableHeaders = [
    { label: "Loan Code", style: { width: "120px" } },
    { label: "Customer", style: { width: "150px" } },
    { label: "Product", style: { width: "200px" } },
    { label: "From Date", style: { width: "100px" } },
    { label: "To Date", style: { width: "100px" } },
    {
      label: "Outstanding",
      style: { width: "120px" },
      className: "text-right",
    },
    { label: "Due Amount", style: { width: "120px" }, className: "text-right" },
    { label: "Due Date", style: { width: "120px" } },
    { label: "Status", style: { width: "150px" } },
  ];

  const totalRows = loans.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const pagedLoans = loading ? [] : loans.slice(startIndex, endIndex);

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header, index) => (
                <TableHead
                  key={index}
                  style={header.style}
                  className={header.className}
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {tableHeaders.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-[20px] w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagedLoans.length > 0 ? (
              pagedLoans.map((loan) => (
                <TableRow
                  key={loan.code}
                  className={cn(getRowColorByDueDays(loan.due_days))}
                >
                  <TableCell className="font-medium">{loan.code}</TableCell>
                  <TableCell>{loan.customer__fullname}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[150px]">
                          {loan.product__name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{loan.product__name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDateString(loan.valid_from)}</TableCell>
                  <TableCell>{formatDateString(loan.valid_to)}</TableCell>
                  <TableCell className="text-right">
                    {currencyFormatter.format(loan.outstanding || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencyFormatter.format(loan.due_amount || 0)}
                  </TableCell>
                  <TableCell>
                    <div>{formatDateString(loan.due_date)}</div>
                    {loan.due_days >= 0 && (
                      <div
                        className={cn({
                          "text-green-500": loan.due_days === 0,
                          "text-red-500": loan.due_days > 0,
                        })}
                      >
                        {loan.due_days}D
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Select
                      value={
                        loan.custom_status ||
                        OVERDUE_CUSTOM_STATUS.OVERDUE_FOLLOW_UP
                      }
                      onValueChange={(value) =>
                        handleStatusChange(
                          loan.code,
                          value as OverdueCustomStatus
                        )
                      }
                      disabled={updatingStatus.has(loan.code)}
                    >
                      {(() => {
                        const currentStatus = (loan.custom_status ||
                          OVERDUE_CUSTOM_STATUS.OVERDUE_FOLLOW_UP) as OverdueCustomStatus;
                        const colors =
                          OVERDUE_CUSTOM_STATUS_COLORS[currentStatus];
                        const textColorMap: Record<string, string> = {
                          "text-yellow-800": "rgb(113, 63, 18)",
                          "text-amber-800": "rgb(120, 53, 15)",
                          "text-orange-800": "rgb(154, 52, 18)",
                          "text-red-800": "rgb(153, 27, 27)",
                          "text-blue-800": "rgb(30, 64, 175)",
                          "text-green-800": "rgb(22, 101, 52)",
                          "text-red-900": "rgb(127, 29, 29)",
                          "text-purple-800": "rgb(107, 33, 168)",
                          "text-red-950": "rgb(69, 10, 10)",
                        };
                        const textColor =
                          textColorMap[colors.text] || "inherit";
                        return (
                          <SelectTrigger
                            className={cn(
                              "w-[180px] h-8 text-xs font-medium",
                              colors.text
                            )}
                            style={{
                              color: textColor,
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                        );
                      })()}
                      <SelectContent>
                        {Object.entries(OVERDUE_CUSTOM_STATUS).map(
                          ([key, value]) => {
                            const colors = OVERDUE_CUSTOM_STATUS_COLORS[value];
                            // Map Tailwind text color classes to actual color values
                            const textColorMap: Record<string, string> = {
                              "text-yellow-800": "rgb(113, 63, 18)",
                              "text-amber-800": "rgb(120, 53, 15)",
                              "text-orange-800": "rgb(154, 52, 18)",
                              "text-red-800": "rgb(153, 27, 27)",
                              "text-blue-800": "rgb(30, 64, 175)",
                              "text-green-800": "rgb(22, 101, 52)",
                              "text-red-900": "rgb(127, 29, 29)",
                              "text-purple-800": "rgb(107, 33, 168)",
                              "text-red-950": "rgb(69, 10, 10)",
                            };
                            const textColor =
                              textColorMap[colors.text] || "inherit";

                            return (
                              <SelectItem
                                key={key}
                                value={value}
                                className={cn(colors.text)}
                                style={{
                                  color: textColor,
                                }}
                              >
                                {OVERDUE_CUSTOM_STATUS_LABELS_EN[value]}
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className="h-24 text-center"
                >
                  No overdue loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination footer using shared component, with showing summary */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <div>
            Showing {totalRows === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
            {totalRows}
          </div>
          <LoanPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
