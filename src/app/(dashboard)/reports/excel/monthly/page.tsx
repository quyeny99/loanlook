
'use client';

import { ChevronRight } from 'lucide-react';

export default function MonthlyExcelReportPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports/excel'}>Excel</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">Monthly</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Monthly Excel Report
        </h1>
      </div>

      <div>
        <p>This is the page for the monthly excel report.</p>
      </div>
    </div>
  );
}
