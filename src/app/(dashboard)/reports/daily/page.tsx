
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { type Application } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import SummaryCards from '@/components/reports/daily/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanAreasChart from '@/components/reports/daily/loan-areas-chart';
import StatusChart from '@/components/reports/daily/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/daily/source-chart';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16'];
const API_BASE_URL = 'https://api.y99.vn/data/Application/';
const API_VALUES = 'id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date';
const LOGIN_PARAM = 'login=372';

type LoanSchedule = {
  id: number;
  type__en: string;
  paid_amount: number;
  remain_amount: number;
  ovd_amount: number;
  amount: number;
  itr_income: number;
};


export default function ReportsPage() {
  const [date, setDate] = useState<Date>(subDays(new Date(), 1));
  const [createdApplications, setCreatedApplications] = useState<Application[]>([]);
  const [disbursedApplications, setDisbursedApplications] = useState<Application[]>([]);
  const [loanSchedules, setLoanSchedules] = useState<LoanSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState({ total: 0, count: 0 });

  const fetchData = useCallback(async (selectedDate: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const createTimeFilter = encodeURIComponent(JSON.stringify({ "create_time__date": formattedDate }));
      const disbursementDateFilter = encodeURIComponent(JSON.stringify({ "loanapp__dbm_entry__date": formattedDate }));
      
      const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${createTimeFilter}&page=-1&${LOGIN_PARAM}`;
      const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${disbursementDateFilter}&page=-1&${LOGIN_PARAM}`;
      const collectedAmountUrl = `https://api.y99.vn/data/Internal_Entry/?sort=-id&values=id,amount&filter=${encodeURIComponent(JSON.stringify({"category__code": "loan-payment","date": formattedDate}))}&page=-1&${LOGIN_PARAM}`;
      const loanScheduleUrl = `https://api.y99.vn/data/Loan_Schedule/?login=372&sort=to_date,-type&values=id,type__en,reduce_amount,ovd_days,remain_amount,detail,paid_amount,paid_date,entry,entry__code,pay_amount,itr_income,days_income,penalty_ratio,batch_date,ovd_amount,penalty_ratio,penalty_amount,code,from_date,to_date,cycle,amount,loan,type,type__code,type__name,updater,create_time,update_time,principal,cycle_days,ratio,status,status__code,status__name&filter=${encodeURIComponent(JSON.stringify({"to_date": formattedDate}))}`;

      const [createdResponse, disbursedResponse, collectedAmountResponse, loanScheduleResponse] = await Promise.all([
        fetch(createdUrl),
        fetch(disbursedUrl),
        fetch(collectedAmountUrl),
        fetch(loanScheduleUrl)
      ]);

      const createdData = await createdResponse.json();
      const disbursedData = await disbursedResponse.json();
      const collectedAmountData = await collectedAmountResponse.json();
      const loanScheduleData = await loanScheduleResponse.json();

      setCreatedApplications(createdData.rows || []);
      setDisbursedApplications(disbursedData.rows || []);
      setLoanSchedules(loanScheduleData.rows || []);
      
      const totalCollected = (collectedAmountData.rows || []).reduce((acc: number, entry: { amount: number }) => acc + entry.amount, 0);
      const collectedCount = (collectedAmountData.rows || []).length;
      setCollectedAmount({ total: totalCollected, count: collectedCount });

    } catch (error) {
      console.error("Failed to fetch data", error);
      setCreatedApplications([]);
      setDisbursedApplications([]);
      setLoanSchedules([]);
      setCollectedAmount({ total: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(date);
  }, [date, fetchData]);
  
  const handleRefresh = useCallback(() => {
    fetchData(date);
  }, [date, fetchData]);

  const reportData = useMemo(() => {
    const totalApplications = createdApplications.length;
    const totalRejected = createdApplications.filter(app => app.status === 4).length; 
    
    const disbursedApps = disbursedApplications.filter(app => app.status === 7);
    const loanAmount = disbursedApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0);
    const totalCommission = createdApplications.reduce((acc, app) => acc + (app.commission || 0), 0);
    const averageLoanTerm = disbursedApps.length > 0
      ? disbursedApps.reduce((acc, app) => acc + (app.approve_term || 0), 0) / disbursedApps.length
      : 0;
    const commissionCount = createdApplications.filter(app => app.commission).length;

    const paperData = [
        { name: 'Căn cước công dân', value: 0, fill: '#3b82f6' },
        { name: 'Hộ chiếu', value: 0, fill: '#a855f7' }
    ];
    disbursedApplications.forEach(app => {
        const name = app.legal_type__name || 'Unknown';
        const existing = paperData.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        }
    });

    const regionData = disbursedApplications.reduce((acc, app) => {
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
        { name: '1. Newly Created', Applications: createdApplications.filter(a => a.status === 1).length },
        { name: '2. Pending Review', Applications: createdApplications.filter(a => a.status === 2).length },
        { name: '3. Request More Info', Applications: createdApplications.filter(a => a.status === 3).length },
        { name: '4. Rejected', Applications: createdApplications.filter(a => a.status === 4).length },
        { name: '5. Approved', Applications: createdApplications.filter(a => a.status === 5).length },
        { name: '6. Contract signed', Applications: createdApplications.filter(a => a.status === 6).length },
        { name: '7. Disbursed', Applications: createdApplications.filter(a => a.status === 7).length },
    ];
    
    const typeData = disbursedApplications.reduce((acc, app) => {
        const name = app.product__type__en || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));


    const sourceData = [
        { name: 'Apps', Applications: 0 },
        { name: 'CTV', Applications: 0 },
        { name: 'Website', Applications: 0 },
    ];
    createdApplications.forEach(app => {
        const source = sourceData.find(s => s.name === app.source__name);
        if (source) {
            source.Applications += 1;
        }
    });
    
    const collectedFees = loanSchedules
      .filter(s => s.type__en === 'Fee')
      .reduce((acc, s) => acc + (s.paid_amount || 0), 0);
      
    const collectedInterest = loanSchedules
      .filter(s => s.type__en === 'Interest')
      .reduce((acc, s) => acc + (s.paid_amount || 0), 0);

    const potentialInterest = loanSchedules
      .filter(s => s.type__en === 'Interest')
      .reduce((acc, s) => acc + (s.remain_amount || 0), 0);

    const overdueDebt = loanSchedules.reduce((acc, s) => acc + (s.ovd_amount || 0), 0);
    
    const estimatedProfit = loanSchedules.reduce((acc, s) => acc + (s.itr_income || 0), 0);


    return {
      totalApplications,
      totalRejected,
      loanAmount,
      disbursedCount: disbursedApps.length,
      totalCommission,
      averageLoanTerm: Math.round(averageLoanTerm),
      paperData,
      regionData,
      statusData,
      typeData,
      sourceData,
      commissionCount,
      collectedFees,
      collectedInterest,
      potentialInterest,
      overdueDebt,
      estimatedProfit
    };
  }, [createdApplications, disbursedApplications, loanSchedules]);

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">1. Daily</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Daily Report
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

      <SummaryCards
        reportData={reportData}
        collectedAmount={collectedAmount}
        date={date}
        setDate={setDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LegalDocTypeChart data={reportData.paperData} />
        <LoanAreasChart regionData={reportData.regionData} />
        <StatusChart statusData={reportData.statusData} />
        <LoanTypeChart typeData={reportData.typeData} />
        <SourceChart sourceData={reportData.sourceData} />
      </div>
    </div>
  );
}
