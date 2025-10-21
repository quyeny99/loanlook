
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SummaryCardsProps = {
    reportData: {
        totalLoans: number;
        totalLoanAmount: number;
        totalCommission: number;
        totalCollectedFees: number;
        totalCollectedInterest: number;
        totalOverdueDebt: number;
        totalCollectedServiceFees: number;
        totalRevenue: number;
        totalGrossRevenue: number;
        totalCollectedAmount: number;
        totalCollectedCount: number;
    }
    year: string;
    setYear: (year: string) => void;
    years: string[];
    isAdmin: boolean;
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});


export default function SummaryCards({ reportData, year, setYear, years, isAdmin }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <Card>
                <CardHeader><CardTitle className='text-sm font-medium'>Total Number of Loans</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{reportData.totalLoans}</p>
                    <p className='text-xs text-muted-foreground'>(Average { (reportData.totalLoans / 12).toFixed(1) } loans/month)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="p-6"><CardTitle className='text-sm font-medium'>Total Loan Amount</CardTitle></CardHeader>
                <CardContent className="p-6 pt-0">
                    <p className="text-2xl font-bold text-green-600">{currencyFormatter.format(reportData.totalLoanAmount)}</p>
                    <p className="text-xs text-muted-foreground">Avg {currencyFormatter.format(reportData.totalLoanAmount / 12)} /month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className='text-sm font-medium'>Total Commission</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(reportData.totalCommission)}</p>
                </CardContent>
            </Card>
            {isAdmin && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Collected Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-purple-500 text-white font-bold">{reportData.totalCollectedCount}</div>
                                <p className="text-2xl font-bold text-purple-500">{currencyFormatter.format(reportData.totalCollectedAmount || 0)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Collected Service Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-cyan-500">{currencyFormatter.format(reportData.totalCollectedServiceFees || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Revenue ( Fees &amp; Interest )</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(reportData.totalRevenue || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-indigo-500">{currencyFormatter.format(reportData.totalCollectedFees || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-teal-500">{currencyFormatter.format(reportData.totalCollectedInterest || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Overdue Debt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-500">{currencyFormatter.format(reportData.totalOverdueDebt || 0)}</p>
                        </CardContent>
                    </Card>
                </>
            )}
            <Card>
                <CardHeader><CardTitle className='text-sm font-medium'>Select Year</CardTitle></CardHeader>
                <CardContent>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </CardContent>
            </Card>
      </div>
    );
}

    

    