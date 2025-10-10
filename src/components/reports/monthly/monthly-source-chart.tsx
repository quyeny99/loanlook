'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MonthlySourceChartProps = {
    data: any[];
};

export default function MonthlySourceChart({ data }: MonthlySourceChartProps) {
    return (
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12}/>
                        <YAxis label={{ value: 'applications', angle: -90, position: 'insideLeft' }} fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}} iconSize={10}/>
                        <Bar dataKey="Apps" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="CTV" stackId="a" fill="#f97316" />
                        <Bar dataKey="Website" stackId="a" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
