
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, startOfMonth, isBefore, isWithinInterval, parseISO } from 'date-fns';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryCards from '@/components/reports/date-range/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanRegionsChart from '@/components/reports/date-range/loan-regions-chart';
import StatusChart from '@/components/reports/date-range/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/date-range/source-chart';
import { type Application } from '@/lib/data';
import { adjustments } from '@/lib/constants';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const currencyFormatter = new Intl.NumberFormat('de-DE', {});
const API_BASE_URL = 'https://api.y99.vn/data/Application/';
const API_VALUES = 'id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date';
const LOAN_SCHEDULE_API_VALUES = ['id','type','status','paid_amount','remain_amount','ovd_amount','itr_income','to_date','pay_amount', 'detail'];

type LoanSchedule = {
  id: number;
  type: number;
  status: number;
  paid_amount: number;
  remain_amount: number;
  ovd_amount: number;
  itr_income: number;
  to_date: string;
  pay_amount: number;
  detail: {
      paid: number;
      time: string;
      pay_amount: number;
  }[];
};


export default function DateRangeReportsPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [createdApplications, setCreatedApplications] = useState<Application[]>([]);
  const [disbursedApplications, setDisbursedApplications] = useState<Application[]>([]);
  const [interestSchedules, setInterestSchedules] = useState<LoanSchedule[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<LoanSchedule[]>([]);
  const [overdueDebtSchedules, setOverdueDebtSchedules] = useState<LoanSchedule[]>([]);
  const [collectedServiceFees, setCollectedServiceFees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setLoginId(id);
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo && userInfo.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to parse user info", error)
      }
    }
  }, []);

  const fetchData = useCallback(async (start?: Date, end?: Date) => {
    if (!start || !end || !loginId) return;
    setLoading(true);
    try {
      const formattedFromDate = format(start, 'yyyy-MM-dd');
      const formattedToDate = format(end, 'yyyy-MM-dd');

      const disbursementFilter = encodeURIComponent(JSON.stringify({ 
        "loanapp__dbm_entry__date__gte": formattedFromDate,
        "loanapp__dbm_entry__date__lte": formattedToDate
      }));
      const creationFilter = encodeURIComponent(JSON.stringify({ 
        "create_time__date__gte": formattedFromDate,
        "create_time__date__lte": formattedToDate
      }));

      const serviceFeesFilter = encodeURIComponent(JSON.stringify({ 
        "status": 7,
        "loanapp__dbm_entry__date__gte": formattedFromDate,
        "loanapp__dbm_entry__date__lte": formattedToDate
      }));

      const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${disbursementFilter}&page=-1&login=${loginId}`;
      const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${creationFilter}&page=-1&login=${loginId}`;
      const serviceFeesUrl = `https://api.y99.vn/data/Application/?sort=id&values=id,fees,status__code,code&login=${loginId}&filter=${serviceFeesFilter}`;
      
      const loanScheduleInterestUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(',')}&filter=${encodeURIComponent(JSON.stringify({ type: 2 }))}`;
      const loanScheduleFeesUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(',')}&filter=${encodeURIComponent(JSON.stringify({ type: 3 }))}`;


      const [disbursedResponse, createdResponse, serviceFeesResponse, interestScheduleResponse, feeScheduleResponse] = await Promise.all([
        fetch(disbursedUrl),
        fetch(createdUrl),
        fetch(serviceFeesUrl),
        fetch(loanScheduleInterestUrl),
        fetch(loanScheduleFeesUrl)
      ]);

      const disbursedData = await disbursedResponse.json();
      const createdData = await createdResponse.json();
      const serviceFeesData = await serviceFeesResponse.json();
      const interestScheduleData = await interestScheduleResponse.json();
      const feeScheduleData = await feeScheduleResponse.json();
      
      setInterestSchedules(interestScheduleData.rows || []);
      setFeeSchedules(feeScheduleData.rows || []);

      setDisbursedApplications(disbursedData.rows || []);
      setCreatedApplications(createdData.rows || []);
      
      const totalServiceFees = (serviceFeesData.rows || []).reduce((acc: number, app: Application) => {
        let appFees = (app.fees || []).reduce((feeAcc, fee) => feeAcc + (fee.custom_amount || 0), 0);
        const adjustment = adjustments.find(adj => adj.code === app.code);
        if (adjustment) {
          appFees += adjustment.amount;
        }
        return acc + appFees;
      }, 0);
      setCollectedServiceFees(totalServiceFees);


    } catch (error) {
      console.error("Failed to fetch applications", error);
      setDisbursedApplications([]);
      setCreatedApplications([]);
      setInterestSchedules([]);
      setFeeSchedules([]);
      setCollectedServiceFees(0);
    } finally {
      setLoading(false);
    }
  }, [loginId]);

  useEffect(() => {
    if (loginId) {
      fetchData(fromDate, toDate);
    }
  }, [fromDate, toDate, fetchData, loginId]);

  const reportData = useMemo(() => {
    const totalApplications = createdApplications.length;
    const disbursedApps = disbursedApplications.filter(app => app.status === 7);
    const totalLoanAmount = disbursedApps.reduce((acc, app) => acc + (app.loanapp__disbursement || 0), 0);
    const totalCommission = disbursedApps.reduce((acc, app) => acc + (app.commission || 0), 0);
    const averageLoanTerm = disbursedApps.length > 0 
      ? Math.round(disbursedApps.reduce((acc, app) => acc + (app.approve_term || 0), 0) / disbursedApps.length)
      : 0;

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

    const allLoanRegions = disbursedApplications.reduce((acc, app) => {
        const name = app.province || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    let regionData = allLoanRegions;
    if (allLoanRegions.length > 10) {
        const top10 = allLoanRegions.slice(0, 10);
        const otherCount = allLoanRegions.slice(10).reduce((acc, curr) => acc + curr.value, 0);
        regionData = [...top10, { name: 'Others', value: otherCount }];
    }
    
    const regionDataWithColors = regionData.map((item, index) => ({...item, fill: COLORS[index % COLORS.length]}));


    const statusData = [
        { name: '1. Newly Created', 'Total applications': createdApplications.filter(a => a.status === 1).length },
        { name: '2. Pending Review', 'Total applications': createdApplications.filter(a => a.status === 2).length },
        { name: '3. Request More Info', 'Total applications': createdApplications.filter(a => a.status === 3).length },
        { name: '4. Rejected', 'Total applications': createdApplications.filter(a => a.status === 4).length },
        { name: '5. Approved', 'Total applications': createdApplications.filter(a => a.status === 5).length },
        { name: '6. Contract signed', 'Total applications': createdApplications.filter(a => a.status === 6).length },
        { name: '7. Disbursed', 'Total applications': createdApplications.filter(a => a.status === 7).length },
    ];
    
    const typeData = disbursedApplications.reduce((acc, app) => {
        const name = app.product__type__en || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name, value: 1, fill: COLORS[acc.length % COLORS.length] });
        }
        return acc;
    }, [] as { name: string; value: number; fill: string }[]);


    const sourceData = [
        { name: 'Apps', 'Total applications': 0 },
        { name: 'CTV', 'Total applications': 0 },
        { name: 'Website', 'Total applications': 0 },
    ];
    createdApplications.forEach(app => {
        const sourceName = app.source__name || 'Unknown';
        const source = sourceData.find(s => s.name === sourceName);
        if (source) {
            source['Total applications'] += 1;
        }
    });

    const interestSchedulesInDateRange = fromDate && toDate
        ? interestSchedules.filter(s => {
            if (!s.detail || s.detail.length === 0 || (s.paid_amount ?? 0) <= 0) return false;
            const paymentTime = parseISO(s.detail[0].time);
            return isWithinInterval(paymentTime, { start: fromDate, end: toDate });
        })
        : [];
    
    const feeSchedulesInDateRange = fromDate && toDate
        ? feeSchedules.filter(s => {
            if (!s.detail || s.detail.length === 0 || (s.paid_amount ?? 0) <= 0) return false;
            const paymentTime = parseISO(s.detail[0].time);
            return isWithinInterval(paymentTime, { start: fromDate, end: toDate });
        })
        : [];

    const collectedInterest = interestSchedulesInDateRange.reduce((acc, s) => acc + (s.paid_amount || 0), 0);
    const collectedFees = feeSchedulesInDateRange.reduce((acc, s) => acc + (s.paid_amount || 0), 0);

    const potentialInterest = interestSchedules.reduce((acc, s) => acc + (s.remain_amount ?? s.pay_amount), 0);
    
    const potentialFees = feeSchedules.reduce((acc, s) => acc + (s.remain_amount ?? s.pay_amount), 0);

    const currentDate = new Date();
    const loanSchedules = [...interestSchedules, ...feeSchedules];
    const overdueDebt = loanSchedules
      .filter(s => s.to_date && isBefore(new Date(s.to_date), currentDate) && s.remain_amount > 0)
      .reduce((acc, s) => acc + (s.remain_amount || 0), 0);

    const estimatedProfit = collectedInterest + collectedFees + potentialInterest + potentialFees;


    return {
        totalApplications,
        disbursedCount: disbursedApps.length,
        totalLoanAmount,
        totalCommission,
        averageLoanTerm: averageLoanTerm,
        paperData,
        regionData: regionDataWithColors,
        statusData,
        typeData,
        sourceData,
        collectedFees,
        potentialFees,
        collectedInterest,
        potentialInterest,
        overdueDebt,
        estimatedProfit
    }
  }, [createdApplications, disbursedApplications, interestSchedules, feeSchedules, fromDate, toDate]);

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">3. Date Range</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Loan Report by Date Range
          <Button variant="ghost" size="icon" onClick={() => fetchData(fromDate, toDate)} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

      <SummaryCards
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        currencyFormatter={currencyFormatter}
        reportData={reportData}
        isAdmin={isAdmin}
        collectedServiceFees={collectedServiceFees}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LegalDocTypeChart data={reportData.paperData} />
        <LoanRegionsChart data={reportData.regionData} />
        <StatusChart data={reportData.statusData} />
        <LoanTypeChart typeData={reportData.typeData} />
        <SourceChart data={reportData.sourceData} />
      </div>
    </div>
  );
}

    

    