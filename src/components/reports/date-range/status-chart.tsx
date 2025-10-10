
'use client';

import BarChartCard from '@/components/reports/shared/bar-chart';

type StatusChartProps = {
    data: { name: string; 'Total applications': number }[];
};

export default function StatusChart({ data }: StatusChartProps) {
    return (
        <BarChartCard
            title="Status"
            data={data}
            dataKey="Total applications"
            xAxisKey="name"
            xAxisProps={{ type: 'category', tick: { fontSize: 10 }, angle: -45, textAnchor: 'end', height: 80 }}
        />
    );
}
