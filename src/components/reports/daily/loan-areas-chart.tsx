'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LoanAreasChartProps = {
    regionData: { name: string; value: number; fill: string }[];
};

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16'];

export default function LoanAreasChart({ regionData }: LoanAreasChartProps) {
    const dataWithFill = regionData.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
    }))
    return (
       <PieChartCard 
            title="Loan Areas" 
            data={dataWithFill} 
            legendLayout="vertical" 
            legendAlign="right" 
            legendVerticalAlign="middle" 
            legendWrapperStyle={{ fontSize: '12px' }}
        />
    );
}
