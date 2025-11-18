"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OverdueLoansTable } from "@/components/overdue-loans-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const tabDescriptions = {
  all: "Displays all loans that are due today or already overdue.",
  active: "Displays loans that are overdue between 1 and 3 days.",
  late: "Displays loans that are overdue between 4 and 6 days.",
  warning: "Displays loans that are overdue between 7 and 14 days.",
  critical: "Displays loans that are overdue by more than 14 days.",
};

function OverdueInner({
  refreshToken,
  setTableLoading,
}: {
  refreshToken: number;
  setTableLoading: (loading: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") || "all") as
    | "all"
    | "active"
    | "late"
    | "warning"
    | "critical";
  const setTab = (
    nextTab: "all" | "active" | "late" | "warning" | "critical"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <Tabs value={currentTab} onValueChange={(val) => setTab(val as any)}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="late">Short Overdue</TabsTrigger>
        <TabsTrigger value="warning">Medium Overdue</TabsTrigger>
        <TabsTrigger value="critical">Long Overdue</TabsTrigger>
      </TabsList>
      <CardDescription className="mb-4">
        {tabDescriptions[currentTab]}
      </CardDescription>
      <TabsContent value={currentTab} className="m-0">
        <OverdueLoansTable
          tab={currentTab}
          refreshToken={refreshToken}
          onLoadingChange={setTableLoading}
        />
      </TabsContent>
    </Tabs>
  );
}

export default function OverduePage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const { isAdmin } = useAuth();

  async function handleExportAll() {
    try {
      setExportLoading(true);
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (!userId) {
        console.error("Missing userId for export");
        setExportLoading(false);
        return;
      }

      const values = [
        "id",
        "customer__code",
        "customer__fullname",
        "customer__phone",
        "code",
        "product__name",
        "valid_from",
        "valid_to",
        "outstanding",
        "due_amount",
        "due_date",
        "due_days",
        "status__name",
      ].join(",");

      const filter = encodeURIComponent(
        JSON.stringify({
          deleted: 0,
          due_days__gte: 0,
          outstanding__gt: 0,
          create_time__date__gte: "2025-01-01",
        })
      );

      const url = `https://api.y99.vn/data/Loan/?values=${values}&sort=-id&login=${userId}&filter=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Export API error: ${res.status}`);

      const data = await res.json();
      const rows = data?.rows || [];

      // 🎨 XÁC ĐỊNH MÀU TRƯỚC KHI TẠO EXCEL
      const rowsWithColor = rows.map((r: any) => {
        const dueDays = Number(r.due_days);
        let color = null;

        if (dueDays === 0) color = "92D050"; // Green
        else if (dueDays > 0 && dueDays < 7) color = "FFFF00"; // Yellow
        else if (dueDays >= 7 && dueDays <= 14) color = "FFA500"; // Orange
        else if (dueDays > 14) color = "FF0000"; // Red

        return {
          data: {
            "Loan Code": r.code,
            Customer: r.customer__fullname,
            Phone: r.customer__phone,
            Product: r.product__name,
            "From Date": r.valid_from,
            "To Date": r.valid_to,
            Outstanding: r.outstanding,
            "Due Amount": r.due_amount,
            "Due Date": r.due_date,
            "Due Days": r.due_days,
            Status: r.status__name,
          },
          color: color,
        };
      });

      const xlsx = await import("xlsx-js-style");

      // Tạo worksheet chỉ với dữ liệu export (không có color)
      const exportData = rowsWithColor.map((row: any) => row.data);
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Overdue Loans");

      const range = xlsx.utils.decode_range(worksheet["!ref"]!);

      // 🌈 Style header
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // 🎨 Style mặc định cho cell
      const defaultCellStyle = {
        alignment: { vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Áp dụng style cho tất cả cells
      for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex++) {
        for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
          const cellRef = xlsx.utils.encode_cell({ r: rowIndex, c: colIndex });
          if (!worksheet[cellRef]) continue;

          if (rowIndex === 0) {
            worksheet[cellRef].s = headerStyle;
          } else {
            const currentStyle = worksheet[cellRef].s || {};
            worksheet[cellRef].s = { ...defaultCellStyle, ...currentStyle };
          }
        }
      }

      // 🎨 TÔ MÀU DỰA TRÊN DỮ LIỆU GỐC TỪ API
      for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex++) {
        const dataIndex = rowIndex - 1; // Vì rowIndex=1 tương ứng với data[0]
        const rowColor = rowsWithColor[dataIndex].color;

        if (rowColor) {
          for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
            const cellRef = xlsx.utils.encode_cell({
              r: rowIndex,
              c: colIndex,
            });
            const cell = worksheet[cellRef];
            if (cell) {
              cell.s = {
                ...cell.s,
                fill: { patternType: "solid", fgColor: { rgb: rowColor } },
              };
            }
          }
        }
      }

      // Auto-fit columns
      worksheet["!cols"] = [];
      for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
        let maxLength = 0;
        for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex++) {
          const cellRef = xlsx.utils.encode_cell({ r: rowIndex, c: colIndex });
          const cell = worksheet[cellRef];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxLength = Math.max(maxLength, cellLength);
          }
        }
        worksheet["!cols"][colIndex] = {
          width: Math.min(Math.max(maxLength + 2, 10), 50),
        };
      }

      // Xuất file
      const dateStr = new Date().toISOString().slice(0, 10);
      xlsx.writeFile(workbook, `overdue_loans_${dateStr}.xlsx`);
    } catch (e) {
      console.error("Export failed", e);
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
              <CardTitle className="text-2xl font-bold">
                Overdue Loans
              </CardTitle>
              <div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRefreshToken((v) => v + 1)}
                    disabled={tableLoading}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", tableLoading && "animate-spin")}
                    />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleExportAll}
                      disabled={exportLoading}
                    >
                      <Download
                        className={cn(
                          "h-4 w-4",
                          exportLoading && "animate-pulse"
                        )}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">Loading...</div>
              }
            >
              <OverdueInner
                refreshToken={refreshToken}
                setTableLoading={setTableLoading}
              />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
