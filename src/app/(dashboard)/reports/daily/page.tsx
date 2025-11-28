"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays } from "date-fns";
import {
  type Application,
  type Statement,
  type LoanServiceFee,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronRight } from "lucide-react";
import SummaryCards from "@/components/reports/daily/summary-cards";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import LegalDocTypeChart from "@/components/reports/shared/legal-doc-type-chart";
import LoanAreasChart from "@/components/reports/daily/loan-areas-chart";
import StatusChart from "@/components/reports/daily/status-chart";
import LoanTypeChart from "@/components/reports/daily/loan-type-chart";
import SourceChart from "@/components/reports/daily/source-chart";
import { useAuth } from "@/context/AuthContext";
import { getAdjustments } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";
import { canAccessPage, canViewAllReports } from "@/lib/utils";
import { redirect } from "next/navigation";
import type { Adjustment } from "@/lib/types";
import {
  filterAdjustmentsByDate,
  getAdjustedDisbursedApplications,
  calculateLoanStatistics,
  generatePaperData,
  generateRegionData,
  generateStatusData,
  generateTypeData,
  generateSourceData,
  calculateStatementTotals,
  calculateServiceFeeTotals,
} from "@/lib/functions";
import {
  API_BASE_URL,
  API_VALUES,
  API_VALUES_DISBURSED,
} from "@/lib/constants";

