'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';
import { CHART_COLORS } from '@/lib/constants';

type LoanAreasChartProps = {
    regionData: { name: string; value: number; fill: string }[];
};

export default function LoanAreasChart({ regionData }: LoanAreasChartProps) {
    const dataWithFill = regionData.map((item, index) => ({
        ...item,
        fill: CHART_COLORS[index % CHART_COLORS.length]
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
