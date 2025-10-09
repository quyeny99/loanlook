"use client";

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { isToday, subDays, subMonths, isWithinInterval, parseISO } from 'date-fns';

import { type Loan } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoanFilters } from '@/components/loan-filters';
import { LoanTable } from '@/components/loan-table';
import { LoanPagination } from '@/components/loan-pagination';

const ITEMS_PER_PAGE = 15;

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

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
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
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <LoanFilters
              timeFilteredCounts={timeFilteredCounts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fetchLoans={fetchLoans}
              loading={loading}
            />
            <TabsContent value={activeTab} className="mt-0">
               <LoanTable
                 loans={paginatedLoans}
                 loading={loading}
                 itemsPerPage={ITEMS_PER_PAGE}
                 currencyFormatter={currencyFormatter}
                 formatDateString={formatDateString}
               />
              <LoanPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
