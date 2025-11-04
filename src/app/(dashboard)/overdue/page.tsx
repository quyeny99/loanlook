'use client';

import { useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { OverdueLoansTable } from '@/components/overdue-loans-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabDescriptions = {
  all: 'Displays all loans that are due today or already overdue.',
  active: 'Displays loans that are due for payment today.',
  late: 'Displays loans that are overdue by less than 7 days.',
  warning: 'Displays loans that are overdue between 7 and 14 days.',
  critical: 'Displays loans that are overdue by more than 14 days.',
};


export default function OverduePage() {
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [refreshToken, setRefreshToken] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const currentTab = (searchParams.get('tab') || 'all') as 'all' | 'active' | 'late' | 'warning' | 'critical';

  const setTab = (nextTab: 'all' | 'active' | 'late' | 'warning' | 'critical') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    router.push(`${pathname}?${params.toString()}`);
  };


  async function handleExportAll() {
    try {
      setExportLoading(true);
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!userId) {
        console.error('Missing userId for export');
        setExportLoading(false);
        return;
      }

      const values = [
        'id','customer__code','customer__fullname','customer__phone','code','product__name',
        'valid_from','valid_to','outstanding','due_amount','due_date','due_days','status__name'
      ].join(',');

      const filter = encodeURIComponent(JSON.stringify({
        deleted: 0,
        due_days__gte: 0,
        outstanding__gt: 0,
        create_time__date__gte: '2025-01-01',
      }));

      const url = `https://api.y99.vn/data/Loan/?values=${values}&sort=-id&login=${userId}&filter=${filter}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Export API error', res.status);
        setExportLoading(false);
        return;
      }
      const data = await res.json();
      const rows = data?.rows || [];

      // Build a clean array of objects for XLSX
      const exportRows = rows.map((r: any) => ({
        'Loan Code': r.code,
        'Customer': r.customer__fullname,
        'Phone': r.customer__phone,
        'Product': r.product__name,
        'From Date': r.valid_from,
        'To Date': r.valid_to,
        'Outstanding': r.outstanding,
        'Due Amount': r.due_amount,
        'Due Date': r.due_date,
        'Due Days': r.due_days,
        'Status': r.status__name,
      }));

      const xlsx = await import('xlsx');
      const worksheet = xlsx.utils.json_to_sheet(exportRows);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Overdue Loans');
      const dateStr = new Date().toISOString().slice(0, 10);
      xlsx.writeFile(workbook, `overdue_loans_${dateStr}.xlsx`);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExportLoading(false);
    }
  }


  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-2xl font-bold">Overdue Loans</CardTitle>
              <div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setRefreshToken((v) => v + 1)} disabled={tableLoading}>
                    <RefreshCw className={cn('h-4 w-4', tableLoading && 'animate-spin')} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleExportAll} disabled={exportLoading}>
                    <Download className={cn('h-4 w-4', exportLoading && 'animate-pulse')} />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={(val) => setTab(val as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="late">Short Overdue</TabsTrigger>
                <TabsTrigger value="warning">Medium Overdue</TabsTrigger>
                <TabsTrigger value="critical">Long Overdue</TabsTrigger>
              </TabsList>
              <CardDescription className='mb-4'>
                  {tabDescriptions[currentTab]}
              </CardDescription>
              <TabsContent value={currentTab} className="m-0">
                <OverdueLoansTable tab={currentTab} refreshToken={refreshToken} onLoadingChange={setTableLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


