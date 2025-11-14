"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays, parseISO, isSameDay } from "date-fns";
import {
  type Application,
  type Statement,
  type LoanServiceFee,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronRight } from "lucide-react";
import SummaryCards from "@/components/reports/daily/summary-cards";
import LegalDocTypeChart from "@/components/reports/shared/legal-doc-type-chart";
import LoanAreasChart from "@/components/reports/daily/loan-areas-chart";
import StatusChart from "@/components/reports/daily/status-chart";
import LoanTypeChart from "@/components/reports/daily/loan-type-chart";
import SourceChart from "@/components/reports/daily/source-chart";
import { useAuth } from "@/context/AuthContext";
import { adjustments } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";
import { applyDisbursementAdjustments } from "@/lib/adjustments";

const COLORS = [
  "#3b82f6",
  "#a855f7",
  "#2dd4bf",
  "#f97316",
  "#ec4899",
  "#84cc16",
];
const API_BASE_URL = "https://api.y99.vn/data/Application/";
const API_VALUES =
  "id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date";

const API_VALUES_DISBURSED =
  "id,payment_status__code,loanapp__disbursement,loanapp__dbm_entry__date,approve_amount,approve_term,code,commission,country,country__name,country__en,legal_type__name,province,product__type__en,source__name,legal_type__code";

export default function ReportsPage() {
  const { loginId, isAdmin } = useAuth();
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

        // Fetch outstanding loans from loans disbursed on the selected date
        const outstandingLoansFilter = encodeURIComponent(
          JSON.stringify({
            dbm_entry__date: formattedDate,
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
        ] = await Promise.all([
          fetch(createdUrl),
          fetch(disbursedUrl),
          fetch(outstandingLoansUrl),
          supabaseQuery,
          serviceFeesQuery,
        ]);

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

    // Start Adjustments calculator - Apply adjustments to disbursedApplications
    // Filter adjustments for disbursement type on the selected date
    const filteredAdjustmentsDisbursement = adjustments.filter((adj) => {
      if (adj.type !== "disbursement") return false;
      return isSameDay(parseISO(adj.date), date);
    });

    // Apply adjustments to disbursed applications
    // All applications from API (filtered by loanapp__dbm_entry__date) already have status = 7
    // Virtual applications are also created with status = 7
    const adjustedDisbursedApplications = applyDisbursementAdjustments(
      disbursedApplications,
      filteredAdjustmentsDisbursement
    );

    const disbursedApps = adjustedDisbursedApplications;
    const loanAmount = disbursedApps.reduce(
      (acc, app) => acc + (app.loanapp__disbursement || 0),
      0
    );
    const totalCommission = createdApplications.reduce(
      (acc, app) => acc + (app.commission || 0),
      0
    );
    const averageLoanTerm =
      disbursedApps.length > 0
        ? disbursedApps.reduce((acc, app) => acc + (app.approve_term || 0), 0) /
          disbursedApps.length
        : 0;
    const commissionCount = createdApplications.filter(
      (app) => app.commission
    ).length;

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

    const regionData = adjustedDisbursedApplications
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
      .map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

    const statusData = [
      {
        name: "1. Newly Created",
        Applications: createdApplications.filter((a) => a.status === 1).length,
      },
      {
        name: "2. Pending Review",
        Applications: createdApplications.filter((a) => a.status === 2).length,
      },
      {
        name: "3. Request More Info",
        Applications: createdApplications.filter((a) => a.status === 3).length,
      },
      {
        name: "4. Rejected",
        Applications: createdApplications.filter((a) => a.status === 4).length,
      },
      {
        name: "5. Approved",
        Applications: createdApplications.filter((a) => a.status === 5).length,
      },
      {
        name: "6. Contract signed",
        Applications: createdApplications.filter((a) => a.status === 6).length,
      },
      {
        name: "7. Disbursed",
        Applications: createdApplications.filter((a) => a.status === 7).length,
      },
    ];

    console.log("adjustedDisbursedApplications", adjustedDisbursedApplications);

    const typeData = adjustedDisbursedApplications
      .reduce((acc, app) => {
        const name = app.product__type__en || "Unknown";
        const existing = acc.find((item) => item.name === name);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name, value: 1 });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

    const sourceData = [
      { name: "Apps", Applications: 0 },
      { name: "CTV", Applications: 0 },
      { name: "Website", Applications: 0 },
    ];
    createdApplications.forEach((app) => {
      const sourceName = app.source__name || "Unknown";
      const source = sourceData.find((s) => s.name === sourceName);
      if (source) {
        source.Applications += 1;
      }
    });

    // Calculate collected interest and fees from Supabase loan_statements
    const collectedInterest = loanStatements.reduce(
      (acc, statement) => acc + (statement.interest_amount || 0),
      0
    );

    const collectedFees = loanStatements.reduce(
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

    // End Adjustments calculator

    // Calculate collected service fees from loan_service_fees table
    const collectedServiceFeesFromTable = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.total_amount || 0);
      },
      0
    );

    // Calculate VAT amount from loan_service_fees
    const collectedServiceFeesVAT = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.vat_amount || 0);
      },
      0
    );

    // Calculate service fees excluding VAT
    const collectedServiceFeesExclVAT = loanServiceFees.reduce(
      (acc: number, fee: LoanServiceFee) => {
        return acc + (fee.appraisal_fee || 0) + (fee.disbursement_fee || 0);
      },
      0
    );

    // Use service fees from Supabase table only, no adjustments
    const finalCollectedServiceFees = collectedServiceFeesFromTable;

    const totalRevenue = collectedFees + collectedInterest;
    const totalCollectedAmount = collectedAmount.total;
    const totalGrossRevenue = totalCollectedAmount + finalCollectedServiceFees;

    return {
      totalApplications,
      totalRejected,
      loanAmount: loanAmount > 0 ? loanAmount : 0,
      disbursedCount: disbursedApps.length,
      totalCommission,
      averageLoanTerm: Math.round(averageLoanTerm),
      paperData,
      regionData,
      statusData,
      typeData,
      sourceData,
      commissionCount,
      collectedFees,
      collectedInterest,
      totalRevenue,
      totalCollectedAmount,
      totalGrossRevenue,
      collectedServiceFees: finalCollectedServiceFees,
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
    loanStatements,
    loanServiceFees,
    date,
    collectedAmount,
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
        <span className="font-semibold text-foreground">1. Daily</span>
      </div>

      <div className="flex items-center justify-between mt-6 mb-6">
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
      </div>

      <SummaryCards
        reportData={reportData}
        collectedAmount={collectedAmount}
        date={date}
        setDate={setDate}
        isAdmin={isAdmin}
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
