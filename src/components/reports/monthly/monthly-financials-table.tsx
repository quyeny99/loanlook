

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MonthlyFinancialsTableProps = {
  data: {
    month: string;
    collectedFees: number;
    potentialFees: number;
    collectedInterest: number;
    potentialInterest: number;
    overdueDebt: number;
    estimatedProfit: number;
  }[];
};

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default function MonthlyFinancialsTable({ data }: MonthlyFinancialsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financials</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Collected Fees</TableHead>
              <TableHead className="text-right">Potential Fees</TableHead>
              <TableHead className="text-right">Collected Interest</TableHead>
              <TableHead className="text-right">Potential Interest</TableHead>
              <TableHead className="text-right">Overdue Debt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((monthData) => (
              <TableRow key={monthData.month}>
                <TableCell className="font-medium">{monthData.month}</TableCell>
                <TableCell className="text-right text-indigo-500">{currencyFormatter.format(monthData.collectedFees)}</TableCell>
                 <TableCell className="text-right text-indigo-300">{currencyFormatter.format(monthData.potentialFees)}</TableCell>
                <TableCell className="text-right text-teal-500">{currencyFormatter.format(monthData.collectedInterest)}</TableCell>
                <TableCell className="text-right text-gray-500">{currencyFormatter.format(monthData.potentialInterest)}</TableCell>
                <TableCell className="text-right text-red-500">{currencyFormatter.format(monthData.overdueDebt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
