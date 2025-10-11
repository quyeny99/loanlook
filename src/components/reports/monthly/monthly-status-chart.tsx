
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type MonthlyStatusChartProps = {
    data: any[];
};

export default function MonthlyStatusChart({ data }: MonthlyStatusChartProps) {
    const totalApplications = data.reduce((acc, month) => acc + month.total, 0);

    return (
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Applications by Month and Status ({totalApplications})</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis label={{ value: 'applications', angle: -90, position: 'insideLeft' }} fontSize={12} />
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '10px'}} iconSize={10} />
                        <Bar dataKey="1. Newly Created" stackId="a" fill="#3b82f6" >
                            <LabelList dataKey="total" position="top" fill="#000" fontSize={12} />
                        </Bar>
                        <Bar dataKey="2. Pending Review" stackId="a" fill="#60a5fa" />
                        <Bar dataKey="3. Request More Info" stackId="a" fill="#2dd4bf" />
                        <Bar dataKey="4. Rejected" stackId="a" fill="#f97316" />
                        <Bar dataKey="5. Approved" stackId="a" fill="#a855f7" />
                        <Bar dataKey="6. Contract signed" stackId="a" fill="#ec4899" />
                        <Bar dataKey="7. Disbursed" stackId="a" fill="#84cc16" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
