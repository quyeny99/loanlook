
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

export default function ReportsPage() {
  const [date, setDate] = useState<Date>(subDays(new Date(), 1));
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
    const totalRejected = applications.filter(app => app.status === 4).length; 
    const disbursedApps = applications.filter(app => app.status === 7); 
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
    }, [] as { name: string; value: number }[]).map((item, index) => ({ ...item, fill: ['#3b82f6', '#a855f7'][index % 2] }));

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
        { name: '4. Rejected', Applications: applications.filter(a => a.status === 4).length },
        { name: '5. Approved', Applications: applications.filter(a => a.status === 5).length },
        { name: '6. Contract signed', Applications: applications.filter(a => a.status === 6).length },
        { name: '7. Disbursed', Applications: applications.filter(a => a.status === 7).length },
    ];
    
    const typeData = applications.reduce((acc, app) => {
        const name = app.product__type__en || 'Unknown';
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

      <SummaryCards
        reportData={reportData}
        applications={applications}
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
