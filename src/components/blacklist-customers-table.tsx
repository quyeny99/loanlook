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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BlacklistedCustomer } from "@/lib/types";
import { LoanPagination } from "@/components/loan-pagination";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function BlacklistCustomersTable({
  refreshToken = 0,
  onLoadingChange,
  onEdit,
  onDelete,
  resetToPage1 = false,
  onResetPage1Complete,
}: {
  refreshToken?: number;
  onLoadingChange?: (loading: boolean) => void;
  onEdit?: (customer: BlacklistedCustomer) => void;
  onDelete?: (customer: BlacklistedCustomer) => void;
  resetToPage1?: boolean;
  onResetPage1Complete?: () => void;
}) {
  const [customers, setCustomers] = React.useState<BlacklistedCustomer[]>([]);
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

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get total count
      const { count, error: countError } = await supabase
        .from("blacklisted_customers")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error counting blacklisted customers:", countError);
      } else if (count !== null) {
        setTotalRows(count);
      }

      // Calculate pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch data with pagination
      const { data, error } = await supabase
        .from("blacklisted_customers")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching blacklisted customers:", error);
        setCustomers([]);
        return;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error("Failed to fetch blacklisted customers:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, refreshToken]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const tableHeaders = [
    { label: "Customer ID", style: { width: "15%" } },
    { label: "Name", style: { width: "20%" } },
    { label: "Phone", style: { width: "12%" } },
    { label: "Reason", style: { width: "25%" } },
    { label: "Blacklisted By", style: { width: "18%" } },
    { label: "Actions", style: { width: "10%" } },
  ];

  // Get total count for pagination
  const [totalRows, setTotalRows] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const pagedCustomers = customers;

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header, index) => (
                <TableHead key={index} style={header.style}>
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
            ) : pagedCustomers.length > 0 ? (
              pagedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="bg-red-50 hover:bg-red-100"
                >
                  <TableCell className="font-medium">
                    {customer.customer_id}
                  </TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[180px]">
                          {customer.reason}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{customer.reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{customer.blacklisted_by_name}</TableCell>
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
                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Cập nhật
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => onDelete(customer)}
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
                  No blacklisted customers found.
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
