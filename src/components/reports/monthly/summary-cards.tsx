'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SummaryCardsProps = {
    reportData: {
        totalLoans: number;
        totalLoanAmount: number;
        totalCommission: number;
    }
    year: string;
    setYear: (year: string) => void;
    years: string[];
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});


export default function SummaryCards({ reportData, year, setYear, years }: SummaryCardsProps) {
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
