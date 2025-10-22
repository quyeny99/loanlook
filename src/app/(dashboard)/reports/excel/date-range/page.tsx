
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfMonth, format, parse, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import SummaryCards from '@/components/reports/date-range/summary-cards';
import LegalDocTypeChart from '@/components/reports/shared/legal-doc-type-chart';
import LoanRegionsChart from '@/components/reports/date-range/loan-regions-chart';
import StatusChart from '@/components/reports/date-range/status-chart';
import LoanTypeChart from '@/components/reports/daily/loan-type-chart';
import SourceChart from '@/components/reports/date-range/source-chart';
import Papa from 'papaparse';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#3b82f6', '#a855f7', '#2dd4bf', '#f97316', '#ec4899', '#84cc16', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const currencyFormatter = new Intl.NumberFormat('de-DE', {});

type SheetRow = {
  customer_name: string;
  loan_disbursement: number;
  date_disbursement: Date;
  [key: string]: any;
};

export default function DateRangeExcelReportPage() {
  const { loginId } = useAuth();
  const [fromDate, setFromDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<SheetRow[]>([]);
  const [sheetLoading, setSheetLoading] = useState(true);

  useEffect(() => {
    const fetchSheetData = async () => {
      setSheetLoading(true);
      try {
        const sheetId = '1NGlLMEFv9SxC2WXBvZcUsze6eekQSNK6gRbEeU2nKXQ';
        const sheetName = 'sheet5';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
        
        Papa.parse(url, {
          download: true,
          header: true,
          encoding: 'UTF-8',
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length > 0) {
              const formattedData = (results.data as any[]).map(row => {
                let date_disbursement;
                try {
                  date_disbursement = parse(row['Ngày'], 'M/d/yyyy', new Date());
                } catch(e) {
                  date_disbursement = new Date();
                }

                return {
                  customer_name: row['Tên khách'],
                  loan_disbursement: parseFloat(row['Dư nợ đầu kỳ']?.replace(/,/g, '')) || 0,
                  date_disbursement: date_disbursement,
                };
              });
              setSheetData(formattedData);
            }
            setSheetLoading(false);
          },
          error: (error: any) => {
            console.error('Failed to fetch or parse sheet data:', error);
            setSheetLoading(false);
          }
        });
      } catch (error) {
        console.error('Failed to fetch sheet data:', error);
        setSheetLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const reportData = useMemo(() => {
    let filteredRows: SheetRow[] = [];
    if (fromDate && toDate) {
        const start = startOfDay(fromDate);
        const end = endOfDay(toDate);
        filteredRows = sheetData
        .filter(row => {
            try {
                if (!row.date_disbursement || !(row.date_disbursement instanceof Date)) return false;
                const disbursementDate = row.date_disbursement;
                return isWithinInterval(disbursementDate, { start, end });
            } catch(e) {
                return false;
            }
        });
    }
    const totalLoanAmount = filteredRows.reduce((acc, row) => acc + row.loan_disbursement, 0);
  
    return {
      totalLoanAmount,
      disbursedCount: filteredRows.length,
      totalApplications: 1500,
      averageLoanTerm: 18,
      totalCommission: 500000000,
      collectedFees: 120000000,
      potentialFees: 50000000,
      collectedInterest: 250000000,
      potentialInterest: 100000000,
      overdueDebt: 300000000,
      estimatedProfit: 520000000,
      totalCollectedAmount: 370000000,
      totalGrossRevenue: 400000000,
      collectedServiceFees: 30000000,
      paperData: [
          { name: 'Căn cước công dân', value: 900, fill: '#3b82f6' },
          { name: 'Hộ chiếu', value: 300, fill: '#a855f7' }
      ],
      regionData: [
          { name: 'Hồ Chí Minh', value: 300, fill: COLORS[0] },
          { name: 'Hà Nội', value: 250, fill: COLORS[1] },
          { name: 'Đà Nẵng', value: 150, fill: COLORS[2] },
          { name: 'Hải Phòng', value: 100, fill: COLORS[3] },
          { name: 'Cần Thơ', value: 80, fill: COLORS[4] },
          { name: 'Others', value: 320, fill: COLORS[5] }
      ],
      statusData: [
          { name: '1. Newly Created', 'Total applications': 400 },
          { name: '2. Pending Review', 'Total applications': 300 },
          { name: '3. Request More Info', 'Total applications': 100 },
          { name: '4. Rejected', 'Total applications': 200 },
          { name: '5. Approved', 'Total applications': 250 },
          { name: '6. Contract signed', 'Total applications': 150 },
          { name: '7. Disbursed', 'Total applications': 100 },
      ],
      typeData: [
          { name: 'Personal Loan', value: 800, fill: COLORS[0] },
          { name: 'Business Loan', value: 400, fill: COLORS[1] },
      ],
      sourceData: [
          { name: 'Apps', 'Total applications': 700 },
          { name: 'CTV', 'Total applications': 500 },
          { name: 'Website', 'Total applications': 300 },
      ],
    }
  }, [sheetData, fromDate, toDate]);

  const collectedAmount = {
    total: 370000000,
    count: 150
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports/excel'}>Excel</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">Date Range</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Date Range Excel Report
          <Button variant="ghost" size="icon" onClick={() => {}} disabled={loading}>
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
        isAdmin={true}
        collectedAmount={collectedAmount}
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
