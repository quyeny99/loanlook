"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  format,
  startOfMonth,
  isWithinInterval,
  parseISO,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCards from "@/components/reports/date-range/summary-cards";
import LegalDocTypeChart from "@/components/reports/shared/legal-doc-type-chart";
import LoanRegionsChart from "@/components/reports/date-range/loan-regions-chart";
import StatusChart from "@/components/reports/date-range/status-chart";
import LoanTypeChart from "@/components/reports/daily/loan-type-chart";
import SourceChart from "@/components/reports/date-range/source-chart";
import {
  type Application,
  type Statement,
  type LoanServiceFee,
  type LoanSchedule,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { getAdjustments } from "@/lib/data";
import type { Adjustment } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { applyDisbursementAdjustments } from "@/lib/adjustments";
import { canAccessPage, canViewAllReports } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  API_BASE_URL,
  API_VALUES,
  API_VALUES_DISBURSED,
  LOAN_SCHEDULE_API_VALUES,
  currencyFormatter,
  CHART_COLORS,
} from "@/lib/constants";

export default function DateRangeReportsPage() {
  const { loginId, isAdmin, currentProfile } = useAuth();

  // Check access permission
  if (
    currentProfile &&
    !canAccessPage(currentProfile.role, "/reports/date-range")
  ) {
    redirect("/");
  }
  const canViewAll = canViewAllReports(currentProfile?.role);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [createdApplications, setCreatedApplications] = useState<Application[]>(
    []
  );
  const [disbursedApplications, setDisbursedApplications] = useState<
    Application[]
  >([]);
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
  const [collectedAmount, setCollectedAmount] = useState({
    total: 0,
    count: 0,
  });

  const fetchData = useCallback(
    async (start?: Date, end?: Date) => {
      if (!start || !end || !loginId) return;
      setLoading(true);
      try {
        const formattedFromDate = format(start, "yyyy-MM-dd");
        const formattedToDate = format(end, "yyyy-MM-dd");
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

        const disbursementFilter = encodeURIComponent(
          JSON.stringify({
            loanapp__dbm_entry__date__gte: formattedFromDate,
            loanapp__dbm_entry__date__lte: formattedToDate,
          })
        );

        const creationFilter = encodeURIComponent(
          JSON.stringify({
            create_time__date__gte: formattedFromDate,
            create_time__date__lte: formattedToDate,
          })
        );

        const overdueDebtFilter = encodeURIComponent(
          JSON.stringify({
            to_date__gte: "2025-08-01",
            to_date__lte: yesterday,
            remain_amount__gt: 0,
          })
        );

        const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES_DISBURSED}&filter=${disbursementFilter}&page=-1&login=${loginId}`;
        const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${creationFilter}&page=-1&login=${loginId}`;

        const loanScheduleInterestUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(
          ","
        )}&filter=${encodeURIComponent(JSON.stringify({ type: 2 }))}`;
        const loanScheduleFeesUrl = `https://api.y99.vn/data/Loan_Schedule/?login=${loginId}&sort=to_date,-type&values=${LOAN_SCHEDULE_API_VALUES.join(
          ","
        )}&filter=${encodeURIComponent(JSON.stringify({ type: 3 }))}`;
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

        // Outstanding loan amount should be the total amount outstanding at date checked (to date)
        // This means we need all loans that have outstanding > 0 at the toDate
        // We filter by disbursement date <= toDate to get all loans that were disbursed by that date
        const outstandingLoansFilter = encodeURIComponent(
          JSON.stringify({
            dbm_entry__date__lte: formattedToDate,
            outstanding__gt: 0,
          })
        );
        const outstandingLoansUrl = `https://api.y99.vn/data/Loan/?sort=-id&login=${loginId}&values=id,outstanding,code&filter=${outstandingLoansFilter}`;

        // Fetch collected amount from Supabase
        const supabase = createClient();
        const supabaseQuery = supabase
          .from("loan_statements")
          .select("*")
          .gte("payment_date", formattedFromDate)
          .lte("payment_date", formattedToDate);

        // Fetch loan service fees from Supabase
        const serviceFeesQuery = supabase
          .from("loan_service_fees")
          .select("*")
          .gte("payment_date", formattedFromDate)
          .lte("payment_date", formattedToDate);

        const [
          disbursedResponse,
          createdResponse,
          interestScheduleResponse,
          feeScheduleResponse,
          overdueDebtResponse,
          overdueLoansResponse,
          outstandingLoansResponse,
          collectedAmountData,
          serviceFeesData,
          adjustmentsData,
        ] = await Promise.all([
          fetch(disbursedUrl),
          fetch(createdUrl),
          fetch(loanScheduleInterestUrl),
          fetch(loanScheduleFeesUrl),
          fetch(overdueDebtUrl),
          fetch(overdueLoansUrl),
          fetch(outstandingLoansUrl),
          supabaseQuery,
          serviceFeesQuery,
          getAdjustments(),
        ]);

        const disbursedData = await disbursedResponse.json();
        const createdData = await createdResponse.json();
        const interestScheduleData = await interestScheduleResponse.json();
        const feeScheduleData = await feeScheduleResponse.json();
        const overdueDebtData = await overdueDebtResponse.json();
        const overdueLoansData = await overdueLoansResponse.json();
        const outstandingLoansData = await outstandingLoansResponse.json();

        setInterestSchedules(interestScheduleData.rows || []);
        setFeeSchedules(feeScheduleData.rows || []);
        setOverdueDebtSchedules(overdueDebtData.rows || []);
        setOverdueLoansCount(overdueLoansData.total_rows || 0);

        setDisbursedApplications(disbursedData.rows || []);
        setCreatedApplications(createdData.rows || []);

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
        setAdjustments(adjustmentsData);

        // Calculate collected amount from Supabase loan_statements
        const { data: statementsData, error: statementsError } =
          collectedAmountData;

        if (statementsError) {
          console.error(
            "Error fetching collected amount from Supabase:",
            statementsError
          );
          setCollectedAmount({ total: 0, count: 0 });
          setLoanStatements([]);
        } else {
          const statements = (statementsData || []) as Statement[];
          const totalCollected = statements.reduce(
            (acc: number, statement: Statement) => {
              return acc + (statement.total_amount || 0);
            },
            0
          );
          const collectedCount = statements.length;
          setCollectedAmount({ total: totalCollected, count: collectedCount });
          setLoanStatements(statements);
        }

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
      } catch (error) {
        console.error("Failed to fetch applications", error);
        setDisbursedApplications([]);
        setCreatedApplications([]);
        setInterestSchedules([]);
        setFeeSchedules([]);
        setOverdueDebtSchedules([]);
        setLoanStatements([]);
        setLoanServiceFees([]);
        setOverdueLoansCount(0);
        setOutstandingLoans(0);
        setCollectedAmount({ total: 0, count: 0 });
      } finally {
        setLoading(false);
      }
    },
    [loginId]
  );

  useEffect(() => {
    if (loginId) {
      fetchData(fromDate, toDate);
    }
  }, [fromDate, toDate, fetchData, loginId]);

  const reportData = useMemo(() => {
    const totalApplications = createdApplications.length;

    // Start Adjustments calculator - Apply adjustments to disbursedApplications
    const startDate = fromDate ? startOfDay(fromDate) : parseISO("2025-08-01");
    const endDate = toDate ? endOfDay(toDate) : parseISO("2025-08-01");

    // Filter adjustments for disbursement type within date range
    const filteredAdjustmentsDisbursement =
      fromDate && toDate
        ? adjustments.filter((adj) => {
            if (adj.type !== "disbursement") return false;
            const adjDate = parseISO(adj.date);
            return isWithinInterval(adjDate, {
              start: startDate,
              end: endDate,
            });
          })
        : [];

    // Apply adjustments to disbursed applications
    const adjustedDisbursedApplications = applyDisbursementAdjustments(
      disbursedApplications,
      filteredAdjustmentsDisbursement
    );

    // Filter to only disbursed apps (status === 7)
    const disbursedApps = adjustedDisbursedApplications;

    const totalLoanAmount = disbursedApps.reduce(
      (acc, app) => acc + (app.loanapp__disbursement || 0),
      0
    );
    const totalCommission = disbursedApps.reduce(
      (acc, app) => acc + (app.commission || 0),
      0
    );
    const averageLoanTerm =
      disbursedApps.length > 0
        ? Math.round(
            disbursedApps.reduce(
              (acc, app) => acc + (app.approve_term || 0),
              0
            ) / disbursedApps.length
          )
        : 0;

    const paperData = [
      { name: "Căn cước công dân", code: "CCCD", value: 0, fill: "#3b82f6" },
      { name: "Hộ chiếu", code: "HC", value: 0, fill: "#a855f7" },
    ];
    adjustedDisbursedApplications.forEach((app) => {
      const code = app.legal_type__code || "Unknown";
      const existing = paperData.find((item) => item.code === code);
      if (existing) {
        existing.value += 1;
      }
    });

    const allLoanRegions = adjustedDisbursedApplications
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

    let regionData = allLoanRegions;
    if (allLoanRegions.length > 10) {
      const top10 = allLoanRegions.slice(0, 10);
      const otherCount = allLoanRegions
        .slice(10)
        .reduce((acc, curr) => acc + curr.value, 0);
      regionData = [...top10, { name: "Others", value: otherCount }];
    }

    const regionDataWithColors = regionData.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const statusData = [
      {
        name: "1. Newly Created",
        "Total applications": createdApplications.filter((a) => a.status === 1)
          .length,
      },
      {
        name: "2. Pending Review",
        "Total applications": createdApplications.filter((a) => a.status === 2)
          .length,
      },
      {
        name: "3. Request More Info",
        "Total applications": createdApplications.filter((a) => a.status === 3)
          .length,
      },
      {
        name: "4. Rejected",
        "Total applications": createdApplications.filter((a) => a.status === 4)
          .length,
      },
      {
        name: "5. Approved",
        "Total applications": createdApplications.filter((a) => a.status === 5)
          .length,
      },
      {
        name: "6. Contract signed",
        "Total applications": createdApplications.filter((a) => a.status === 6)
          .length,
      },
      {
        name: "7. Disbursed",
        "Total applications": createdApplications.filter((a) => a.status === 7)
          .length,
      },
    ];

    const typeData = adjustedDisbursedApplications.reduce((acc, app) => {
      const name = app.product__type__en || "Unknown";
      const existing = acc.find((item) => item.name === name);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({
          name,
          value: 1,
          fill: CHART_COLORS[acc.length % CHART_COLORS.length],
        });
      }
      return acc;
    }, [] as { name: string; value: number; fill: string }[]);

    const sourceData = [
      { name: "Apps", "Total applications": 0 },
      { name: "CTV", "Total applications": 0 },
      { name: "Website", "Total applications": 0 },
    ];
    createdApplications.forEach((app) => {
      const sourceName = app.source__name || "Unknown";
      const source = sourceData.find((s) => s.name === sourceName);
      if (source) {
        source["Total applications"] += 1;
      }
    });

    // End Adjustments calculator

    // Calculate collected interest and fees from Supabase loan_statements
    const collectedInterestFromStatements = loanStatements.reduce(
      (acc, statement) => acc + (statement.interest_amount || 0),
      0
    );
    const collectedFeesFromStatements = loanStatements.reduce(
      (acc, statement) => acc + (statement.management_fee || 0),
      0
    );

    // Calculate additional totals from loan_statements
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

    // Keep the old calculations for potential amounts (still from API)
    const collectedInterest = collectedInterestFromStatements;
    const collectedFees = collectedFeesFromStatements;

    const potentialInterest = interestSchedules.reduce((acc, s) => {
      const remaining = Math.max(0, (s.pay_amount || 0) - (s.paid_amount || 0));
      return acc + remaining;
    }, 0);

    const potentialFees = feeSchedules.reduce((acc, s) => {
      const remaining = Math.max(0, (s.pay_amount || 0) - (s.paid_amount || 0));
      return acc + remaining;
    }, 0);

    const overdueDebt = overdueDebtSchedules.reduce((acc, s) => {
      if (!s.detail) {
        return acc + (s.remain_amount || 0);
      }
      return acc;
    }, 0);
    const overdueDebtCount = overdueLoansCount;

    // Calculate collected service fees from loan_service_fees table
    const collectedServiceFeesFromTable = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.total_amount || 0);
      },
      0
    );

    // Calculate VAT amount from loan_service_fees (sum of vat_amount)
    const collectedServiceFeesVAT = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.vat_amount || 0);
      },
      0
    );

    // Calculate service fees excluding VAT (sum of fees without VAT)
    const collectedServiceFeesExclVAT = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.appraisal_fee || 0) + (fee.disbursement_fee || 0);
      },
      0
    );

    // Use loan_service_fees as primary source
    const collectedServiceFees = collectedServiceFeesFromTable;

    const estimatedProfit = [...interestSchedules, ...feeSchedules].reduce(
      (sum, s) => sum + s.pay_amount,
      0
    );

    console.log("adjustedDisbursedApplications", adjustedDisbursedApplications);

    const totalCollectedAmount = collectedAmount.total;
    const totalGrossRevenue = totalCollectedAmount + collectedServiceFees;

    return {
      totalApplications,
      disbursedCount: disbursedApps.length,
      totalLoanAmount: totalLoanAmount < 0 ? 0 : totalLoanAmount,
      totalCommission,
      averageLoanTerm: averageLoanTerm,
      paperData,
      regionData: regionDataWithColors,
      statusData,
      typeData,
      sourceData,
      collectedFees: collectedFees,
      potentialFees: potentialFees,
      collectedInterest: collectedInterest,
      potentialInterest: potentialInterest,
      overdueDebt,
      overdueDebtCount,
      estimatedProfit,
      totalCollectedAmount,
      totalGrossRevenue,
      collectedServiceFees: collectedServiceFees,
      collectedServiceFeesVAT: collectedServiceFeesVAT,
      collectedServiceFeesExclVAT: collectedServiceFeesExclVAT,
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
    createdApplications,
    disbursedApplications,
    interestSchedules,
    feeSchedules,
    fromDate,
    toDate,
    overdueDebtSchedules,
    overdueLoansCount,
    collectedAmount,
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
        <span className="font-semibold text-foreground">3. Date Range</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Loan Report by Date Range
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(fromDate, toDate)}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
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
        canViewAll={canViewAll}
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
