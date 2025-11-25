import {
  parseISO,
  isSameDay,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import type {
  Application,
  Adjustment,
  Statement,
  LoanServiceFee,
  LoanSchedule,
} from "./types";
import { applyDisbursementAdjustments } from "./adjustments";
import { CHART_COLORS } from "./constants";

/**
 * Filter adjustments by date
 */
export function filterAdjustmentsByDate(
  adjustments: Adjustment[],
  date: Date
): Adjustment[] {
  return adjustments.filter((adj) => {
    if (adj.type !== "disbursement") return false;
    return isSameDay(parseISO(adj.date), date);
  });
}

/**
 * Filter adjustments by month
 */
export function filterAdjustmentsByMonth(
  adjustments: Adjustment[],
  monthDate: Date
): Adjustment[] {
  return adjustments.filter((adj) => {
    if (adj.type !== "disbursement") return false;
    return isSameMonth(parseISO(adj.date), monthDate);
  });
}

/**
 * Filter adjustments by year
 */
export function filterAdjustmentsByYear(
  adjustments: Adjustment[],
  year: number
): Adjustment[] {
  return adjustments.filter((adj) => {
    if (adj.type !== "disbursement") return false;
    return isSameYear(parseISO(adj.date), new Date(year, 0, 1));
  });
}

/**
 * Filter adjustments by date range
 */
export function filterAdjustmentsByDateRange(
  adjustments: Adjustment[],
  startDate: Date | undefined,
  endDate: Date | undefined
): Adjustment[] {
  if (!startDate || !endDate) return [];

  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return adjustments.filter((adj) => {
    if (adj.type !== "disbursement") return false;
    const adjDate = parseISO(adj.date);
    return isWithinInterval(adjDate, { start, end });
  });
}

/**
 * Apply adjustments to disbursed applications
 */
export function getAdjustedDisbursedApplications(
  disbursedApplications: Application[],
  adjustments: Adjustment[]
): Application[] {
  return applyDisbursementAdjustments(disbursedApplications, adjustments);
}

/**
 * Calculate loan statistics
 */
export function calculateLoanStatistics(applications: Application[]) {
  const loanAmount = applications.reduce(
    (acc, app) => acc + (app.loanapp__disbursement || 0),
    0
  );

  const totalCommission = applications.reduce(
    (acc, app) => acc + (app.commission || 0),
    0
  );

  const averageLoanTerm =
    applications.length > 0
      ? applications.reduce((acc, app) => acc + (app.approve_term || 0), 0) /
        applications.length
      : 0;

  const commissionCount = applications.filter((app) => app.commission).length;

  return {
    loanAmount: loanAmount > 0 ? loanAmount : 0,
    totalCommission,
    averageLoanTerm: Math.round(averageLoanTerm),
    commissionCount,
  };
}

/**
 * Generate paper data (legal document types) chart data
 */
export function generatePaperData(applications: Application[]) {
  const paperData = [
    { name: "Căn cước công dân", code: "CCCD", value: 0, fill: "#3b82f6" },
    { name: "Hộ chiếu", code: "HC", value: 0, fill: "#a855f7" },
  ];

  applications.forEach((app) => {
    const code = app.legal_type__code || "Unknown";
    const existing = paperData.find((item) => item.code === code);
    if (existing) {
      existing.value += 1;
    }
  });

  return paperData;
}

/**
 * Generate region data chart data
 */
export function generateRegionData(
  applications: Application[],
  maxItems: number = 10
) {
  const allLoanRegions = applications
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
  if (allLoanRegions.length > maxItems) {
    const top = allLoanRegions.slice(0, maxItems);
    const otherCount = allLoanRegions
      .slice(maxItems)
      .reduce((acc, curr) => acc + curr.value, 0);
    regionData = [...top, { name: "Others", value: otherCount }];
  }

  return regionData.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));
}

/**
 * Generate status data chart data
 */
export function generateStatusData(applications: Application[]) {
  return [
    {
      name: "1. Newly Created",
      Applications: applications.filter((a) => a.status === 1).length,
    },
    {
      name: "2. Pending Review",
      Applications: applications.filter((a) => a.status === 2).length,
    },
    {
      name: "3. Request More Info",
      Applications: applications.filter((a) => a.status === 3).length,
    },
    {
      name: "4. Rejected",
      Applications: applications.filter((a) => a.status === 4).length,
    },
    {
      name: "5. Approved",
      Applications: applications.filter((a) => a.status === 5).length,
    },
    {
      name: "6. Contract signed",
      Applications: applications.filter((a) => a.status === 6).length,
    },
    {
      name: "7. Disbursed",
      Applications: applications.filter((a) => a.status === 7).length,
    },
  ];
}

/**
 * Generate type data (product types) chart data
 */
