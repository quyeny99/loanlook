"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  type Application,
  type Statement,
  type LoanServiceFee,
} from "@/lib/types";
import {
  getMonth,
  isSameMonth,
  parseISO,
  subDays,
  format,
  isSameYear,
} from "date-fns";
import PieChartCard from "@/components/reports/shared/pie-chart";
import SummaryCards from "@/components/reports/monthly/summary-cards";
import MonthlyStatusChart from "@/components/reports/monthly/monthly-status-chart";
import MonthlyLoanAmountChart from "@/components/reports/monthly/monthly-loan-amount-chart";
import MonthlySourceChart from "@/components/reports/monthly/monthly-source-chart";
import MonthlyFinancialsChart from "@/components/reports/monthly/monthly-financials-chart";
import { useAuth } from "@/context/AuthContext";
import { getAdjustments } from "@/lib/data";
import type { Adjustment } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { applyDisbursementAdjustments } from "@/lib/adjustments";
import { canAccessPage } from "@/lib/utils";
import { redirect } from "next/navigation";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
  "#a4c8e0",
  "#d8a4e0",
];
const API_BASE_URL = "https://api.y99.vn/data/Application/";
const API_VALUES =
  "id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__disbursement,loanapp__dbm_entry__date";
const LOAN_SCHEDULE_API_VALUES = [
  "id",
  "type",
  "status",
  "paid_amount",
  "remain_amount",
  "ovd_amount",
  "itr_income",
  "to_date",
  "pay_amount",
  "detail",
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
}: any) => {
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs"
    >
      {name}
    </text>
  );
};

type LoanSchedule = {
  id: number;
  type: number;
  status: number;
  paid_amount: number;
  remain_amount: number;
  ovd_amount: number;
  to_date: string;
  pay_amount: number;
  detail: {
    paid: number;
    time: string;
    pay_amount: number;
  }[];
};

