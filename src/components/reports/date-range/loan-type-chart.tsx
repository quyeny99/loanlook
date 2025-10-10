
'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LoanTypeChartProps = {
    data: { name: string; value: number; fill: string }[];
};

export default function LoanTypeChart({ data }: LoanTypeChartProps) {
    return (
        <PieChartCard
            title="List of Loans by Type"
            data={data}
        />
    );
}
