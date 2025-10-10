
'use client';

import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';

type LegalDocTypeChartProps = {
    data: { name: string; value: number; fill: string }[];
};

export default function LegalDocTypeChartWrapper({ data }: LegalDocTypeChartProps) {
    return (
        <LegalDocTypeChart
            data={data}
        />
    );
}
