
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { type Application } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import SummaryCards from '@/components/reports/daily/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanAreasChart from '@/components/reports/daily/loan-areas-chart';
import StatusChart from '@/components/reports/daily/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/daily/source-chart';
import MonthlyFinancialsChart from '@/components/reports/monthly/monthly-financials-chart';
import { useAuth } from '@/context/AuthContext';
import { adjustments } from '@/lib/constants';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16'];
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


export default function ReportsPage() {
  const { loginId, isAdmin } = useAuth();
  const [date, setDate] = useState<Date>(subDays(new Date(), 1));
  const [createdApplications, setCreatedApplications] = useState<Application[]>([]);
  const [disbursedApplications, setDisbursedApplications] = useState<Application[]>([]);
  const [interestSchedules, setInterestSchedules] = useState<LoanSchedule[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<LoanSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState({ total: 0, count: 0 });
  const [collectedServiceFees, setCollectedServiceFees] = useState(0);

  const fetchData = useCallback(async (selectedDate: Date) => {
    if (!loginId) return;
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const createTimeFilter = encodeURIComponent(JSON.stringify({ "create_time__date": formattedDate }));
      const disbursementDateFilter = encodeURIComponent(JSON.stringify({ "loanapp__dbm_entry__date": formattedDate }));
      const serviceFeesFilter = encodeURIComponent(JSON.stringify({
        "account__code": "HOAC03VND",
        "date": formattedDate,
      }));
      
      const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${createTimeFilter}&page=-1&login=${loginId}`;
      const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${disbursementDateFilter}&page=-1&login=${loginId}`;
      const collectedAmountUrl = `https://api.y99.vn/data/Internal_Entry/?sort=-id&values=id,amount,type&filter=${encodeURIComponent(JSON.stringify({"date": formattedDate, "account__code":"HOAC02VND"}))}&page=-1&login=${loginId}`;
      const serviceFeesUrl = `https://api.y99.vn/data/Internal_Entry/?sort=-id&values=id,amount,type&filter=${serviceFeesFilter}&login=${loginId}`;
      
      const loanScheduleInterestUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(',')}&filter=${encodeURIComponent(JSON.stringify({ type: 2 }))}`;
      const loanScheduleFeesUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(',')}&filter=${encodeURIComponent(JSON.stringify({ type: 3 }))}`;
      


      const [createdResponse, disbursedResponse, collectedAmountResponse, serviceFeesResponse, interestScheduleResponse, feeScheduleResponse] = await Promise.all([
        fetch(createdUrl),
        fetch(disbursedUrl),
        fetch(collectedAmountUrl),
        fetch(serviceFeesUrl),
        fetch(loanScheduleInterestUrl),
        fetch(loanScheduleFeesUrl),
      ]);

      const createdData = await createdResponse.json();
      const disbursedData = await disbursedResponse.json();
      const collectedAmountData = await collectedAmountResponse.json();
      const serviceFeesData = await serviceFeesResponse.json();
      const interestScheduleData = await interestScheduleResponse.json();
      const feeScheduleData = await feeScheduleResponse.json();

      setCreatedApplications(createdData.rows || []);
      setDisbursedApplications(disbursedData.rows || []);
      setInterestSchedules(interestScheduleData.rows || []);
      setFeeSchedules(feeScheduleData.rows || []);

      
      const totalCollected = (collectedAmountData.rows || []).reduce((acc: number, entry: { amount: number, type: number }) => {
        if (entry.type === 1) {
          return acc + entry.amount;
        } else if (entry.type === 2) {
          return acc - entry.amount;
        }
        return acc;
      }, 0);
      const collectedCount = (collectedAmountData.rows || []).length;
      setCollectedAmount({ total: totalCollected, count: collectedCount });

      const totalServiceFees = (serviceFeesData.rows || []).reduce((acc: number, entry: { amount: number; type: number }) => {
        if (entry.type === 1) {
            return acc + entry.amount;
        } else if (entry.type === 2) {
            return acc - entry.amount;
        }
        return acc;
      }, 0);
      setCollectedServiceFees(totalServiceFees);


    } catch (error) {
      console.error("Failed to fetch data", error);
      setCreatedApplications([]);
      setDisbursedApplications([]);
      setInterestSchedules([]);
      setFeeSchedules([]);
      setCollectedAmount({ total: 0, count: 0 });
      setCollectedServiceFees(0);
    } finally {
      setLoading(false);
    }
  }, [loginId]);

  useEffect(() => {
    if (loginId) {
      fetchData(date);
    }
  }, [date, fetchData, loginId]);
  
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
        const sourceName = app.source__name || 'Unknown';
        const source = sourceData.find(s => s.name === sourceName);
        if (source) {
            source.Applications += 1;
        }
    });
    
    const interestSchedulesInDateRange = interestSchedules.filter(s => {
        if (!s.detail || s.detail.length === 0 || (s.paid_amount ?? 0) <= 0) return false;
        const paymentTime = parseISO(s.detail[0].time);
        return isSameDay(paymentTime, date);
      });
      
    const feeSchedulesInDateRange = feeSchedules.filter(s => {
      if (!s.detail || s.detail.length === 0 || (s.paid_amount ?? 0) <= 0) return false;
      const paymentTime = parseISO(s.detail[0].time);
      return isSameDay(paymentTime, date);
    });

    const collectedInterest = interestSchedulesInDateRange.reduce((acc, s) => acc + (s.paid_amount || 0), 0);
    const collectedFees = feeSchedulesInDateRange.reduce((acc, s) => acc + (s.paid_amount || 0), 0);

    // Adjustments
    const dailyAdjustments = adjustments.filter(adj => isSameDay(parseISO(adj.date), date));
    
    const totalAdjustmentDisbursement = dailyAdjustments
        .filter(adj => adj.type === "disbursement")
        .reduce((sum, adj) => sum + adj.amount, 0);

    const countAdjustmentDisbursement = dailyAdjustments
        .filter(adj => adj.type === "disbursement")
        .reduce((sum, adj) => {
            if (adj.amount > 0) sum += 1;
            else if (adj.amount < 0) sum -= 1;
            return sum;
        }, 0);

    const totalAdjustmentServiceFee = dailyAdjustments
        .filter(adj => adj.type === "service_fee")
        .reduce((sum, adj) => sum + adj.amount, 0);

    const totalAdjustmentMonthlyFee = dailyAdjustments
        .filter(adj => adj.type === "monthly_fee")
        .reduce((sum, adj) => sum + adj.amount, 0);
    
    const totalAdjustmentMonthlyInterest = dailyAdjustments
        .filter(adj => adj.type === "monthly_interest")
        .reduce((sum, adj) => sum + adj.amount, 0);

    const finalLoanAmount = loanAmount + totalAdjustmentDisbursement;
    const finalDisbursedCount = disbursedApps.length + countAdjustmentDisbursement;
    const finalCollectedServiceFees = collectedServiceFees + totalAdjustmentServiceFee;
    const finalCollectedFees = collectedFees + totalAdjustmentMonthlyFee;
    const finalCollectedInterest = collectedInterest + totalAdjustmentMonthlyInterest;
    
    const totalRevenue = finalCollectedFees + finalCollectedInterest;

    const totalCollectedAmount = collectedAmount.total;

    return {
      totalApplications,
      totalRejected,
      loanAmount: finalLoanAmount > 0 ? finalLoanAmount : 0,
      disbursedCount: finalDisbursedCount > 0 ? finalDisbursedCount : 0,
      totalCommission,
      averageLoanTerm: Math.round(averageLoanTerm),
      paperData,
      regionData,
      statusData,
      typeData,
      sourceData,
      commissionCount,
      collectedFees: finalCollectedFees,
      collectedInterest: finalCollectedInterest,
      totalRevenue,
      totalCollectedAmount,
      collectedServiceFees: finalCollectedServiceFees
    };
  }, [createdApplications, disbursedApplications, interestSchedules, feeSchedules, date, collectedServiceFees, collectedAmount]);

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
        isAdmin={isAdmin}
        collectedServiceFees={reportData.collectedServiceFees}
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
