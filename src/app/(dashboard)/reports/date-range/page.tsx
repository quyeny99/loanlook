
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, startOfMonth } from 'date-fns';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryCards from '@/components/reports/date-range/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanRegionsChart from '@/components/reports/date-range/loan-regions-chart';
import StatusChart from '@/components/reports/date-range/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/date-range/source-chart';
import { type Application } from '@/lib/data';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const currencyFormatter = new Intl.NumberFormat('de-DE', {});
const API_BASE_URL = 'https://api.y99.vn/data/Application/';
const API_VALUES = 'id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date';
const LOGIN_PARAM = 'login=372';


export default function DateRangeReportsPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [createdApplications, setCreatedApplications] = useState<Application[]>([]);
  const [disbursedApplications, setDisbursedApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async (start?: Date, end?: Date) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const disbursementFilter = encodeURIComponent(JSON.stringify({ 
        "loanapp__dbm_entry__date__gte": format(start, 'yyyy-MM-dd'),
        "loanapp__dbm_entry__date__lte": format(end, 'yyyy-MM-dd')
      }));
      const creationFilter = encodeURIComponent(JSON.stringify({ 
        "create_time__date__gte": format(start, 'yyyy-MM-dd'),
        "create_time__date__lte": format(end, 'yyyy-MM-dd')
      }));

      const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${disbursementFilter}&page=-1&${LOGIN_PARAM}`;
      const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${creationFilter}&page=-1&${LOGIN_PARAM}`;

      const [disbursedResponse, createdResponse] = await Promise.all([
        fetch(disbursedUrl),
        fetch(createdUrl)
      ]);

      const disbursedData = await disbursedResponse.json();
      const createdData = await createdResponse.json();

      setDisbursedApplications(disbursedData.rows || []);
      setCreatedApplications(createdData.rows || []);

    } catch (error) {
      console.error("Failed to fetch applications", error);
      setDisbursedApplications([]);
      setCreatedApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(fromDate, toDate);
  }, [fromDate, toDate, fetchApplications]);

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
        const source = sourceData.find(s => s.name === app.source__name);
        if (source) {
            source['Total applications'] += 1;
        }
    });


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
    }
  }, [createdApplications, disbursedApplications]);

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
          <Button variant="ghost" size="icon" onClick={() => fetchApplications(fromDate, toDate)} disabled={loading}>
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
