"use client";

import { differenceInCalendarDays, parseISO } from 'date-fns';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Loan } from '@/lib/data';

type LoanTableProps = {
  loans: Loan[];
  loading: boolean;
  itemsPerPage: number;
  currencyFormatter: Intl.NumberFormat;
  formatDateString: (date: string | null) => string;
};

export function LoanTable({
  loans,
  loading,
  itemsPerPage,
  currencyFormatter,
  formatDateString,
}: LoanTableProps) {
  return (
    <div className="rounded-md border">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '120px' }}>Loan Code</TableHead>
            <TableHead style={{ width: '120px' }}>App Code</TableHead>
            <TableHead style={{ width: '150px' }}>Customer</TableHead>
            <TableHead style={{ width: '200px' }}>Product</TableHead>
            <TableHead style={{ width: '100px' }}>From Date</TableHead>
            <TableHead style={{ width: '100px' }}>To Date</TableHead>
            <TableHead style={{ width: '60px' }}>CCY</TableHead>
            <TableHead className="text-right" style={{ width: '120px' }}>Disbursed</TableHead>
            <TableHead className="text-right" style={{ width: '120px' }}>Outstanding</TableHead>
            <TableHead className="text-right" style={{ width: '120px' }}>Due Amount</TableHead>
            <TableHead style={{ width: '120px' }}>Due Date</TableHead>
            <TableHead style={{ width: '120px' }}>Interest Date</TableHead>
            <TableHead style={{ width: '120px' }}>Principal Date</TableHead>
            <TableHead style={{ width: '120px' }}>Fee Date</TableHead>
            <TableHead style={{ width: '150px' }}>Interest Payment Term</TableHead>
            <TableHead style={{ width: '150px' }}>Principal Repayment Term</TableHead>
            <TableHead style={{ width: '100px' }}>Collateral</TableHead>
            <TableHead className="text-right" style={{ width: '100px' }}>Profit</TableHead>
            <TableHead style={{ width: '120px' }}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={19}>
                  <Skeleton className="h-[40px] w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : loans.length > 0 ? (
            loans.map((loan) => {
              const itrPaid = loan.itr_pay_cycle;
              const itrUnpaid = loan.itr_num_cycle - loan.itr_pay_cycle;
              const prinPaid = loan.prin_pay_cycle;
              const prinUnpaid = loan.prin_num_cycle - loan.prin_pay_cycle;
              const isPendingDisbursement = loan.status === 1;
              const isPaidOff = loan.status === 8;
              const daysRemaining = loan.due_date ? differenceInCalendarDays(parseISO(loan.due_date), new Date()) : null;

              return (
                <TableRow key={loan.code}>
                  <TableCell className="font-medium">{loan.code}</TableCell>
                  <TableCell>{loan.application__code}</TableCell>
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
                  <TableCell>{loan.product__currency__code}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(loan.disbursement)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(loan.outstanding)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(loan.due_amount)}</TableCell>
                  <TableCell>
                  <div>{formatDateString(loan.due_date)}</div>
                  {daysRemaining !== null && (
                    <div
                      className={cn({
                        'text-green-600': daysRemaining >= 0 || isPaidOff,
                        'text-red-600': daysRemaining < 0 && !isPaidOff,
                      })}
                    >
                      ({isPaidOff ? '0' : (daysRemaining >= 0 ? daysRemaining : differenceInCalendarDays(new Date(), parseISO(loan.due_date)) + 1)}D)
                    </div>
                  )}
                  </TableCell>
                  <TableCell>
                    <div>{formatDateString(loan.itr_next_date)}</div>
                    {loan.itr_next_amount > 0 && (
                      <div className={cn("text-accent", { "text-red-600": loan.itr_ovd_days && loan.itr_ovd_days > 0 })}>{currencyFormatter.format(loan.itr_next_amount)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{formatDateString(loan.prin_next_date)}</div>
                    {loan.prin_next_amount > 0 && (
                       <div className={cn("text-accent", { "text-red-600": loan.prin_ovd_days && loan.prin_ovd_days > 0 })}>{currencyFormatter.format(loan.prin_next_amount)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{formatDateString(loan.fee_next_date)}</div>
                    {loan.fee_next_amount > 0 && (
                        <div className={cn("text-accent", { "text-red-600": loan.fee_ovd_days && loan.fee_ovd_days > 0 })}>{currencyFormatter.format(loan.fee_next_amount)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isPendingDisbursement ? null : (
                      <div className="flex items-center gap-1">
                        {itrPaid >= 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">{itrPaid}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Periods already paid</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {itrUnpaid >= 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge>{itrUnpaid}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unpaid periods</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {loan.itr_ovd_cycle > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive">{loan.itr_ovd_cycle}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Overdue periods</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isPendingDisbursement ? null : (
                      <div className="flex items-center gap-1">
                        {prinPaid >= 0 && (
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">{prinPaid}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Periods already paid</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {prinUnpaid >= 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge>{prinUnpaid}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unpaid periods</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {loan.prin_ovd_cycle > 0 && (
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive">{loan.prin_ovd_cycle}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Overdue periods</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{loan.collat_count}</TableCell>
                  <TableCell className="text-right">{loan.revenue ? currencyFormatter.format(loan.revenue) : ''}</TableCell>
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
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={19} className="h-24 text-center">
                No loans found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