export function generateTypeData(applications: Application[]) {
  return applications.reduce((acc, app) => {
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
}

/**
 * Generate source data chart data
 */
export function generateSourceData(applications: Application[]) {
  const sourceData = [
    { name: "Apps", Applications: 0 },
    { name: "CTV", Applications: 0 },
    { name: "Website", Applications: 0 },
  ];

  applications.forEach((app) => {
    const sourceName = app.source__name || "Unknown";
    const source = sourceData.find((s) => s.name === sourceName);
    if (source) {
      source.Applications += 1;
    }
  });

  return sourceData;
}

/**
 * Calculate totals from loan_statements
 */
export function calculateStatementTotals(statements: Statement[]) {
  const collectedInterest = statements.reduce(
    (acc, statement) => acc + (statement.interest_amount || 0),
    0
  );

  const collectedFees = statements.reduce(
    (acc, statement) => acc + (statement.management_fee || 0),
    0
  );

  const totalCollectedPrincipal = statements.reduce(
    (acc, statement) => acc + (statement.principal_amount || 0),
    0
  );

  const totalOverdueFees = statements.reduce(
    (acc, statement) => acc + (statement.overdue_fee || 0),
    0
  );

  const totalSettlementFees = statements.reduce(
    (acc, statement) => acc + (statement.settlement_fee || 0),
    0
  );

  const totalRemainingAmount = statements.reduce(
    (acc, statement) => acc + (statement.remaining_amount || 0),
    0
  );

  const totalVAT = statements.reduce(
    (acc, statement) => acc + (statement.vat_amount || 0),
    0
  );

  const totalInterestVAT = statements.reduce(
    (acc, statement) => acc + (statement.interest_vat || 0),
    0
  );

  const totalManagementFeeVAT = statements.reduce(
    (acc, statement) => acc + (statement.management_fee_vat || 0),
    0
  );

  const totalSettlementFeeVAT = statements.reduce(
    (acc, statement) => acc + (statement.settlement_fee_vat || 0),
    0
  );

  return {
    collectedInterest,
    collectedFees,
    totalCollectedPrincipal,
    totalOverdueFees,
    totalSettlementFees,
    totalRemainingAmount,
    totalVAT,
    totalInterestVAT,
    totalManagementFeeVAT,
    totalSettlementFeeVAT,
  };
}

/**
 * Calculate totals from loan_service_fees
 */
export function calculateServiceFeeTotals(serviceFees: LoanServiceFee[]) {
  const collectedServiceFeesFromTable = serviceFees.reduce(
    (acc: number, fee: LoanServiceFee) => {
      return acc + (fee.total_amount || 0);
    },
    0
  );

  const collectedServiceFeesVAT = serviceFees.reduce(
    (acc: number, fee: LoanServiceFee) => {
      return acc + (fee.vat_amount || 0);
    },
    0
  );

  const collectedServiceFeesExclVAT = serviceFees.reduce(
    (acc: number, fee: LoanServiceFee) => {
      return acc + (fee.appraisal_fee || 0) + (fee.disbursement_fee || 0);
    },
    0
  );

  return {
    collectedServiceFees: collectedServiceFeesFromTable,
    collectedServiceFeesVAT,
    collectedServiceFeesExclVAT,
  };
}

/**
 * Filter statements by month
 */
export function filterStatementsByMonth(
  statements: Statement[],
  year: number,
  month: number
): Statement[] {
  return statements.filter((statement) => {
    if (!statement.payment_date) return false;
    try {
      const paymentDate = parseISO(statement.payment_date);
      return (
        paymentDate.getFullYear() === year && paymentDate.getMonth() === month
      );
    } catch {
      const targetYearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
      const paymentDateStr = statement.payment_date.substring(0, 7);
      return paymentDateStr === targetYearMonth;
    }
  });
}

/**
 * Filter service fees by month
 */
export function filterServiceFeesByMonth(
  serviceFees: LoanServiceFee[],
  year: number,
  month: number
): LoanServiceFee[] {
  return serviceFees.filter((fee) => {
    if (!fee.payment_date) return false;
    try {
      const paymentDate = parseISO(fee.payment_date);
      return (
        paymentDate.getFullYear() === year && paymentDate.getMonth() === month
      );
    } catch {
      const targetYearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
      const paymentDateStr = fee.payment_date.substring(0, 7);
      return paymentDateStr === targetYearMonth;
    }
  });
}

/**
 * Calculate overdue debt from schedules
 */
export function calculateOverdueDebt(
  overdueDebtSchedules: LoanSchedule[]
): number {
  return overdueDebtSchedules.reduce((acc, s) => {
    if (!s.detail) {
      return acc + (s.remain_amount || 0);
    }
    return acc;
  }, 0);
}

/**
 * Calculate potential amounts from schedules
 */
export function calculatePotentialAmounts(
  interestSchedules: LoanSchedule[],
  feeSchedules: LoanSchedule[]
) {
  const potentialInterest = interestSchedules.reduce((acc, s) => {
    const remaining = Math.max(0, (s.pay_amount || 0) - (s.paid_amount || 0));
    return acc + remaining;
  }, 0);

  const potentialFees = feeSchedules.reduce((acc, s) => {
    const remaining = Math.max(0, (s.pay_amount || 0) - (s.paid_amount || 0));
    return acc + remaining;
  }, 0);

  return {
    potentialInterest,
    potentialFees,
  };
}

/**
 * Calculate estimated profit from schedules
 */
export function calculateEstimatedProfit(
  interestSchedules: LoanSchedule[],
  feeSchedules: LoanSchedule[]
): number {
  return [...interestSchedules, ...feeSchedules].reduce(
    (sum, s) => sum + (s.pay_amount || 0),
    0
  );
}
