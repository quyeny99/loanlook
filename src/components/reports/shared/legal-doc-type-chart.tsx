'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LegalDocTypeChartProps = {
    data: { name: string; value: number; fill: string }[];
};

export default function LegalDocTypeChart({ data }: LegalDocTypeChartProps) {
    return (
        <PieChartCard
            title="Legal Document Type"
            data={data}
        />
    );
}
