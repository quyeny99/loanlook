
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type MonthlyFinancialsChartProps = {
  data: {
    month: string;
    collectedFees: number;
    collectedInterest: number;
    potentialInterest: number;
    overdueDebt: number;
    estimatedProfit: number;
  }[];
};

const compactFormatter = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
const currencyFormatter = (value: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value) + ' ₫';

export default function MonthlyFinancialsChart({ data }: MonthlyFinancialsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financials</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis tickFormatter={compactFormatter} fontSize={12} />
            <Tooltip
              formatter={currencyFormatter}
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend wrapperStyle={{fontSize: '12px'}} iconSize={10} />
            <Bar dataKey="collectedFees" name="Collected Fees" fill="#8b5cf6" />
            <Bar dataKey="collectedInterest" name="Collected Interest" fill="#14b8a6" />
            <Bar dataKey="potentialInterest" name="Potential Interest" fill="#6b7280" />
            <Bar dataKey="overdueDebt" name="Overdue Debt" fill="#ef4444" />
            <Bar dataKey="estimatedProfit" name="Estimated Profit" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
