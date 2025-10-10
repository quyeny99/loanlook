'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LoanTypeChartProps = {
    typeData: { name: string; value: number; fill: string }[];
};

export default function LoanTypeChart({ typeData }: LoanTypeChartProps) {
    return (
        <PieChartCard title="Loan Type Ratio" data={typeData} />
    );
}
