'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

type SummaryCardsProps = {
    reportData: {
        totalApplications: number;
        totalRejected: number;
        loanAmount: number;
        disbursedCount: number;
        totalCommission: number;
        averageLoanTerm: number;
        commissionCount: number;
        collectedFees: number;
        collectedInterest: number;
        potentialInterest: number;
        overdueDebt: number;
        estimatedProfit: number;
    };
    collectedAmount: {
        total: number;
        count: number;
    };
    date: Date;
    setDate: (date: Date) => void;
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {});

export default function SummaryCards({ reportData, collectedAmount, date, setDate }: SummaryCardsProps) {
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{reportData.totalApplications}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total rejected</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-600">{reportData.totalRejected}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">{reportData.disbursedCount}</div>
                        <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(reportData.loanAmount)} ₫</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Collected Amount</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">{collectedAmount.count}</div>
                        <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(collectedAmount.total)} ₫</p>
                    </div>
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
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">{reportData.commissionCount}</div>
                        <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(reportData.totalCommission)} ₫</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Collected Fees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-indigo-500">{currencyFormatter.format(reportData.collectedFees)} ₫</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Collected & Potential Interest</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-bold text-teal-500">{currencyFormatter.format(reportData.collectedInterest)} ₫</p>
                    <p className="text-sm text-muted-foreground">Potential: {currencyFormatter.format(reportData.potentialInterest)} ₫</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Overdue Debt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-500">{currencyFormatter.format(reportData.overdueDebt)} ₫</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-purple-500">{currencyFormatter.format(reportData.estimatedProfit)} ₫</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(day) => day && setDate(day)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>
        </div>
    )
}
