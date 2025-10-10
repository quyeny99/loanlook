'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MonthlyLoanAmountChartProps = {
    data: any[];
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

export default function MonthlyLoanAmountChart({ data }: MonthlyLoanAmountChartProps) {
    return (
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Loan Amount by Month</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis 
                            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}
                            label={{ value: 'Loan Amount', angle: -90, position: 'insideLeft' }}
                            fontSize={12}
                        />
                        <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
                        <Legend wrapperStyle={{fontSize: '12px'}} iconSize={10}/>
                        <Bar dataKey="Loan Amount" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
