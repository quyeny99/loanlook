"use client";

import * as React from 'react';
import { parseISO } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Loan } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { LoanPagination } from '@/components/loan-pagination';

type OverdueStatus = 'all' | 'active' | 'late' | 'warning' | 'critical';

function getRowColorByDueDays(dueDays: number | null | undefined): string {
  if (dueDays === 0) return 'bg-green-50 border-green-500 hover:bg-green-100';
  if (dueDays !== null && dueDays !== undefined) {
    if (dueDays >= 1 && dueDays <= 6) return 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100';
    if (dueDays >= 7 && dueDays <= 14) return 'bg-orange-200 border-orange-500 hover:bg-orange-300';
    if (dueDays >= 15) return 'bg-red-200 border-red-500 hover:bg-red-300';
  }
  return '';
}

export function OverdueLoansTable({ tab = 'all', refreshToken = 0, onLoadingChange }: { tab?: OverdueStatus, refreshToken?: number, onLoadingChange?: (loading: boolean) => void }) {
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { loginId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');
  const pageSize = Number.isNaN(Number(pageSizeParam)) || !pageSizeParam ? 10 : Math.max(1, parseInt(pageSizeParam));
  const page = Number.isNaN(Number(pageParam)) || !pageParam ? 1 : Math.max(1, parseInt(pageParam));

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchLoans = React.useCallback(async () => {
    const userId = loginId || localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const values = [
        "id","beneficiary_account","beneficiary_bank","customer__code","fee_ovd_cycle","fee_income","fee_num_cycle","fee_pay_cycle",
        "fee_ovd_days","fee_penalty","fee_ovd","fee_next_date","fee_next_amount","fee_collected","application__code","application",
        "amount_given","penalty_ratio","product__install_cycle_days","product__type__code","product__base__code","penalty_amount",
        "revenue","itr_next_amount","status__code","prin_ovd_days","itr_ovd_days","batch_date","due_date","due_days",
        "product__currency__code","due_amount","prin_next_amount","itr_penalty","prin_penalty","itr_ovd_cycle","prin_ovd",
        "itr_ovd","prin_ovd_cycle","itr_ovd","prin_num_cycle","itr_num_cycle","prin_collected","itr_last_date","prin_last_date",
        "itr_last_amount","prin_last_amount","itr_collected","itr_income","itr_pay_cycle","prin_pay_cycle","itr_next_date",
        "prin_next_date","branch","branch__code","branch__name","product__type__name","prin_first_date","itr_first_date",
        "prin_cycle_days","itr_cycle_days","dbm_entry__account","approver","approve_time","prin_pay_type","prin_pay_type__code",
        "prin_pay_type__name","itr_pay_type","itr_pay_type__code","itr_pay_type__name","customer","customer__phone",
        "customer__fullname","code","product","product__code","product__name","valid_from","valid_to","rate_info","disbursement",
        "disbursement_local","outstanding","outstanding_local","principal","rate","status__name","dbm_entry","dbm_entry__code",
        "dbm_entry__account","creator__fullname","approver__fullname","update_time","create_time","approve_time","ratio",
        "approver","status","creator"
      ].join(",");

      // Build filter by tab
      let dueFilter: Record<string, number> = {};
      if (tab === 'active') {
        dueFilter = { due_days__gte: 0, due_days__lte: 0, outstanding__gt: 0 };
      } else if (tab === 'late') {
        dueFilter = { due_days__gte: 1, due_days__lte: 6 };
      } else if (tab === 'warning') {
        dueFilter = { due_days__gte: 7, due_days__lte: 14 };
      } else if (tab === 'critical') {
        dueFilter = { due_days__gte: 15 } as any;
      } else if (tab === "all") {
        dueFilter = { due_days__gte: 0, outstanding__gt: 0 }
      }

      const filter = encodeURIComponent(JSON.stringify({
        deleted: 0,
        ...dueFilter,
        create_time__date__gte: "2025-01-01"
      }))

      console.log({filter})

      const url = `https://api.y99.vn/data/Loan/?values=${values}&sort=-id&login=${userId}&filter=${filter}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('API Error:', response.status);
        setLoans([]);
        return;
      }

      const data = await response.json();

      if (!data || !data.rows) {
        console.error('Invalid data structure:', data);
        setLoans([]);
        return;
      }

      const overdueLoans = (data.rows || [])

      setLoans(overdueLoans);
    } catch (error) {
      console.error('Failed to fetch overdue loans:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
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
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatDateString = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return dateFormatter.format(parseISO(dateString));
    } catch (error) {
      return dateString;
    }
  };

  const tableHeaders = [
    { label: 'Loan Code', style: { width: '120px' } },
    { label: 'Customer', style: { width: '150px' } },
    { label: 'Product', style: { width: '200px' } },
    { label: 'From Date', style: { width: '100px' } },
    { label: 'To Date', style: { width: '100px' } },
    { label: 'Outstanding', style: { width: '120px' }, className: 'text-right' },
    { label: 'Due Amount', style: { width: '120px' }, className: 'text-right' },
    { label: 'Due Date', style: { width: '120px' } },
    { label: 'Status', style: { width: '120px' } },
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
                <TableHead key={index} style={header.style} className={header.className}>
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
                <TableRow key={loan.code} className={cn(getRowColorByDueDays(loan.due_days))}>
                  <TableCell className="font-medium">{loan.code}</TableCell>
                  <TableCell>{loan.customer__fullname}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[150px]">{loan.product__name}</div>
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
                    {
                      loan.due_days >= 0 && <div className={
                        cn({
                          "text-green-500": loan.due_days === 0,
                          "text-red-500": loan.due_days > 0
                        })
                      }>{loan.due_days}D</div>
                    }
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={'default'} className={cn({
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': loan.status === 2,
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300': loan.status === 1,
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': loan.status === 3,
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': loan.status === 5,
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': loan.status === 8,
                    })}>
                      {loan.status__name}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                  No overdue loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination footer using shared component, with showing summary */}
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <div>
              Showing {totalRows === 0 ? 0 : startIndex + 1}-{endIndex} of {totalRows}
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