export default function MonthlyReportPage() {
  const { currentProfile } = useAuth();

  // Check access permission
  if (
    currentProfile &&
    !canAccessPage(currentProfile.role, "/reports/monthly")
  ) {
    redirect("/");
  }
  const { loginId, isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) =>
    String(startYear + i)
  );

  const [year, setYear] = useState(String(currentYear));
  const [applications, setApplications] = useState<Application[]>([]);
  const [interestSchedules, setInterestSchedules] = useState<LoanSchedule[]>(
    []
  );
  const [feeSchedules, setFeeSchedules] = useState<LoanSchedule[]>([]);
  const [overdueDebtSchedules, setOverdueDebtSchedules] = useState<
    LoanSchedule[]
  >([]);
  const [loanStatements, setLoanStatements] = useState<Statement[]>([]);
  const [loanServiceFees, setLoanServiceFees] = useState<LoanServiceFee[]>([]);
  const [overdueLoansCount, setOverdueLoansCount] = useState<number>(0);
  const [outstandingLoans, setOutstandingLoans] = useState<number>(0);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (selectedYear: string) => {
      if (!loginId) return;
      setLoading(true);
      try {
        const fromDate = `${selectedYear}-01-01`;
        const toDate = `${selectedYear}-12-31`;

        const appFilter = encodeURIComponent(
          JSON.stringify({ create_time__year: parseInt(selectedYear) })
        );
        const appUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${appFilter}&page=-1&login=${loginId}`;

        const loanScheduleInterestFilter = encodeURIComponent(
          JSON.stringify({ type: 2 })
        );
        const loanScheduleFeesFilter = encodeURIComponent(
          JSON.stringify({ type: 3 })
        );
        const loanScheduleInterestUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(
          ","
        )}&filter=${loanScheduleInterestFilter}`;
        const loanScheduleFeesUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(
          ","
        )}&filter=${loanScheduleFeesFilter}`;

        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        const overdueDebtFilter = encodeURIComponent(
          JSON.stringify({
            to_date__gte: "2025-08-01",
            to_date__lte: yesterday,
            remain_amount__gt: 0,
          })
        );
        const overdueDebtUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(
          ","
        )}&filter=${overdueDebtFilter}`;
        const overdueLoansFilter = encodeURIComponent(
          JSON.stringify({ status: 5 })
        );
        const overdueLoansUrl = `https://api.y99.vn/data/Loan/?values=id,itr_next_amount,fee_next_amount,prin_next_amount&distinct_values=${encodeURIComponent(
          JSON.stringify({
            count_note: {
              type: "Count",
              field: "id",
              subquery: { model: "Loan_Note", column: "ref" },
            },
            sms_count: {
              type: "Count",
              subquery: { model: "Loan_Sms", column: "ref" },
              field: "id",
            },
            file_count: {
              type: "Count",
              field: "id",
              subquery: { model: "Loan_File", column: "ref" },
            },
            collat_count: {
              type: "Count",
              field: "id",
              subquery: { model: "Loan_Collateral", column: "loan" },
            },
          })
        )}&sort=-id&summary=annotate&login=${loginId}&filter=${overdueLoansFilter}`;

        // Fetch outstanding loans from loans disbursed in the year
        const outstandingLoansFilter = encodeURIComponent(
          JSON.stringify({
            // dbm_entry__date__gte: fromDate,
            dbm_entry__date__lte: toDate,
            outstanding__gt: 0,
          })
        );
        const outstandingLoansUrl = `https://api.y99.vn/data/Loan/?sort=-id&login=${loginId}&values=id,outstanding,code&filter=${outstandingLoansFilter}`;

        // Fetch loan_statements from Supabase
        const supabase = createClient();
        const supabaseQuery = supabase
          .from("loan_statements")
          .select("*")
          .gte("payment_date", fromDate)
          .lte("payment_date", toDate);

        // Fetch loan service fees from Supabase
        const serviceFeesQuery = supabase
          .from("loan_service_fees")
          .select("*")
          .gte("payment_date", fromDate)
          .lte("payment_date", toDate);

        const [
          appResponse,
          interestScheduleResponse,
          feeScheduleResponse,
          overdueDebtResponse,
          overdueLoansResponse,
          outstandingLoansResponse,
          collectedAmountData,
          serviceFeesData,
          adjustmentsData,
        ] = await Promise.all([
          fetch(appUrl),
          fetch(loanScheduleInterestUrl),
          fetch(loanScheduleFeesUrl),
          fetch(overdueDebtUrl),
          fetch(overdueLoansUrl),
          fetch(outstandingLoansUrl),
          supabaseQuery,
          serviceFeesQuery,
          getAdjustments(),
        ]);

        setAdjustments(adjustmentsData);

        const appData = await appResponse.json();
        const interestScheduleData = await interestScheduleResponse.json();
        const feeScheduleData = await feeScheduleResponse.json();
        const overdueDebtData = await overdueDebtResponse.json();
        const overdueLoansData = await overdueLoansResponse.json();
        const outstandingLoansData = await outstandingLoansResponse.json();

        // Fetch and set loan service fees from Supabase
        const { data: serviceFeesDataResult, error: serviceFeesError } =
          serviceFeesData;

        if (serviceFeesError) {
          console.error(
            "Error fetching loan service fees from Supabase:",
            serviceFeesError
          );
          setLoanServiceFees([]);
        } else {
          const serviceFees = (serviceFeesDataResult || []) as LoanServiceFee[];
          setLoanServiceFees(serviceFees);
        }

        // Parse Supabase loan_statements data
        const { data: statementsData, error: statementsError } =
          collectedAmountData;

        if (statementsError) {
          console.error(
            "Error fetching loan statements from Supabase:",
            statementsError
          );
          setLoanStatements([]);
        } else {
          const statements = (statementsData || []) as Statement[];
          setLoanStatements(statements);
        }

        setApplications(appData.rows || []);
        setInterestSchedules(interestScheduleData.rows || []);
        setFeeSchedules(feeScheduleData.rows || []);
        setOverdueDebtSchedules(overdueDebtData.rows || []);
        setOverdueLoansCount(overdueLoansData.total_rows || 0);

        // Calculate total outstanding amount from outstanding loans
        const totalOutstanding = (outstandingLoansData.rows || []).reduce(
          (acc: number, loan: any) => {
            // Skip null outstanding values
            if (loan.outstanding !== null && loan.outstanding !== undefined) {
              return acc + (loan.outstanding || 0);
            }
            return acc;
          },
          0
        );
        setOutstandingLoans(totalOutstanding);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setApplications([]);
        setInterestSchedules([]);
        setFeeSchedules([]);
        setOverdueDebtSchedules([]);
        setLoanStatements([]);
        setLoanServiceFees([]);
        setOverdueLoansCount(0);
        setOutstandingLoans(0);
      } finally {
        setLoading(false);
      }
    },
    [loginId]
  );

  useEffect(() => {
    if (loginId) {
      fetchData(year);
    }
  }, [year, fetchData, loginId]);

  const reportData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    const monthlyData = months.map((month) => {
      const monthDate = new Date(parseInt(year), month, 1);

      const monthApps = applications.filter(
        (app) =>
          app.create_time && getMonth(new Date(app.create_time)) === month
      );
      // Start Adjustments calculator - Apply adjustments to disbursedMonthApps
      // Filter adjustments for disbursement type in the current month
      const filteredAdjustmentsDisbursement = adjustments.filter((adj) => {
        if (adj.type !== "disbursement") return false;
        return isSameMonth(parseISO(adj.date), monthDate);
      });

      // Get all disbursed apps for this month
      const disbursedMonthApps = applications.filter((app) => {
        return (
          app.status === 7 &&
          app.loanapp__dbm_entry__date &&
          isSameMonth(parseISO(app.loanapp__dbm_entry__date), monthDate)
        );
      });

      // Apply adjustments to disbursed applications
      const adjustedDisbursedMonthApps = applyDisbursementAdjustments(
        disbursedMonthApps,
        filteredAdjustmentsDisbursement
      );

      const totalDisbursedCount = adjustedDisbursedMonthApps.length;
      const totalLoanAmount = adjustedDisbursedMonthApps.reduce(
        (acc, app) => acc + (app.loanapp__disbursement || 0),
        0
      );
      // End Adjustments calculator

      // Calculate collected interest and fees from Supabase loan_statements
      // Filter statements by payment_date in the current month
      const targetYear = parseInt(year);
      const targetMonth = month; // month is 0-indexed (0-11)

      const statementsForMonth = loanStatements.filter((statement) => {
        if (!statement.payment_date) return false;
        try {
          // Parse payment_date - handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
          const paymentDate = parseISO(statement.payment_date);
          // Check if the payment date's year and month match the target
          return (
            paymentDate.getFullYear() === targetYear &&
            paymentDate.getMonth() === targetMonth
          );
        } catch {
          // Fallback: try string comparison if parseISO fails
          const targetYearMonth = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}`;
          const paymentDateStr = statement.payment_date.substring(0, 7);
          return paymentDateStr === targetYearMonth;
        }
      });

      // Calculate collected interest from loan_statements
      const collectedInterestForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (statement.interest_amount || 0),
        0
      );

      // Calculate collected fees (management fee) from loan_statements
      const collectedFeesForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (statement.management_fee || 0),
        0
      );

      // Calculate collected amount from loan_statements (total_amount)
      const collectedAmountForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (Number(statement.total_amount) || 0),
        0
      );

      const collectedInterestVATForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (statement.interest_vat || 0),
        0
      );
      const collectedFeesVATForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (statement.management_fee_vat || 0),
        0
      );

      const collectedSettlementFeeVATForMonth = statementsForMonth.reduce(
        (acc, statement) => acc + (statement.settlement_fee_vat || 0),
        0
      );

      // Calculate collected service fees from loan_service_fees table
      // Filter service fees by payment_date in the current month
      const serviceFeesForMonth = loanServiceFees.filter((fee) => {
        if (!fee.payment_date) return false;
        try {
          const paymentDate = parseISO(fee.payment_date);
          return (
            paymentDate.getFullYear() === targetYear &&
            paymentDate.getMonth() === targetMonth
          );
        } catch {
          // Fallback: try string comparison if parseISO fails
          const targetYearMonth = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}`;
          const paymentDateStr = fee.payment_date.substring(0, 7);
          return paymentDateStr === targetYearMonth;
        }
      });

      const serviceFeesForMonthFromTable = serviceFeesForMonth.reduce(
        (acc, fee) => acc + (fee.total_amount || 0),
        0
      );

      // Calculate VAT amount from loan_service_fees for this month
      const serviceFeesVATForMonth = serviceFeesForMonth.reduce(
        (acc, fee) => acc + (fee.vat_amount || 0),
        0
      );

      // Calculate service fees excluding VAT for this month
      const serviceFeesExclVATForMonth = serviceFeesForMonth.reduce(
        (acc, fee) =>
          acc + (fee.appraisal_fee || 0) + (fee.disbursement_fee || 0),
        0
      );
      const finalCollectedFees = collectedFeesForMonth;
      const finalCollectedInterest = collectedInterestForMonth;
      // Use service fees from Supabase table only, no adjustments
      const finalCollectedServiceFees = serviceFeesForMonthFromTable;

      const totalRevenue = finalCollectedFees + finalCollectedInterest;
      const totalGrossRevenueForMonth =
        collectedAmountForMonth + finalCollectedServiceFees;

      const overdueDebt = overdueDebtSchedules.reduce((acc, s) => {
        if (!s.detail) {
          return acc + (s.remain_amount || 0);
        }
        return acc;
      }, 0);

      return {
        month: `Month ${month + 1}`,
        total: monthApps.length,
        "1. Newly Created": monthApps.filter((a) => a.status === 1).length,
        "2. Pending Review": monthApps.filter((a) => a.status === 2).length,
        "3. Request More Info": monthApps.filter((a) => a.status === 3).length,
        "4. Rejected": monthApps.filter((a) => a.status === 4).length,
        "5. Approved": monthApps.filter((a) => a.status === 5).length,
        "6. Contract signed": monthApps.filter((a) => a.status === 6).length,
        "7. Disbursed": totalDisbursedCount,
        "Loan Amount": totalLoanAmount > 0 ? totalLoanAmount : 0,
        Apps: monthApps.filter((a) => a.source__name === "Apps").length,
        CTV: monthApps.filter((a) => a.source__name === "CTV").length,
        Website: monthApps.filter((a) => a.source__name === "Website").length,
        collectedFees: finalCollectedFees,
        collectedInterest: finalCollectedInterest,
        collectedInterestVAT: collectedInterestVATForMonth,
        collectedFeesVAT: collectedFeesVATForMonth,
        collectedSettlementFeeVAT: collectedSettlementFeeVATForMonth,
        overdueDebt,
        collectedServiceFees: finalCollectedServiceFees,
        collectedServiceFeesVAT: serviceFeesVATForMonth,
        collectedServiceFeesExclVAT: serviceFeesExclVATForMonth,
        totalRevenue,
        totalCollectedAmount: collectedAmountForMonth,
        totalCollectedCount: statementsForMonth.length,
        totalGrossRevenue: totalGrossRevenueForMonth,
      };
    });

    // Start Adjustments calculator for yearly totals - Apply adjustments to all disbursed apps
    const yearlyAdjustments = adjustments.filter((adj) => {
      if (adj.type !== "disbursement") return false;
      return isSameYear(parseISO(adj.date), new Date(parseInt(year), 0, 1));
    });

    // Get all disbursed apps for the year
    const disbursedApps = applications.filter((app) => app.status === 7);

    // Apply adjustments to disbursed applications
    const adjustedDisbursedApps = applyDisbursementAdjustments(
      disbursedApps,
      yearlyAdjustments
    );

    const totalLoans = adjustedDisbursedApps.length;
    const totalLoanAmount = adjustedDisbursedApps.reduce(
      (acc, app) => acc + (app.loanapp__disbursement || 0),
      0
    );
    const totalCommission = adjustedDisbursedApps.reduce(
      (acc, app) => acc + (app.commission || 0),
      0
    );

    const allLoanRegions = adjustedDisbursedApps
      .reduce((acc, app) => {
        const name = app.province || "Unknown";
        const existing = acc.find((item) => item.name === name);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name, value: 1 });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value);

    let loanRegionsData = allLoanRegions;
    if (allLoanRegions.length > 10) {
      const top10 = allLoanRegions.slice(0, 10);
      const otherCount = allLoanRegions
        .slice(10)
        .reduce((acc, curr) => acc + curr.value, 0);
      loanRegionsData = [...top10, { name: "Others", value: otherCount }];
    }

    const loanRegionsDataWithColors = loanRegionsData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));

    const loanTypeData = adjustedDisbursedApps.reduce((acc, app) => {
      const name = app.product__type__en || "Unknown";
      const existing = acc.find((item) => item.name === name);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name, value: 1, fill: COLORS[acc.length % COLORS.length] });
      }
      return acc;
    }, [] as { name: string; value: number; fill: string }[]);
    // End Adjustments calculator

    const totalCollectedFees = monthlyData.reduce(
      (acc, month) => acc + month.collectedFees,
      0
    );
    const totalCollectedInterest = monthlyData.reduce(
      (acc, month) => acc + month.collectedInterest,
      0
    );
    const totalOverdueDebt = overdueDebtSchedules.reduce((acc, s) => {
      if (!s.detail) {
        return acc + (s.remain_amount || 0);
      }
      return acc;
    }, 0);
    const totalOverdueDebtCount = overdueLoansCount;

    const totalCollectedServiceFees = monthlyData.reduce(
      (acc, month) => acc + month.collectedServiceFees,
      0
    );
    const totalCollectedServiceFeesVAT = monthlyData.reduce(
      (acc, month) => acc + (month.collectedServiceFeesVAT || 0),
      0
    );
    const totalCollectedServiceFeesExclVAT = monthlyData.reduce(
      (acc, month) => acc + (month.collectedServiceFeesExclVAT || 0),
      0
    );
    const totalRevenue = monthlyData.reduce(
      (acc, month) => acc + month.totalRevenue,
      0
    );
    const totalCollectedAmount = monthlyData.reduce(
      (acc, month) => acc + month.totalCollectedAmount,
      0
    );
    const totalCollectedCount = monthlyData.reduce(
      (acc, month) => acc + month.totalCollectedCount,
      0
    );
    const totalGrossRevenue = totalCollectedAmount + totalCollectedServiceFees;

    // Calculate additional totals from loan_statements for the entire year
    const totalCollectedPrincipal = loanStatements.reduce(
      (acc, statement) => acc + (statement.principal_amount || 0),
      0
    );
    const totalOverdueFees = loanStatements.reduce(
      (acc, statement) => acc + (statement.overdue_fee || 0),
      0
    );
    const totalSettlementFees = loanStatements.reduce(
      (acc, statement) => acc + (statement.settlement_fee || 0),
      0
    );
    const totalRemainingAmount = loanStatements.reduce(
      (acc, statement) => acc + (statement.remaining_amount || 0),
      0
    );
    const totalVAT = loanStatements.reduce(
      (acc, statement) => acc + (statement.vat_amount || 0),
      0
    );

    // Calculate VAT amounts from loan_statements
    const totalInterestVAT = loanStatements.reduce(
      (acc, statement) => acc + (statement.interest_vat || 0),
      0
    );
    const totalManagementFeeVAT = loanStatements.reduce(
      (acc, statement) => acc + (statement.management_fee_vat || 0),
      0
    );
    const totalSettlementFeeVAT = loanStatements.reduce(
      (acc, statement) => acc + (statement.settlement_fee_vat || 0),
      0
    );

    return {
      totalLoans: totalLoans,
      totalLoanAmount: totalLoanAmount > 0 ? totalLoanAmount : 0,
      totalCommission,
      monthlyData,
      loanRegionsData: loanRegionsDataWithColors,
      loanTypeData,
      totalCollectedFees,
      totalCollectedInterest,
      totalOverdueDebt,
      totalOverdueDebtCount,
      totalCollectedServiceFees,
      totalCollectedServiceFeesVAT,
      totalCollectedServiceFeesExclVAT,
      totalRevenue,
      totalGrossRevenue,
      totalCollectedAmount,
      totalCollectedCount,
      totalCollectedPrincipal,
      totalOverdueFees,
      totalSettlementFees,
      totalRemainingAmount,
      totalVAT,
      totalInterestVAT,
      totalManagementFeeVAT,
      totalSettlementFeeVAT,
      outstandingLoans,
    };
  }, [
    applications,
    interestSchedules,
    feeSchedules,
    year,
    overdueDebtSchedules,
    overdueLoansCount,
    loanStatements,
    loanServiceFees,
    outstandingLoans,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <span
          className="cursor-pointer"
          onClick={() => (window.location.href = "/reports")}
        >
          Reports
        </span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">2. Monthly</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Monthly Loan Report for the Year
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(year)}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </h1>
      </div>

      <SummaryCards
        reportData={reportData}
        year={year}
        setYear={setYear}
        years={years}
        isAdmin={isAdmin}
      />

      {isAdmin && <MonthlyFinancialsChart data={reportData.monthlyData} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyStatusChart data={reportData.monthlyData} />
        <MonthlyLoanAmountChart data={reportData.monthlyData} />
        <MonthlySourceChart data={reportData.monthlyData} />
        <PieChartCard
          title="Loan Regions"
          data={reportData.loanRegionsData}
          label={renderCustomizedLabel}
          showLegend={false}
          labelLine={true}
        />
        <PieChartCard
          title="Loan Type Ratio"
          data={reportData.loanTypeData}
          legendLayout="vertical"
          legendAlign="right"
          legendVerticalAlign="middle"
          legendWrapperStyle={{ fontSize: "12px" }}
          legendIconSize={10}
        />
      </div>
    </div>
  );
}
