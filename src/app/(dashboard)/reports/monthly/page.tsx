
'use client';

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell, ComposedChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const loanRegionsData = [
    { name: 'ĐỒNG NAI', value: 400 },
    { name: 'Đào Viên', value: 300 },
    { name: 'Singapore', value: 300 },
    { name: 'Tân Bắc', value: 200 },
    { name: 'Đài Bắc', value: 278 },
    { name: 'Đài Trung', value: 189 },
    { name: 'Cần Thơ', value: 239 },
    { name: 'BẮC NINH', value: 349 },
    { name: 'HỒ CHÍ MINH', value: 400 },
];
const loanTypeData = [
  { name: 'Cầm đồ', value: 4567, fill: '#4f46e5' },
  { name: 'Tín chấp', value: 1234, fill: '#3b82f6' },
];

const applicationsByMonthData = [
  { month: 'Month 1', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 2', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 3', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 4', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 5', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 6', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 7', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 8', '1. Newly Created': 257, '4. Rejected': 10 },
  { month: 'Month 9', '1. Newly Created': 181, '5. Approved': 20 },
  { month: 'Month 10', '7. Disbursed': 67 },
  { month: 'Month 11', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
  { month: 'Month 12', '1. Newly Created': 0, '2. Pending Review': 0, '3. Request More Info': 0, '4. Rejected': 0, '5. Approved': 0, '6. Contract signed': 0, '7. Disbursed': 0 },
];

const loanAmountByMonthData = [
    { month: 'Month 1', 'Loan Amount': 0 },
    { month: 'Month 2', 'Loan Amount': 0 },
    { month: 'Month 3', 'Loan Amount': 0 },
    { month: 'Month 4', 'Loan Amount': 0 },
    { month: 'Month 5', 'Loan Amount': 0 },
    { month: 'Month 6', 'Loan Amount': 0 },
    { month: 'Month 7', 'Loan Amount': 0 },
    { month: 'Month 8', 'Loan Amount': 600000000 },
    { month: 'Month 9', 'Loan Amount': 350000000 },
    { month: 'Month 10', 'Loan Amount': 100000000 },
    { month: 'Month 11', 'Loan Amount': 0 },
    { month: 'Month 12', 'Loan Amount': 0 },
];

const applicationSourcesData = [
    { month: 'Month 1', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 2', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 3', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 4', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 5', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 6', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 7', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 8', Website: 257 },
    { month: 'Month 9', Website: 181 },
    { month: 'Month 10', Website: 65 },
    { month: 'Month 11', Apps: 0, CTV: 0, Website: 0 },
    { month: 'Month 12', Apps: 0, CTV: 0, Website: 0 },
];


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#a4de6c', '#d0ed57', '#a4c8e0', '#d8a4e0'];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export default function MonthlyReportPage() {
  const [year, setYear] = useState('2025');

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">2. Monthly</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Monthly Loan Report for the Year
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Total Number of Loans</CardTitle></CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-blue-600">57</p>
                <p className='text-xs text-muted-foreground'>(Average 4.8 loans/month)</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Total Loan Amount</CardTitle></CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-green-600">{currencyFormatter.format(1510300000)}</p>
                <p className="text-xs text-muted-foreground">Avg 125.8M ₫ /month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Total Commission</CardTitle></CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(600000)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Select Year</CardTitle></CardHeader>
            <CardContent>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
            </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Applications by Month and Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationsByMonthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis label={{ value: 'applications', angle: -90, position: 'insideLeft' }} fontSize={12} />
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '10px'}} iconSize={10} />
                        <Bar dataKey="1. Newly Created" stackId="a" fill="#3b82f6" />
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
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Loan Amount by Month</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={loanAmountByMonthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis 
                            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
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
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationSourcesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12}/>
                        <YAxis label={{ value: 'applications', angle: -90, position: 'insideLeft' }} fontSize={12} />
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}} iconSize={10}/>
                        <Bar dataKey="Apps" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="CTV" stackId="a" fill="#f97316" />
                        <Bar dataKey="Website" stackId="a" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Loan Regions</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                        <Pie data={loanRegionsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                            {loanRegionsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '10px'}} iconSize={10} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Loan Type Ratio This Year</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                        <Pie data={loanTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                            {loanTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '12px'}} iconSize={10}/>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    

    