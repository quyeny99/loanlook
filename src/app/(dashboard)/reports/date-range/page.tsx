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
  type InternalEntry,
  type Statement,
} from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { adjustments } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";

const COLORS = [
  "#3b82f6",
  "#a855f7",
  "#2dd4bf",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
];
const currencyFormatter = new Intl.NumberFormat("de-DE", {});
const API_BASE_URL = "https://api.y99.vn/data/Application/";
const API_VALUES =
  "id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date";
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

type LoanSchedule = {
  id: number;
  type: number;
  status: number;
  paid_amount: number;
  remain_amount: number;
  ovd_amount: number;
  itr_income: number;
  to_date: string;
  pay_amount: number;
  detail: {
    paid: number;
    time: string;
    pay_amount: number;
  }[];
};

export default function DateRangeReportsPage() {
  const { loginId, isAdmin } = useAuth();
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
  const [serviceFeeEntries, setServiceFeeEntries] = useState<InternalEntry[]>(
    []
  );
  const [loanStatements, setLoanStatements] = useState<Statement[]>([]);
  const [overdueLoansCount, setOverdueLoansCount] = useState<number>(0);
  const [outstandingLoans, setOutstandingLoans] = useState<number>(0);
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

        const serviceFeesFilter = encodeURIComponent(
          JSON.stringify({
            account__code: "HOAC03VND",
            date__gte: formattedFromDate,
            date__lte: formattedToDate,
          })
        );

        const overdueDebtFilter = encodeURIComponent(
          JSON.stringify({
            to_date__gte: "2025-08-01",
            to_date__lte: yesterday,
            remain_amount__gt: 0,
          })
        );

        const disbursedUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${disbursementFilter}&page=-1&login=${loginId}`;
        const createdUrl = `${API_BASE_URL}?sort=-id&values=${API_VALUES}&filter=${creationFilter}&page=-1&login=${loginId}`;
        const serviceFeesUrl = `https://api.y99.vn/data/Internal_Entry/?sort=-id&values=id,amount,type&filter=${serviceFeesFilter}&login=${loginId}`;

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

        const outstandingLoansFilter = encodeURIComponent(
          JSON.stringify({
            dbm_entry__date__gte: formattedFromDate,
            dbm_entry__date__lte: formattedToDate,
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

        const [
          disbursedResponse,
          createdResponse,
          serviceFeesResponse,
          interestScheduleResponse,
          feeScheduleResponse,
          overdueDebtResponse,
          overdueLoansResponse,
          outstandingLoansResponse,
          collectedAmountData,
        ] = await Promise.all([
          fetch(disbursedUrl),
          fetch(createdUrl),
          fetch(serviceFeesUrl),
          fetch(loanScheduleInterestUrl),
          fetch(loanScheduleFeesUrl),
          fetch(overdueDebtUrl),
          fetch(overdueLoansUrl),
          fetch(outstandingLoansUrl),
          supabaseQuery,
        ]);

        const disbursedData = await disbursedResponse.json();
        const createdData = await createdResponse.json();
        const serviceFeesData = await serviceFeesResponse.json();
        const interestScheduleData = await interestScheduleResponse.json();
        const feeScheduleData = await feeScheduleResponse.json();
        const overdueDebtData = await overdueDebtResponse.json();
        const overdueLoansData = await overdueLoansResponse.json();
        const outstandingLoansData = await outstandingLoansResponse.json();

        setInterestSchedules(interestScheduleData.rows || []);
        setFeeSchedules(feeScheduleData.rows || []);
        setOverdueDebtSchedules(overdueDebtData.rows || []);
        setServiceFeeEntries(serviceFeesData.rows || []);
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
          console.log(statements);
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
      } catch (error) {
        console.error("Failed to fetch applications", error);
        setDisbursedApplications([]);
        setCreatedApplications([]);
        setInterestSchedules([]);
        setFeeSchedules([]);
        setOverdueDebtSchedules([]);
        setServiceFeeEntries([]);
        setLoanStatements([]);
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
    const disbursedApps = disbursedApplications.filter(
      (app) => app.status === 7
    );
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
      { name: "Căn cước công dân", value: 0, fill: "#3b82f6" },
      { name: "Hộ chiếu", value: 0, fill: "#a855f7" },
    ];
    disbursedApplications.forEach((app) => {
      const name = app.legal_type__name || "Unknown";
      const existing = paperData.find((item) => item.name === name);
      if (existing) {
        existing.value += 1;
      }
    });

    const allLoanRegions = disbursedApplications
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
      fill: COLORS[index % COLORS.length],
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

    const typeData = disbursedApplications.reduce((acc, app) => {
      const name = app.product__type__en || "Unknown";
      const existing = acc.find((item) => item.name === name);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name, value: 1, fill: COLORS[acc.length % COLORS.length] });
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

    const startDate = fromDate ? startOfDay(fromDate) : parseISO("2025-08-01");
    const endDate = toDate ? endOfDay(toDate) : parseISO("2025-08-01");

    // Start Adjustments calculator

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

    const totalAdjustmentDisbursement = filteredAdjustmentsDisbursement.reduce(
      (sum, adj) => sum + adj.amount,
      0
    );

    const countAdjustmentDisbursement = filteredAdjustmentsDisbursement.reduce(
      (sum, adj) => {
        if (adj.amount > 0) sum += 1;
        else if (adj.amount < 0) sum -= 1;
        return sum;
      },
      0
    );

    const filteredServiceFees =
      fromDate && toDate
        ? adjustments.filter((adj) => {
            if (adj.type !== "service_fee") return false;
            const adjDate = parseISO(adj.date);
            return isWithinInterval(adjDate, {
              start: startDate,
              end: endDate,
            });
          })
        : [];

    const totalAdjustmentServiceFee = filteredServiceFees.reduce(
      (sum, adj) => sum + adj.amount,
      0
    );

    const totalAdjustmentPotentialFee = adjustments.reduce((sum, adj) => {
      if (
        adj.type === "potential_fee" &&
        isWithinInterval(parseISO(adj.date), { start: startDate, end: endDate })
      ) {
        return sum + adj.amount;
      }
      return sum;
    }, 0);

    const totalAdjustmentPotentialInterest = adjustments.reduce((sum, adj) => {
      if (
        adj.type === "potential_interest" &&
        isWithinInterval(parseISO(adj.date), { start: startDate, end: endDate })
      ) {
        return sum + adj.amount;
      }
      return sum;
    }, 0);

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

    const collectedServiceFees = serviceFeeEntries.reduce(
      (acc: number, entry: InternalEntry) => {
        if (entry.type === 1) {
          return acc + entry.amount;
        } else if (entry.type === 2) {
          return acc - entry.amount;
        }
        return acc;
      },
      0
    );

    const estimatedProfit = [...interestSchedules, ...feeSchedules].reduce(
      (sum, s) => sum + s.pay_amount,
      0
    );

    const totalCollectedAmount = collectedAmount.total;
    const totalGrossRevenue = totalCollectedAmount + collectedServiceFees;

    return {
      totalApplications,
      disbursedCount:
        disbursedApps.length + countAdjustmentDisbursement > 0
          ? disbursedApps.length + countAdjustmentDisbursement
          : 0,
      totalLoanAmount:
        totalLoanAmount + totalAdjustmentDisbursement < 0
          ? 0
          : totalLoanAmount + totalAdjustmentDisbursement,
      totalCommission,
      averageLoanTerm: averageLoanTerm,
      paperData,
      regionData: regionDataWithColors,
      statusData,
      typeData,
      sourceData,
      collectedFees: collectedFees,
      potentialFees: potentialFees + totalAdjustmentPotentialFee,
      collectedInterest: collectedInterest,
      potentialInterest: potentialInterest + totalAdjustmentPotentialInterest,
      overdueDebt,
      overdueDebtCount,
      estimatedProfit,
      totalCollectedAmount,
      totalGrossRevenue,
      collectedServiceFees: collectedServiceFees + totalAdjustmentServiceFee,
      totalCollectedPrincipal,
      totalOverdueFees,
      totalSettlementFees,
      totalRemainingAmount,
      totalVAT,
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
    serviceFeeEntries,
    collectedAmount,
    loanStatements,
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
        isAdmin={isAdmin}
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
