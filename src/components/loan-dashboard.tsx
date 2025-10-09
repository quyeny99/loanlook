"use client";

import * as React from 'react';
import { isToday, subDays, isWithinInterval } from 'date-fns';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';

import { loansData, type Loan } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SortableKey = keyof Loan | 'customer';

export default function LoanDashboard() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('All Time');
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableKey; direction: 'ascending' | 'descending' } | null>({ key: 'dueDate', direction: 'ascending' });
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedLoans = React.useMemo(() => {
    if (!isClient) {
      // Return a sliced version for SSR to avoid large initial payload
      return loansData.slice(0, 5); 
    }
      
    const now = new Date();
    let filteredLoans: Loan[];

    switch (activeTab) {
      case 'Today':
        filteredLoans = loansData.filter(loan => isToday(loan.loanDate));
        break;
      case '1D':
        filteredLoans = loansData.filter(loan => isWithinInterval(loan.loanDate, { start: subDays(now, 1), end: now }));
        break;
      case '7D':
        filteredLoans = loansData.filter(loan => isWithinInterval(loan.loanDate, { start: subDays(now, 7), end: now }));
        break;
      case '30D':
        filteredLoans = loansData.filter(loan => isWithinInterval(loan.loanDate, { start: subDays(now, 30), end: now }));
        break;
      case 'All Time':
      default:
        filteredLoans = loansData;
        break;
    }

    if (searchTerm) {
      filteredLoans = filteredLoans.filter(loan =>
        loan.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.applicationCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortConfig !== null) {
      filteredLoans.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'customer') {
          aValue = a.customer.name;
          bValue = b.customer.name;
        } else {
          aValue = a[sortConfig.key as keyof Loan];
          bValue = b[sortConfig.key as keyof Loan];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredLoans;
  }, [searchTerm, activeTab, sortConfig, isClient]);

  const getSortIcon = (key: SortableKey) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />
    );
  };
  
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold font-headline">LoanLook</CardTitle>
        <CardDescription>Manage and track all your loan data in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="Today">Today</TabsTrigger>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="7D">7D</TabsTrigger>
              <TabsTrigger value="30D">30D</TabsTrigger>
              <TabsTrigger value="All Time">All Time</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value={activeTab} className="mt-0">
             <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('loanCode')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Loan Code{getSortIcon('loanCode')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('applicationCode')} className="px-0 hover:bg-transparent text-xs sm:text-sm">App Code{getSortIcon('applicationCode')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('customer')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Customer{getSortIcon('customer')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('product')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Product{getSortIcon('product')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('fromDate')} className="px-0 hover:bg-transparent text-xs sm:text-sm">From Date{getSortIcon('fromDate')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('toDate')} className="px-0 hover:bg-transparent text-xs sm:text-sm">To Date{getSortIcon('toDate')}</Button></TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">CCY</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Disbursed</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Outstanding</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Due Amount</TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('dueDate')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Due Date{getSortIcon('dueDate')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('interestDate')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Interest Date{getSortIcon('interestDate')}</Button></TableHead>
                    <TableHead><Button variant="ghost" onClick={() => handleSort('principalDate')} className="px-0 hover:bg-transparent text-xs sm:text-sm">Principal Date{getSortIcon('principalDate')}</Button></TableHead>
                    <TableHead className="text-xs sm:text-sm">Collateral</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedLoans.length > 0 ? (
                    processedLoans.map((loan) => (
                      <TableRow key={loan.loanCode} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">{loan.loanCode}</TableCell>
                        <TableCell>{loan.applicationCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                               <AvatarImage asChild>
                                <Image 
                                    src={loan.customer.avatarUrl} 
                                    alt={loan.customer.name} 
                                    width={32} height={32}
                                    data-ai-hint={loan.customer.avatarHint}
                                 />
                                </AvatarImage>
                              <AvatarFallback>{loan.customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{loan.customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{loan.product}</TableCell>
                        <TableCell>{dateFormatter.format(loan.fromDate)}</TableCell>
                        <TableCell>{dateFormatter.format(loan.toDate)}</TableCell>
                        <TableCell className="text-right">{loan.currency}</TableCell>
                        <TableCell className="text-right">{currencyFormatter.format(loan.disbursed)}</TableCell>
                        <TableCell className="text-right">{currencyFormatter.format(loan.outstanding)}</TableCell>
                        <TableCell className="text-right">{currencyFormatter.format(loan.dueAmount)}</TableCell>
                        <TableCell>{dateFormatter.format(loan.dueDate)}</TableCell>
                        <TableCell>{dateFormatter.format(loan.interestDate)}</TableCell>
                        <TableCell>{dateFormatter.format(loan.principalDate)}</TableCell>
                        <TableCell>{loan.collateral}</TableCell>
                        <TableCell>
                          <Badge variant={
                            loan.status === 'Paid' ? 'secondary' :
                            loan.status === 'Overdue' ? 'destructive' :
                            'default'
                          } className={cn(
                            loan.status === 'Pending' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                            loan.status === 'Paid' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                          )}>
                            {loan.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={15} className="h-24 text-center">
                        No loans found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
