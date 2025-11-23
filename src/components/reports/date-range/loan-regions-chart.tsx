
'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';
import { RADIAN } from '@/lib/constants';

type LoanRegionsChartProps = {
    data: { name: string; value: number; fill: string }[];
};
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = outerRadius * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
      {name}
    </text>
  );
};


export default function LoanRegionsChart({ data }: LoanRegionsChartProps) {
    return (
        <PieChartCard
            title="Loan Regions"
            data={data}
            label={renderCustomizedLabel}
            labelLine={true}
            showLegend={false}
        />
    );
}

    