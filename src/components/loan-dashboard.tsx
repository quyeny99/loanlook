"use client";

import * as React from 'react';
import { isToday, subDays, isWithinInterval } from 'date-fns';
import { Search } from 'lucide-react';

import { loansData, type Loan } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoanDashboard() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('All Time');
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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

    return filteredLoans;
  }, [searchTerm, activeTab, isClient]);
  
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
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
                    <TableHead>Loan Code</TableHead>
                    <TableHead>App Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead className="text-right">CCY</TableHead>
                    <TableHead className="text-right">Disbursed</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Interest Date</TableHead>
                    <TableHead>Principal Date</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Status</TableHead>
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
