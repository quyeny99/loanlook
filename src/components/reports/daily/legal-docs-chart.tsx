'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LegalDocsChartProps = {
    paperData: { name: string; value: number; fill: string }[];
};

export default function LegalDocsChart({ paperData }: LegalDocsChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Legal Document Types</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={paperData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label >
                            {paperData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
