
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
        totalRevenue: number;
        totalCollectedAmount: number;
        totalGrossRevenue: number;
        totalCollectedPrincipal: number;
        totalOverdueFees: number;
        totalSettlementFees: number;
        totalRemainingAmount: number;
        totalVAT: number;
    };
    collectedAmount: {
        total: number;
        count: number;
    };
    date: Date;
    setDate: (date: Date) => void;
    isAdmin: boolean;
    collectedServiceFees: number;
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {});

export default function SummaryCards({ reportData, collectedAmount, date, setDate, isAdmin, collectedServiceFees }: SummaryCardsProps) {
    
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
                            <CardTitle className="text-sm font-medium">Total Collected Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">{collectedAmount.count}</div>
                                <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(reportData.totalCollectedAmount)} ₫</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Collected Service Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-500">{currencyFormatter.format(collectedServiceFees)} ₫</p>
                        </CardContent>
                    </Card>
            {isAdmin && (
                <>
                  
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Revenue ( Fees &amp; Interest )</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(reportData.totalRevenue || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-indigo-500">{currencyFormatter.format(reportData.collectedFees || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-teal-500">{currencyFormatter.format(reportData.collectedInterest || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Principal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">{currencyFormatter.format(reportData.totalCollectedPrincipal || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Overdue Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-amber-600">{currencyFormatter.format(reportData.totalOverdueFees || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Settlement Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-amber-700">{currencyFormatter.format(reportData.totalSettlementFees || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Remaining Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-cyan-600">{currencyFormatter.format(reportData.totalRemainingAmount || 0)} ₫</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected VAT</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-pink-600">{currencyFormatter.format(reportData.totalVAT || 0)} ₫</p>
                        </CardContent>
                    </Card>
                </>
            )}
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