export default function ReportsPage() {
  const { loginId, currentProfile } = useAuth();
  const canViewAll = canViewAllReports(currentProfile?.role);

  // Check access permission
  if (currentProfile && !canAccessPage(currentProfile.role, "/reports/daily")) {
    redirect("/");
  }
  const [date, setDate] = useState<Date>(subDays(new Date(), 1));
  const [createdApplications, setCreatedApplications] = useState<Application[]>(
    []
  );
  const [disbursedApplications, setDisbursedApplications] = useState<
    Application[]
  >([]);
  const [loanStatements, setLoanStatements] = useState<Statement[]>([]);
  const [loanServiceFees, setLoanServiceFees] = useState<LoanServiceFee[]>([]);
  const [outstandingLoans, setOutstandingLoans] = useState<number>(0);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState({
    total: 0,
    count: 0,
  });

  const fetchData = useCallback(
    async (selectedDate: Date) => {
      if (!loginId) return;
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        const createTimeFilter = encodeURIComponent(
          JSON.stringify({ create_time__date: formattedDate })
        );
        const disbursementDateFilter = encodeURIComponent(
          JSON.stringify({ loanapp__dbm_entry__date: formattedDate })
        );

        const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${createTimeFilter}&page=-1&login=${loginId}`;
        const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES_DISBURSED}&filter=${disbursementDateFilter}&page=-1&login=${loginId}`;

        // Outstanding loan amount should be the total amount outstanding at date checked (to date)
        // This means we need all loans that have outstanding > 0 at the selected date
        // We filter by disbursement date <= selectedDate to get all loans that were disbursed by that date
        const outstandingLoansFilter = encodeURIComponent(
          JSON.stringify({
            dbm_entry__date: formattedDate,
            outstanding__gt: 0,
          })
        );
        const outstandingLoansUrl = `https://api.y99.vn/data/Loan/?sort=-id&login=${loginId}&values=id,outstanding,code&filter=${outstandingLoansFilter}`;

        // Fetch loan_statements from Supabase
        const supabase = createClient();
        const supabaseQuery = supabase
          .from("loan_statements")
          .select("*")
          .eq("payment_date", formattedDate);

        // Fetch loan service fees from Supabase
        const serviceFeesQuery = supabase
          .from("loan_service_fees")
          .select("*")
          .eq("payment_date", formattedDate);

        const [
          createdResponse,
          disbursedResponse,
          outstandingLoansResponse,
          collectedAmountData,
          serviceFeesData,
          adjustmentsData,
        ] = await Promise.all([
          fetch(createdUrl),
          fetch(disbursedUrl),
          fetch(outstandingLoansUrl),
          supabaseQuery,
          serviceFeesQuery,
          getAdjustments(),
        ]);

        setAdjustments(adjustmentsData);

        const createdData = await createdResponse.json();
        const disbursedData = await disbursedResponse.json();
        const outstandingLoansData = await outstandingLoansResponse.json();

        setCreatedApplications(createdData.rows || []);
        setDisbursedApplications(disbursedData.rows || []);

        // Parse Supabase loan_statements data
        const { data: statementsData, error: statementsError } =
          collectedAmountData;

        if (statementsError) {
          console.error(
            "Error fetching loan statements from Supabase:",
            statementsError
          );
          setLoanStatements([]);
          setCollectedAmount({ total: 0, count: 0 });
        } else {
          const statements = (statementsData || []) as Statement[];
          setLoanStatements(statements);

          const totalCollected = statements.reduce(
            (acc: number, statement: Statement) => {
              return acc + (statement.total_amount || 0);
            },
            0
          );
          const collectedCount = statements.length;
          setCollectedAmount({ total: totalCollected, count: collectedCount });
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
        setCreatedApplications([]);
        setDisbursedApplications([]);
        setLoanStatements([]);
        setLoanServiceFees([]);
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
      fetchData(date);
    }
  }, [date, fetchData, loginId]);

  const handleRefresh = useCallback(() => {
    fetchData(date);
  }, [date, fetchData]);

  const reportData = useMemo(() => {
    const totalApplications = createdApplications.length;
    const totalRejected = createdApplications.filter(
      (app) => app.status === 4
    ).length;

    // Apply adjustments to disbursed applications
    const filteredAdjustmentsDisbursement = filterAdjustmentsByDate(
      adjustments,
      date
    );
    const adjustedDisbursedApplications = getAdjustedDisbursedApplications(
      disbursedApplications,
      filteredAdjustmentsDisbursement
    );

    const disbursedApps = adjustedDisbursedApplications;
    const loanStats = calculateLoanStatistics(disbursedApps);
    const totalCommission = createdApplications.reduce(
      (acc, app) => acc + (app.commission || 0),
      0
    );
    const commissionCount = createdApplications.filter(
      (app) => app.commission
    ).length;

    // Generate chart data
    const paperData = generatePaperData(adjustedDisbursedApplications);
    const regionData = generateRegionData(adjustedDisbursedApplications);
    const statusData = generateStatusData(createdApplications);
    const typeData = generateTypeData(adjustedDisbursedApplications);
    const sourceData = generateSourceData(createdApplications);

    // Calculate totals from statements and service fees
    const statementTotals = calculateStatementTotals(loanStatements);
    const serviceFeeTotals = calculateServiceFeeTotals(loanServiceFees);

    const totalRevenue =
      statementTotals.collectedFees + statementTotals.collectedInterest;
    const totalCollectedAmount = collectedAmount.total;
    const totalGrossRevenue =
      totalCollectedAmount + serviceFeeTotals.collectedServiceFees;

    return {
      totalApplications,
      totalRejected,
      loanAmount: loanStats.loanAmount,
      disbursedCount: disbursedApps.length,
      totalCommission,
      averageLoanTerm: loanStats.averageLoanTerm,
      paperData,
      regionData,
      statusData,
      typeData,
      sourceData,
      commissionCount,
      collectedFees: statementTotals.collectedFees,
      collectedInterest: statementTotals.collectedInterest,
      totalRevenue,
      totalCollectedAmount,
      totalGrossRevenue,
      collectedServiceFees: serviceFeeTotals.collectedServiceFees,
      collectedServiceFeesVAT: serviceFeeTotals.collectedServiceFeesVAT,
      collectedServiceFeesExclVAT: serviceFeeTotals.collectedServiceFeesExclVAT,
      totalCollectedPrincipal: statementTotals.totalCollectedPrincipal,
      totalOverdueFees: statementTotals.totalOverdueFees,
      totalSettlementFees: statementTotals.totalSettlementFees,
      totalRemainingAmount: statementTotals.totalRemainingAmount,
      totalVAT: statementTotals.totalVAT,
      totalInterestVAT: statementTotals.totalInterestVAT,
      totalManagementFeeVAT: statementTotals.totalManagementFeeVAT,
      totalSettlementFeeVAT: statementTotals.totalSettlementFeeVAT,
      outstandingLoans,
    };
  }, [
    createdApplications,
    disbursedApplications,
    loanStatements,
    loanServiceFees,
    date,
    collectedAmount,
    outstandingLoans,
    adjustments,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Daily Report
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => day && setDate(day)}
              defaultMonth={date}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <SummaryCards
        reportData={reportData}
        collectedAmount={collectedAmount}
        canViewAll={canViewAll}
        collectedServiceFees={reportData.collectedServiceFees}
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
