
'use client';

import BarChartCard from '@/components/reports/shared/bar-chart';

type SourceChartProps = {
    data: { name: string; 'Total applications': number }[];
};

export default function SourceChart({ data }: SourceChartProps) {
    return (
        <BarChartCard
            className="lg:col-span-2"
            title="Source"
            data={data}
            dataKey="Total applications"
            xAxisKey="name"
            barProps={{ fill: '#22c55e' }}
        />
    );
}
