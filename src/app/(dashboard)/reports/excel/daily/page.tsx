
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import SummaryCards from '@/components/reports/daily/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanAreasChart from '@/components/reports/daily/loan-areas-chart';
import StatusChart from '@/components/reports/daily/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/daily/source-chart';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16'];

export default function DailyExcelReportPage() {
  const [date, setDate] = useState(new Date());
  const [loading] = useState(false);

  const reportData = {
    totalApplications: 125,
    totalRejected: 15,
    loanAmount: 500000000,
    disbursedCount: 25,
    totalCommission: 12500000,
    averageLoanTerm: 12,
    commissionCount: 10,
    paperData: [
        { name: 'Căn cước công dân', value: 10, fill: '#3b82f6' },
        { name: 'Hộ chiếu', value: 5, fill: '#a855f7' }
    ],
    regionData: [
        { name: 'Hồ Chí Minh', value: 5, fill: COLORS[0] },
        { name: 'Hà Nội', value: 4, fill: COLORS[1] },
        { name: 'Đà Nẵng', value: 3, fill: COLORS[2] },
        { name: 'Khác', value: 3, fill: COLORS[3] },
    ],
    statusData: [
        { name: '1. Newly Created', Applications: 30 },
        { name: '2. Pending Review', Applications: 20 },
        { name: '3. Request More Info', Applications: 10 },
        { name: '4. Rejected', Applications: 15 },
        { name: '5. Approved', Applications: 25 },
        { name: '6. Contract signed', Applications: 15 },
        { name: '7. Disbursed', Applications: 10 },
    ],
    typeData: [
        { name: 'Personal Loan', value: 15, fill: COLORS[0] },
        { name: 'Business Loan', value: 10, fill: COLORS[1] },
    ],
    sourceData: [
        { name: 'Apps', Applications: 60 },
        { name: 'CTV', Applications: 40 },
        { name: 'Website', Applications: 25 },
    ],
    collectedFees: 5000000,
    collectedInterest: 10000000,
    totalRevenue: 15000000,
    totalCollectedAmount: 25000000,
    totalGrossRevenue: 30000000,
  };

  const collectedAmount = {
      total: 25000000,
      count: 50
  };
  
  const collectedServiceFees = 5000000;

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports/excel'}>Excel</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">Daily</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Daily Excel Report
          <Button variant="ghost" size="icon" disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </h1>
      </div>

       <SummaryCards
        reportData={reportData}
        collectedAmount={collectedAmount}
        date={date}
        setDate={setDate}
        isAdmin={true}
        collectedServiceFees={collectedServiceFees}
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

