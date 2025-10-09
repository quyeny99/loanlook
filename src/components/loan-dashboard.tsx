"use client";

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { isToday, subDays, subMonths, isWithinInterval, parseISO, differenceInCalendarDays } from 'date-fns';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

import { type Loan } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ITEMS_PER_PAGE = 10;

export default function LoanDashboard() {
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm);
  const [activeTab, setActiveTab] = React.useState('All Time');
  const [loading, setLoading] = React.useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [inputValue, setInputValue] = React.useState(String(currentPage));

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  React.useEffect(() => {
    if (debouncedSearchTerm) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);


  const fetchLoans = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.y99.vn/data/Loan/?values=id,beneficiary_account,beneficiary_bank,customer__code,fee_ovd_cycle,fee_income,fee_num_cycle,fee_pay_cycle,fee_ovd_days,fee_penalty,fee_ovd,fee_next_date,fee_next_amount,fees,fee_collected,application__code,application,amount_given,penalty_ratio,product__install_cycle_days,product__type__code,product__base__code,penalty_amount,revenue,itr_next_amount,status__code,prin_ovd_days,itr_ovd_days,batch_date,due_date,due_days,product__currency__code,due_amount,prin_next_amount,itr_penalty,prin_penalty,itr_ovd_cycle,prin_ovd,itr_ovd,prin_ovd_cycle,itr_ovd,prin_num_cycle,itr_num_cycle,prin_collected,itr_last_date,prin_last_date,itr_last_amount,prin_last_amount,itr_collected,itr_income,itr_pay_cycle,prin_pay_cycle,itr_next_date,prin_next_date,branch,branch__code,branch__name,product__type__name,prin_first_date,itr_first_date,prin_cycle_days,itr_cycle_days,dbm_entry__account,approver,approve_time,prin_pay_type,prin_pay_type__code,prin_pay_type__name,itr_pay_type,itr_pay_type__code,itr_pay_type__name,customer,customer__phone,customer__fullname,code,product,product__code,product__name,valid_from,valid_to,rate_info,disbursement,disbursement_local,outstanding,outstanding_local,principal,rate,status__name,dbm_entry,dbm_entry__code,creator__fullname,approver__fullname,update_time,create_time,ratio,approver,status,creator&distinct_values=%7B%22count_note%22:%7B%22type%22:%22Count%22,%22field%22:%22id%22,%22subquery%22:%7B%22model%22:%22Loan_Note%22,%22column%22:%22ref%22%7D%7D,%22sms_count%22:%7B%22type%22:%22Count%22,%22subquery%22:%7B%22model%22:%22Loan_Sms%22,%22column%22:%22ref%22%7D,%22field%22:%22id%22%7D,%22file_count%22:%7B%22type%22:%22Count%22,%22field%22:%22id%22,%22subquery%22:%7B%22model%22:%22Loan_File%22,%22column%22:%22ref%22%7D%7D,%22collat_count%22:%7B%22type%22:%22Count%22,%22field%22:%22id%22,%22subquery%22:%7B%22model%22:%22Loan_Collateral%22,%22column%22:%22loan%22%7D%7D%7D&filter=%7B%22deleted%22:0,%22create_time__date__gte%22:%221927-03-18%22%7D&sort=-id&summary=annotate&login=16');
      const data = await response.json();
      setLoans(data.rows || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const timeFilteredCounts = React.useMemo(() => {
    if (!loans) return { Today: 0, '1D': 0, '7D': 0, '30D': 0, '1M': 0, 'All Time': 0 };
    const now = new Date();
    return {
      'Today': loans.filter(loan => loan.create_time && isToday(parseISO(loan.create_time))).length,
      '1D': loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 1), end: now })).length,
      '7D': loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 7), end: now })).length,
      '30D': loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 30), end: now })).length,
      '1M': loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subMonths(now, 1), end: now })).length,
      'All Time': loans.length,
    };
  }, [loans]);

  const processedLoans = React.useMemo(() => {
    if (!loans) {
      return []; 
    }
      
    const now = new Date();
    let filteredLoans: Loan[];

    switch (activeTab) {
      case 'Today':
        filteredLoans = loans.filter(loan => loan.create_time && isToday(parseISO(loan.create_time)));
        break;
      case '1D':
        filteredLoans = loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 1), end: now }));
        break;
      case '7D':
        filteredLoans = loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 7), end: now }));
        break;
      case '30D':
        filteredLoans = loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subDays(now, 30), end: now }));
        break;
      case '1M':
        filteredLoans = loans.filter(loan => loan.create_time && isWithinInterval(parseISO(loan.create_time), { start: subMonths(now, 1), end: now }));
        break;
      case 'All Time':
      default:
        filteredLoans = loans;
        break;
    }

    if (debouncedSearchTerm) {
      const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
      filteredLoans = filteredLoans.filter(loan =>
        (loan.customer__fullname && loan.customer__fullname.toLowerCase().includes(lowercasedSearchTerm)) ||
        (loan.application__code && loan.application__code.toLowerCase().includes(lowercasedSearchTerm))
      );
    }

    return filteredLoans;
  }, [debouncedSearchTerm, activeTab, loans]);
  
  const totalPages = Math.ceil(processedLoans.length / ITEMS_PER_PAGE);

  const handlePageChange = React.useCallback((newPage: number) => {
    if (newPage < 1 || (newPage > totalPages && totalPages > 0)) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname, totalPages]);
  
  const paginatedLoans = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return processedLoans.slice(startIndex, endIndex);
  }, [processedLoans, currentPage]);
  
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handlePageChange(totalPages);
    }
  }, [currentPage, totalPages, handlePageChange]);

  React.useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const pageNum = Number(inputValue);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
        handlePageChange(pageNum);
    } else {
        setInputValue(String(currentPage));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

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

  return (
    <TooltipProvider>
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold font-headline">LoanLook</CardTitle>
        <CardDescription>Manage and track all your loan data in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="Today">Today ({timeFilteredCounts['Today']})</TabsTrigger>
              <TabsTrigger value="1D">1D ({timeFilteredCounts['1D']})</TabsTrigger>
              <TabsTrigger value="7D">7D ({timeFilteredCounts['7D']})</TabsTrigger>
              <TabsTrigger value="30D">30D ({timeFilteredCounts['30D']})</TabsTrigger>
              <TabsTrigger value="1M">1M ({timeFilteredCounts['1M']})</TabsTrigger>
              <TabsTrigger value="All Time">All Time ({timeFilteredCounts['All Time']})</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchLoans} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
          <TabsContent value={activeTab} className="mt-0">
             <div className="rounded-md border">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan Code</TableHead>
                    <TableHead>App Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>CCY</TableHead>
                    <TableHead className="text-right">Disbursed</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Interest Date</TableHead>
                    <TableHead>Principal Date</TableHead>
                    <TableHead>Interest Payment Term</TableHead>
                    <TableHead>Principal Repayment Term</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={17}>
                          <Skeleton className="h-[130px] w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan) => {
                      const itrPaid = loan.itr_pay_cycle;
                      const itrUnpaid = loan.itr_num_cycle - loan.itr_pay_cycle;
                      const prinPaid = loan.prin_pay_cycle;
                      const prinUnpaid = loan.prin_num_cycle - loan.prin_pay_cycle;
                      const isPendingDisbursement = loan.status__code === 'P';
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
                          {daysRemaining !== null && daysRemaining >= 0 && (
                            <div className="text-green-600">({daysRemaining + 1}D)</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{formatDateString(loan.itr_next_date)}</div>
                          {loan.itr_next_amount > 0 && (
                            <div className="text-muted-foreground">{currencyFormatter.format(loan.itr_next_amount)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{formatDateString(loan.prin_next_date)}</div>
                          {loan.prin_next_amount > 0 && (
                            <div className="text-muted-foreground">{currencyFormatter.format(loan.prin_next_amount)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isPendingDisbursement ? null : (
                            <div className="flex items-center gap-1">
                              {typeof itrPaid === 'number' && <Badge variant="secondary" className="bg-blue-100 text-blue-800">{itrPaid}</Badge>}
                              {typeof itrUnpaid === 'number' && <Badge>{itrUnpaid}</Badge>}
                              {loan.itr_ovd_cycle > 0 && <Badge variant="destructive">{loan.itr_ovd_cycle}</Badge>}
                            </div>
                          )}
                        </TableCell>
                         <TableCell>
                          {isPendingDisbursement ? null : (
                            <div className="flex items-center gap-1">
                              {typeof prinPaid === 'number' && <Badge variant="secondary" className="bg-blue-100 text-blue-800">{prinPaid}</Badge>}
                              {typeof prinUnpaid === 'number' && <Badge>{prinUnpaid}</Badge>}
                              {loan.prin_ovd_cycle > 0 && <Badge variant="destructive">{loan.prin_ovd_cycle}</Badge>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{loan.collat_count}</TableCell>
                        <TableCell className="whitespace-nowrap">
                           <Badge variant={
                            loan.status__code === 'O' ? 'destructive' 
                            : 'default'
                          } className={cn({
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': loan.status__code === 'P', // Chờ giải ngân
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': loan.status__code === 'A' && loan.outstanding > 0, // còn dư nợ
                            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': (loan.status__code === 'A' && loan.outstanding === 0) || loan.status__code === 'C', // Hết dư nợ / Đã tất toán
                            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': loan.status__code === 'O', // Quá hạn
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300': loan.status__code === 'A' && loan.outstanding > 0,
                          })}>
                            {loan.status__name}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={17} className="h-24 text-center">
                        No loans found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
               <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <Input
                    type="number"
                    value={inputValue}
                    onChange={handlePageInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    className="h-9 w-16 text-center"
                    min="1"
                    max={totalPages}
                />
                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
