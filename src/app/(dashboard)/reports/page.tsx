

'use client';

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, RefreshCw, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const paperData = [
  { name: 'Citizen Identification Card', value: 6, fill: '#3b82f6' },
  { name: 'Passport', value: 1, fill: '#60a5fa' },
];

const regionData = [
    { name: 'Sóc Trăng - Mỹ Tú', value: 1, fill: '#3b82f6' },
    { name: 'Kiên Giang - Phú Quốc', value: 1, fill: '#60a5fa' },
    { name: 'Cao Hùng - Fengshan', value: 1, fill: '#2dd4bf' },
    { name: 'Cần Thơ - Bình Thuỷ', value: 1, fill: '#f97316' },
    { name: 'Singapore - Holland drive', value: 1, fill: '#a855f7' },
    { name: 'hà nội - hà đông', value: 1, fill: '#ec4899' },
    { name: 'hưng yên - Tiên lữ', value: 1, fill: '#84cc16' },
];

const statusData = [
  { name: '1. Newly Created', 'Applications': 3 },
  { name: '2. Pending Review', 'Applications': 1 },
  { name: '3. Request More Info', 'Applications': 1 },
  { name: '4. Rejected', 'Applications': 1 },
  { name: '5. Approved', 'Applications': 0 },
  { name: '6. Contract signed', 'Applications': 0 },
  { name: '7. Disbursed', 'Applications': 1 },
];

const typeData = [
  { name: 'Pawn loan', value: 4, fill: '#4f46e5' },
  { name: 'Unsecured loan', value: 1, fill: '#3b82f6' },
];

const sourceData = [
    { name: 'Apps', 'Applications': 0 },
    { name: 'CTV', 'Applications': 0 },
    { name: 'Website', 'Applications': 6 },
];

const COLORS = ['#3b82f6', '#60a5fa', '#2dd4bf', '#f97316', '#a855f7', '#ec4899', '#84cc16'];


const currencyFormatter = new Intl.NumberFormat('de-DE', {});


export default function ReportsPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">1. Daily</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Daily Report
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total applications</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold text-blue-600">7</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">1</div>
                <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(5000000)} ₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Collected Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">1</div>
                <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(5605885)} ₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Loan Term</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">0</div>
                <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(0)} ₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legal Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paperData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label >
                  {paperData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" type="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Number of Applications', angle: -90, position: 'insideLeft' }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Applications" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Type Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Applications', angle: -90, position: 'insideLeft' }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Applications" fill="#22c55e" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
