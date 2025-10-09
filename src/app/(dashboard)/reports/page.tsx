
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
  { name: 'Căn cước công dân', value: 6, fill: '#3b82f6' },
  { name: 'Hộ chiếu', value: 1, fill: '#60a5fa' },
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
  { name: 'Mới khởi tạo', 'Số đơn': 3 },
  { name: 'Chờ thẩm định', 'Số đơn': 1 },
  { name: 'Bổ sung thông tin', 'Số đơn': 1 },
  { name: 'Từ chối', 'Số đơn': 1 },
  { name: 'Đã duyệt', 'Số đơn': 0 },
  { name: 'Đã ký hợp đồng', 'Số đơn': 0 },
  { name: 'Đã giải ngân', 'Số đơn': 1 },
];

const typeData = [
  { name: 'Cầm đồ', value: 4, fill: '#4f46e5' },
  { name: 'Tín chấp', value: 1, fill: '#3b82f6' },
];

const sourceData = [
    { name: 'Apps', 'Số đơn': 0 },
    { name: 'CTV', 'Số đơn': 0 },
    { name: 'Website', 'Số đơn': 6 },
];

const COLORS = ['#3b82f6', '#60a5fa', '#2dd4bf', '#f97316', '#a855f7', '#ec4899', '#84cc16'];


const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});


export default function ReportsPage() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span>Báo cáo</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">1. Theo ngày</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Báo cáo đơn vay trong ngày
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Số đơn vay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">7</div>
                <p className="text-2xl font-bold text-blue-600">7</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Số đơn từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">1</div>
                <p className="text-2xl font-bold text-red-600">1</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Số tiền cho vay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">1</div>
                <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(5000000)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng thu nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">4</div>
                <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(5605885)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Thời hạn vay trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">6 tháng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng tiền hoa hồng</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">0</div>
                <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Chọn ngày</CardTitle>
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
            <CardTitle>Loại giấy tờ sử dụng</CardTitle>
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
            <CardTitle>Các khu vực vay</CardTitle>
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
            <CardTitle>Trạng thái đơn vay</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Số đơn" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỉ lệ hình thức vay</CardTitle>
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
            <CardTitle>Nguồn</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Số đơn" fill="#22c55e" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
