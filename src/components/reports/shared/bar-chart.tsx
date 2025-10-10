'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BarChartCardProps = {
    title: string;
    data: any[];
    dataKey: string;
    xAxisKey: string;
    className?: string;
    yAxisFormatter?: (value: any) => string;
    yAxisLabel?: { value: string; angle: number; position: 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'top' | 'bottom' | 'left' | 'right' | 'outer'; };
    allowDecimals?: boolean;
    xAxisProps?: any;
    tooltipFormatter?: (value: any, name: any, props: any) => any;
};

export default function BarChartCard({ title, data, dataKey, xAxisKey, className, yAxisFormatter, yAxisLabel, allowDecimals = false, xAxisProps = {}, tooltipFormatter }: BarChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} {...xAxisProps} />
                        <YAxis allowDecimals={allowDecimals} tickFormatter={yAxisFormatter} label={yAxisLabel} />
                        <Tooltip formatter={tooltipFormatter}/>
                        <Legend />
                        <Bar dataKey={dataKey} fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}