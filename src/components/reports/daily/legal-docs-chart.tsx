'use client';

import PieChartCard from '@/components/reports/shared/pie-chart';

type LegalDocsChartProps = {
    paperData: { name: string; value: number; fill: string }[];
};

export default function LegalDocsChart({ paperData }: LegalDocsChartProps) {
    return (
       <PieChartCard title="Legal Document Types" data={paperData} />
    );
}
