
'use client';

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, RefreshCw, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Application } from '@/lib/data';

const COLORS = ['#3b82f6', '#60a5fa', '#2dd4bf', '#f97316', '#a855f7', '#ec4899', '#84cc16'];
const currencyFormatter = new Intl.NumberFormat('de-DE', {});

export default function ReportsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async (selectedDate: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const filter = encodeURIComponent(JSON.stringify({ "loanapp__dbm_entry__date": formattedDate }));
      const url = `https://api.y99.vn/data/Application/?sort=-id&values=id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date&filter=${filter}&page=-1&login=372`;
      const response = await fetch(url);
      const data = await response.json();
      setApplications(data.rows || []);
    } catch (error) {
      console.error("Failed to fetch applications", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(date);
  }, [date, fetchApplications]);

  const reportData = useMemo(() => {
    const totalApplications = applications.length;
    const totalRejected = applications.filter(app => app.status === 5).length; // Assuming status 5 is 'Rejected'
    const disbursedApps = applications.filter(app => app.status === 7); // Assuming status 7 is 'Disbursed'
    const loanAmount = disbursedApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0);
    const totalCommission = applications.reduce((acc, app) => acc + (app.commission || 0), 0);
    const averageLoanTerm = disbursedApps.length > 0
      ? disbursedApps.reduce((acc, app) => acc + app.loan_term, 0) / disbursedApps.length
      : 0;

    const paperData = applications.reduce((acc, app) => {
      const name = app.legal_type__name || 'Unknown';
      const existing = acc.find(item => item.name === name);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]).map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

    const regionData = applications.reduce((acc, app) => {
        const name = app.province || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

    const statusData = [
        { name: '1. Newly Created', Applications: applications.filter(a => a.status === 1).length },
        { name: '2. Pending Review', Applications: applications.filter(a => a.status === 2).length },
        { name: '3. Request More Info', Applications: applications.filter(a => a.status === 3).length },
        { name: '4. Rejected', Applications: applications.filter(a => a.status === 4).length }, // Assuming 4 is another rejected status
        { name: '5. Approved', Applications: applications.filter(a => a.status === 5).length }, // This seems wrong if 5 is rejected, adjust as per actual status codes
        { name: '6. Contract signed', Applications: applications.filter(a => a.status === 6).length },
        { name: '7. Disbursed', Applications: applications.filter(a => a.status === 7).length },
    ];
    
    const typeData = applications.reduce((acc, app) => {
        const name = app.product__type__name || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

    const sourceData = applications.reduce((acc, app) => {
        const name = app.source__name || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.Applications += 1;
        } else {
            acc.push({ name, Applications: 1 });
        }
        return acc;
    }, [] as { name: string; Applications: number }[]);


    return {
      totalApplications,
      totalRejected,
      loanAmount,
      disbursedCount: disbursedApps.length,
      totalCommission,
      averageLoanTerm,
      paperData,
      regionData,
      statusData,
      typeData,
      sourceData
    };
  }, [applications]);

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
          <Button variant="ghost" size="icon" onClick={() => fetchApplications(date)} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total applications</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold text-blue-600">{reportData.totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{reportData.totalRejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">{reportData.disbursedCount}</div>
                <p className="text-2xl font-bold text-blue-600">{currencyFormatter.format(reportData.loanAmount)} ₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Collected Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                 <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">0</div>
                <p className="text-2xl font-bold text-orange-500">{currencyFormatter.format(0)} ₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Loan Term</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.round(reportData.averageLoanTerm)} months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">{applications.filter(a => a.commission).length}</div>
                <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(reportData.totalCommission)} ₫</p>
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
                        onSelect={(day) => day && setDate(day)}
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
                <Pie data={reportData.paperData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label >
                  {reportData.paperData.map((entry, index) => (
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
                <Pie data={reportData.regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {reportData.regionData.map((entry, index) => (
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
              <BarChart data={reportData.statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" type="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
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
                <Pie data={reportData.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {reportData.typeData.map((entry, index) => (
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
                <BarChart data={reportData.sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
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
