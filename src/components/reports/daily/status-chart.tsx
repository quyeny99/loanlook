'use client';

import BarChartCard from '@/components/reports/shared/bar-chart';

type StatusChartProps = {
    statusData: { name: string; Applications: number }[];
};

export default function StatusChart({ statusData }: StatusChartProps) {
    return (
        <BarChartCard 
            title="Loan Application Status" 
            data={statusData} 
            dataKey="Applications" 
            xAxisKey="name"
            xAxisProps={{ type: "category", tick: { fontSize: 10 }, angle: -45, textAnchor: "end", height: 80 }}
        />
    );
}
