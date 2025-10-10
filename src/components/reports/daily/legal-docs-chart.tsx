'use client';

import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';

type LegalDocsChartProps = {
    paperData: { name: string; value: number; fill: string }[];
};

export default function LegalDocsChart({ paperData }: LegalDocsChartProps) {
    return (
       <LegalDocTypeChart data={paperData} />
    );
}
