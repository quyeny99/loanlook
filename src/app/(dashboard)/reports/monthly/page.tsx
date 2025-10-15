
'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Application } from '@/lib/data';
import { getMonth } from 'date-fns';
import PieChartCard from '@/components/reports/shared/pie-chart';
import SummaryCards from '@/components/reports/monthly/summary-cards';
import MonthlyStatusChart from '@/components/reports/monthly/monthly-status-chart';
import MonthlyLoanAmountChart from '@/components/reports/monthly/monthly-loan-amount-chart';
import MonthlySourceChart from '@/components/reports/monthly/monthly-source-chart';
import MonthlyFinancialsTable from '@/components/reports/monthly/monthly-financials-table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#a4de6c', '#d0ed57', '#a4c8e0', '#d8a4e0'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
      {name}
    </text>
  );
};

type LoanSchedule = {
  id: number;
  type: number;
  status: number;
  paid_amount: number;
  remain_amount: number;
  ovd_amount: number;
  itr_income: number;
  to_date: string;
};


export default function MonthlyReportPage() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => String(startYear + i));
  
  const [year, setYear] = useState(String(currentYear));
  const [applications, setApplications] = useState<Application[]>([]);
  const [loanSchedules, setLoanSchedules] = useState<LoanSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (selectedYear: string) => {
    setLoading(true);
    try {
      const appFilter = encodeURIComponent(JSON.stringify({ "create_time__year": parseInt(selectedYear) }));
      const appUrl = `https://api.y99.vn/data/Application/?sort=-id&values=id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__disbursement&filter=${appFilter}&page=-1&login=372`;
      
      const loanScheduleFilter = encodeURIComponent(JSON.stringify({ 
        "to_date__gte": `${selectedYear}-01-01`,
        "to_date__lte": `${selectedYear}-12-31`
      }));
      const loanScheduleUrl = `https://api.y99.vn/data/Loan_Schedule/?login=372&sort=to_date,-type&values=id,to_date,type,status,paid_amount,remain_amount,ovd_amount,itr_income&filter=${loanScheduleFilter}`;

      const [appResponse, loanScheduleResponse] = await Promise.all([
        fetch(appUrl),
        fetch(loanScheduleUrl)
      ]);

      const appData = await appResponse.json();
      const loanScheduleData = await loanScheduleResponse.json();

      setApplications(appData.rows || []);
      setLoanSchedules(loanScheduleData.rows || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setApplications([]);
      setLoanSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  const reportData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthlyData = months.map(month => {
        const monthApps = applications.filter(app => app.create_time && getMonth(new Date(app.create_time)) === month);
        const disbursedMonthApps = monthApps.filter(app => app.status === 7);

        const monthSchedules = loanSchedules.filter(s => s.to_date && getMonth(new Date(s.to_date)) === month);

        const collectedInterest = monthSchedules
          .filter(s => s.type === 2 && (s.paid_amount ?? 0) > 0)
          .reduce((acc, s) => acc + (s.paid_amount || 0), 0);

        const collectedFees = monthSchedules
          .filter(s => s.type === 3 && (s.paid_amount ?? 0) > 0)
          .reduce((acc, s) => acc + (s.paid_amount || 0), 0);

        const potentialInterest = monthSchedules
          .filter(s => s.type === 2)
          .reduce((acc, s) => acc + (s.remain_amount || 0), 0);
        
        const potentialFees = monthSchedules
            .filter(s => s.type === 3)
            .reduce((acc, s) => acc + (s.remain_amount || 0), 0);

        const overdueDebt = monthSchedules
          .reduce((acc, s) => acc + (s.ovd_amount || 0), 0);

        const estimatedProfit = collectedInterest + collectedFees + potentialInterest + potentialFees;

        return {
            month: `Month ${month + 1}`,
            total: monthApps.length,
            '1. Newly Created': monthApps.filter(a => a.status === 1).length,
            '2. Pending Review': monthApps.filter(a => a.status === 2).length,
            '3. Request More Info': monthApps.filter(a => a.status === 3).length,
            '4. Rejected': monthApps.filter(a => a.status === 4).length,
            '5. Approved': monthApps.filter(a => a.status === 5).length,
            '6. Contract signed': monthApps.filter(a => a.status === 6).length,
            '7. Disbursed': disbursedMonthApps.length,
            'Loan Amount': disbursedMonthApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0),
            'Apps': monthApps.filter(a => a.source__name === 'Apps').length,
            'CTV': monthApps.filter(a => a.source__name === 'CTV').length,
            'Website': monthApps.filter(a => a.source__name === 'Website').length,
            collectedFees,
            collectedInterest,
            potentialInterest,
            overdueDebt,
            estimatedProfit,
        }
    });

    const disbursedApps = applications.filter(app => app.status === 7);
    const totalLoans = disbursedApps.length;
    const totalLoanAmount = disbursedApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0);
    const totalCommission = disbursedApps.reduce((acc, app) => acc + (app.commission || 0), 0);
    

    const allLoanRegions = disbursedApps.reduce((acc, app) => {
        const name = app.province || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    let loanRegionsData = allLoanRegions;
    if (allLoanRegions.length > 10) {
        const top10 = allLoanRegions.slice(0, 10);
        const otherCount = allLoanRegions.slice(10).reduce((acc, curr) => acc + curr.value, 0);
        loanRegionsData = [...top10, { name: 'Others', value: otherCount }];
    }
    
    const loanRegionsDataWithColors = loanRegionsData.map((item, index) => ({...item, fill: COLORS[index % COLORS.length]}));
    
    const loanTypeData = disbursedApps.reduce((acc, app) => {
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
        loanRegionsData: loanRegionsDataWithColors,
        loanTypeData,
    };
  }, [applications, loanSchedules]);


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
          <Button variant="ghost" size="icon" onClick={() => fetchData(year)} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

      <SummaryCards
        reportData={reportData}
        year={year}
        setYear={setYear}
        years={years}
      />
      
      <MonthlyFinancialsTable data={reportData.monthlyData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyStatusChart data={reportData.monthlyData} />
        <MonthlyLoanAmountChart data={reportData.monthlyData} />
        <MonthlySourceChart data={reportData.monthlyData} />
        <PieChartCard 
          title="Loan Regions" 
          data={reportData.loanRegionsData} 
          label={renderCustomizedLabel} 
          showLegend={false}
          labelLine={true}
        />
        <PieChartCard 
            title="Loan Type Ratio" 
            data={reportData.loanTypeData} 
            legendLayout="vertical" 
            legendAlign="right" 
            legendVerticalAlign="middle" 
            legendWrapperStyle={{fontSize: '12px', iconSize: 10}} 
        />
      </div>

    </div>
  );
}
