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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ExcludeDisbursement } from "@/lib/types";
import { LoanPagination } from "@/components/loan-pagination";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function ExcludeDisbursementTable({
  refreshToken = 0,
  onLoadingChange,
  resetToPage1 = false,
  onResetPage1Complete,
  onEdit,
  onDelete,
}: {
  refreshToken?: number;
  onLoadingChange?: (loading: boolean) => void;
  resetToPage1?: boolean;
  onResetPage1Complete?: () => void;
  onEdit?: (disbursement: ExcludeDisbursement) => void;
  onDelete?: (disbursement: ExcludeDisbursement) => void;
}) {
  const [disbursements, setDisbursements] = React.useState<
    ExcludeDisbursement[]
  >([]);
  const [loading, setLoading] = React.useState(true);
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

  const fetchDisbursements = React.useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get total count
      const { count, error: countError } = await supabase
        .from("excluded_disbursements")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error counting excluded disbursements:", countError);
      } else if (count !== null) {
        setTotalRows(count);
      }

      // Calculate pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch data with pagination
      const { data, error } = await supabase
        .from("excluded_disbursements")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching excluded disbursements:", error);
        setDisbursements([]);
        return;
      }

      setDisbursements(data || []);
    } catch (error) {
      console.error("Failed to fetch exclude disbursements:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      setDisbursements([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, refreshToken]);

  React.useEffect(() => {
    fetchDisbursements();
  }, [fetchDisbursements]);

  // Reset to page 1 when resetToPage1 is true
  React.useEffect(() => {
    if (resetToPage1 && page !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
      if (onResetPage1Complete) {
        onResetPage1Complete();
      }
    }
  }, [
    resetToPage1,
    page,
    pathname,
    router,
    searchParams,
    onResetPage1Complete,
  ]);

  // Notify parent about loading changes
  React.useEffect(() => {
    if (onLoadingChange) onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formatDateString = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      return dateFormatter.format(parseISO(dateString));
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tableHeaders = [
    { label: "Date", style: { width: "8%" } },
    { label: "Loan Code", style: { width: "10%" } },
    { label: "App Code", style: { width: "10%" } },
    { label: "Customer Name", style: { width: "13%" } },
    { label: "Amount", style: { width: "10%" }, className: "" },
    { label: "Reference Month", style: { width: "8%" } },
    { label: "Country", style: { width: "8%" } },
    { label: "Product Type", style: { width: "10%" } },
    { label: "Reason", style: { width: "13%" } },
    { label: "Actions", style: { width: "10%" } },
  ];

  // Get total count for pagination
  const [totalRows, setTotalRows] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const pagedDisbursements = disbursements;

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
            ) : pagedDisbursements.length > 0 ? (
              pagedDisbursements.map((disbursement) => (
                <TableRow key={disbursement.id} className="hover:bg-muted/50">
                  <TableCell>{formatDateString(disbursement.date)}</TableCell>
                  <TableCell className="font-medium">
                    {disbursement.related_ln_code}
                  </TableCell>
                  <TableCell>{disbursement.related_ap_code}</TableCell>
                  <TableCell>{disbursement.fullname}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatAmount(disbursement.amount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {disbursement.reference_month}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[100px]">
                          {disbursement.country__name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{disbursement.country__en}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[100px]">
                          {disbursement.product__type__en}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{disbursement.product__type__en}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[200px]">
                          {disbursement.reason}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[300px]">{disbursement.reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(onEdit || onDelete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(disbursement)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Cập nhật
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => onDelete(disbursement)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className="h-24 text-center"
                >
                  No excluded disbursements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination footer */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <div>
            Showing {totalRows === 0 ? 0 : startIndex + 1}-
            {Math.min(endIndex, totalRows)} of {totalRows}
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
