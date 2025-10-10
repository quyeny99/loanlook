
'use client';

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Application } from '@/lib/data';
import { getMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#a4de6c', '#d0ed57', '#a4c8e0', '#d8a4e0'];

const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

export default function MonthlyReportPage() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => String(startYear + i));
  
  const [year, setYear] = useState(String(currentYear));
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async (selectedYear: string) => {
    setLoading(true);
    try {
      const filter = encodeURIComponent(JSON.stringify({ "create_time__year": parseInt(selectedYear) }));
      const url = `https://api.y99.vn/data/Application/?sort=-id&values=id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__disbursement&filter=${filter}&page=-1&login=372`;
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
    fetchApplications(year);
  }, [year, fetchApplications]);

  const reportData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthlyData = months.map(month => {
        const monthApps = applications.filter(app => app.create_time && getMonth(new Date(app.create_time)) === month);
        return {
            month: `Month ${month + 1}`,
            apps: monthApps,
            '1. Newly Created': monthApps.filter(a => a.status === 1).length,
            '2. Pending Review': monthApps.filter(a => a.status === 2).length,
            '3. Request More Info': monthApps.filter(a => a.status === 3).length,
            '4. Rejected': monthApps.filter(a => a.status === 4).length,
            '5. Approved': monthApps.filter(a => a.status === 5).length,
            '6. Contract signed': monthApps.filter(a => a.status === 6).length,
            '7. Disbursed': monthApps.filter(a => a.status === 7).length,
            'Loan Amount': monthApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0),
            'Apps': monthApps.filter(a => a.source__name === 'Apps').length,
            'CTV': monthApps.filter(a => a.source__name === 'CTV').length,
            'Website': monthApps.filter(a => a.source__name === 'Website').length,
        }
    });

    const disbursedApps = applications.filter(app => app.status === 7);
    const totalLoans = disbursedApps.length;
    const totalLoanAmount = disbursedApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0);
    const totalCommission = applications.reduce((acc, app) => acc + (app.commission || 0), 0);

    const allLoanRegions = disbursedApps.reduce((acc, app) => {
        const name = app.province || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    const loanRegionsData = allLoanRegions
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    const loanTypeData = applications.reduce((acc, app) => {
        const name = app.product__type__en || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1, fill: COLORS[acc.length % COLORS.length] });
        }
        return acc;
    }, [] as { name: string; value: number; fill: string }[]);


    return {
        totalLoans,
        totalLoanAmount,
        totalCommission,
        monthlyData,
        loanRegionsData,
        loanTypeData,
    };
  }, [applications]);


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
          <Button variant="ghost" size="icon" onClick={() => fetchApplications(year)} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Total Number of Loans</CardTitle></CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalLoans}</p>
                <p className='text-xs text-muted-foreground'>(Average { (reportData.totalLoans / 12).toFixed(1) } loans/month)</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="p-6"><CardTitle className='text-sm font-medium'>Total Loan Amount</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0">
                <p className="text-2xl font-bold text-green-600">{currencyFormatter.format(reportData.totalLoanAmount)}</p>
                <p className="text-xs text-muted-foreground">Avg {currencyFormatter.format(reportData.totalLoanAmount / 12)} /month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Total Commission</CardTitle></CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-red-600">{currencyFormatter.format(reportData.totalCommission)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className='text-sm font-medium'>Select Year</CardTitle></CardHeader>
            <CardContent>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <BarChart data={reportData.monthlyData}>
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
                     <BarChart data={reportData.monthlyData}>
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
        <Card className='lg:col-span-1'>
            <CardHeader>
                <CardTitle>Application Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12}/>
                        <YAxis label={{ value: 'applications', angle: -90, position: 'insideLeft' }} fontSize={12} allowDecimals={false} />
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
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={reportData.loanRegionsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={false}>
                            {reportData.loanRegionsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Loan Type Ratio This Year</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={reportData.loanTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {reportData.loanTypeData.map((entry, index) => (
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

    
    
    
