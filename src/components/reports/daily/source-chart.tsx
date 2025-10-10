'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SourceChartProps = {
    sourceData: { name: string; Applications: number }[];
};

export default function SourceChart({ sourceData }: SourceChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Source</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Applications" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
