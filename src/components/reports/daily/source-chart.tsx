'use client';

import BarChartCard from '@/components/reports/shared/bar-chart';

type SourceChartProps = {
    sourceData: { name: string; Applications: number }[];
};

export default function SourceChart({ sourceData }: SourceChartProps) {
    return (
        <BarChartCard 
            title="Source" 
            data={sourceData} 
            dataKey="Applications" 
            xAxisKey="name" 
        />
    );
}
