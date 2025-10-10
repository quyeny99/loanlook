
'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LoanRegionsChartProps = {
    data: { name: string; value: number; fill: string }[];
};

export default function LoanRegionsChart({ data }: LoanRegionsChartProps) {
    return (
        <PieChartCard
            title="Loan Regions"
            data={data}
            legendLayout="vertical"
            legendAlign="right"
            legendVerticalAlign="middle"
            legendWrapperStyle={{ fontSize: '12px' }}
        />
    );
}
