
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PieChartCardProps = {
    title: string;
    data: { name: string; value: number; fill: string }[];
    showLegend?: boolean;
    legendLayout?: "horizontal" | "vertical";
    legendAlign?: "left" | "center" | "right";
    legendVerticalAlign?: "top" | "middle" | "bottom";
    legendWrapperStyle?: React.CSSProperties;
    label?: boolean | ((props: any) => React.ReactNode);
    labelLine?: boolean;
    legendIconSize?: number;
};

export default function PieChartCard({ title, data, showLegend = true, legendLayout, legendAlign, legendVerticalAlign, legendWrapperStyle, label = true, labelLine = true, legendIconSize }: PieChartCardProps) {
    const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title} ({totalValue})</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={label} labelLine={labelLine}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        {showLegend && <Legend layout={legendLayout} align={legendAlign} verticalAlign={legendVerticalAlign} wrapperStyle={legendWrapperStyle} iconSize={legendIconSize} />}
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
