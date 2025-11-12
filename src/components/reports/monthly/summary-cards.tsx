
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
        totalOverdueDebtCount: number;
        totalCollectedServiceFees: number;
        totalRevenue: number;
        totalGrossRevenue: number;
        totalCollectedAmount: number;
        totalCollectedCount: number;
        totalCollectedPrincipal: number;
        totalOverdueFees: number;
        totalSettlementFees: number;
        totalRemainingAmount: number;
        totalVAT: number;
        totalInterestVAT: number;
        totalManagementFeeVAT: number;
        totalSettlementFeeVAT: number;
        outstandingLoans: number;
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
    // Use VAT amounts directly from loan_statements
    const collectedInterestVAT = reportData.totalInterestVAT || 0;
    const collectedFeeVAT = reportData.totalManagementFeeVAT || 0;
    const settlementFeeVAT = reportData.totalSettlementFeeVAT || 0;

    const totalServiceFees = reportData.totalCollectedServiceFees || 0;
    const serviceFeesExclVAT = Math.floor(totalServiceFees / 1.1);
    const vatOnServiceFees = totalServiceFees - serviceFeesExclVAT;

    const collectedFeeExcl = reportData.totalCollectedFees || 0;
    const collectedFeeGross = reportData.totalCollectedFees + collectedFeeVAT;

    const collectedInterestExcl = reportData.totalCollectedInterest || 0;
    const collectedInterestGross = reportData.totalCollectedInterest + collectedInterestVAT;

    const settlementFeeExcl = reportData.totalSettlementFees || 0;
    const settlementFeeGross = reportData.totalSettlementFees + settlementFeeVAT;
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
                            <p className="text-2xl font-bold text-cyan-500">{currencyFormatter.format(totalServiceFees)}</p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>Service Fees (excl. VAT): <span className="font-semibold text-foreground">{currencyFormatter.format(serviceFeesExclVAT)}</span></p>
                                <p>VAT Amount (10%): <span className="font-semibold text-foreground">{currencyFormatter.format(vatOnServiceFees)}</span></p>
                            </div>
                        </CardContent>
                    </Card>
            {isAdmin && (
                <>
                  
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
                            <CardTitle className="text-sm font-medium">Collected Fee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-indigo-500">{currencyFormatter.format(collectedFeeGross)}</p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>Collected Fee (excl. VAT): <span className="font-semibold text-foreground">{currencyFormatter.format(collectedFeeExcl)}</span></p>
                                <p>VAT Amount (10%): <span className="font-semibold text-foreground">{currencyFormatter.format(collectedFeeVAT)}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-teal-500">{currencyFormatter.format(collectedInterestGross)}</p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>Collected Interest (excl. VAT): <span className="font-semibold text-foreground">{currencyFormatter.format(collectedInterestExcl)}</span></p>
                                <p>VAT Amount (10%): <span className="font-semibold text-foreground">{currencyFormatter.format(collectedInterestVAT)}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Principal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">{currencyFormatter.format(reportData.totalCollectedPrincipal || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Overdue Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-amber-600">{currencyFormatter.format(reportData.totalOverdueFees || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Settlement Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-amber-700">{currencyFormatter.format(settlementFeeGross)}</p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>Settlement Fees (excl. VAT): <span className="font-semibold text-foreground">{currencyFormatter.format(settlementFeeExcl)}</span></p>
                                <p>VAT Amount (10%): <span className="font-semibold text-foreground">{currencyFormatter.format(settlementFeeVAT)}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected Remaining Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-cyan-600">{currencyFormatter.format(reportData.totalRemainingAmount || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Collected VAT</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-pink-600">{currencyFormatter.format(reportData.totalVAT || 0)}</p>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>VAT Fee: <span className="font-semibold text-foreground">{currencyFormatter.format(collectedFeeVAT)} </span></p>
                                <p>VAT Interest: <span className="font-semibold text-foreground">{currencyFormatter.format(collectedInterestVAT)} </span></p>
                                <p>VAT Settlement Fees: <span className="font-semibold text-foreground">{currencyFormatter.format(settlementFeeVAT)} </span></p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-600">{currencyFormatter.format(reportData.outstandingLoans || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Overdue Debt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-500 text-white font-bold">{reportData.totalOverdueDebtCount}</div>
                                <p className="text-2xl font-bold text-red-500">{currencyFormatter.format(reportData.totalOverdueDebt || 0)}</p>
                            </div>
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

    

    