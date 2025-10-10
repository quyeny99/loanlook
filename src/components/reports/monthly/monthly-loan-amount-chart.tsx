
'use client';

import BarChartCard from '@/components/reports/shared/bar-chart';

type MonthlyLoanAmountChartProps = {
    data: any[];
};

const currencyFormatter = (value: number) => new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(value);

const compactFormatter = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);

export default function MonthlyLoanAmountChart({ data }: MonthlyLoanAmountChartProps) {
    return (
        <BarChartCard
            title="Loan Amount by Month"
            data={data}
            dataKey="Loan Amount"
            xAxisKey="month"
            yAxisFormatter={compactFormatter}
            yAxisLabel={{ value: 'Loan Amount', angle: -90, position: 'insideLeft', offset: -10 }}
            tooltipFormatter={currencyFormatter}
            className='lg:col-span-1'
            barProps={{ name: "Loan Amount" }}
            showTotal={false}
        />
    );
}
