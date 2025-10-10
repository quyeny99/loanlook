
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type SummaryCardsProps = {
    fromDate: Date | undefined;
    setFromDate: (date: Date | undefined) => void;
    toDate: Date | undefined;
    setToDate: (date: Date | undefined) => void;
    currencyFormatter: Intl.NumberFormat;
    reportData: {
        disbursedCount: number;
        totalLoanAmount: number;
        averageLoanTerm: number;
        totalCommission: number;
    }
};

export default function SummaryCards({ fromDate, setFromDate, toDate, setToDate, currencyFormatter, reportData }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{reportData.disbursedCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{currencyFormatter.format(reportData.totalLoanAmount)} ₫</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Loan Term</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{reportData.averageLoanTerm} months</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(reportData.totalCommission)} ₫</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">From Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !fromDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fromDate ? format(fromDate, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                onSelect={setFromDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">To Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !toDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {toDate ? format(toDate, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={toDate}
                                onSelect={setToDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>
        </div>
    );
}
