
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryCards from '@/components/reports/date-range/summary-cards';
import LegalDocTypeChart from '@/components/reports/date-range/legal-doc-type-chart';
import LoanRegionsChart from '@/components/reports/date-range/loan-regions-chart';
import StatusChart from '@/components/reports/date-range/status-chart';
import LoanTypeChart from '@/components/reports/date-range/loan-type-chart';
import SourceChart from '@/components/reports/date-range/source-chart';

const paperData = [
  { name: 'Citizen Identification Card', value: 1, fill: '#3b82f6' },
];

const regionData = [
    { name: 'Sóc Trăng - Mỹ Tú', value: 1, fill: '#3b82f6' },
];

const statusData = [
  { name: '1. Newly Created', 'Total applications': 2 },
  { name: '2. Pending Review', 'Total applications': 1 },
  { name: '3. Request More Info', 'Total applications': 0 },
  { name: '4. Rejected', 'Total applications': 1 },
  { name: '5. Approved', 'Total applications': 1 },
  { name: '6. Contract signed', 'Total applications': 0 },
  { name: '7. Disbursed', 'Total applications': 1 },
];

const typeData = [
  { name: 'Pawn loan', value: 1, fill: '#4f46e5' },
];

const sourceData = [
    { name: 'Apps', 'Total applications': 0 },
    { name: 'CTV', 'Total applications': 0 },
    { name: 'Website', 'Total applications': 1 },
];

const currencyFormatter = new Intl.NumberFormat('de-DE', {});


export default function DateRangeReportsPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

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
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </h1>
      </div>

      <SummaryCards
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        currencyFormatter={currencyFormatter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LegalDocTypeChart data={paperData} />
        <LoanRegionsChart data={regionData} />
        <StatusChart data={statusData} />
        <LoanTypeChart data={typeData} />
        <SourceChart data={sourceData} />
      </div>
    </div>
  );
}
