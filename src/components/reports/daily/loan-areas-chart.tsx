'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LoanAreasChartProps = {
    regionData: { name: string; value: number; fill: string }[];
};

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16'];

export default function LoanAreasChart({ regionData }: LoanAreasChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loan Areas</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {regionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
