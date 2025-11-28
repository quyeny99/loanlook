"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type SummaryCardsProps = {
  fromDate: Date | undefined;
  setFromDate: (date: Date | undefined) => void;
  toDate: Date | undefined;
  setToDate: (date: Date | undefined) => void;
  currencyFormatter: Intl.NumberFormat;
  reportData: {
    totalApplications: number;
    disbursedCount: number;
    totalLoanAmount: number;
    averageLoanTerm: number;
    totalCommission: number;
    collectedFees: number;
    potentialFees: number;
    collectedInterest: number;
    potentialInterest: number;
    overdueDebt: number;
    overdueDebtCount: number;
    estimatedProfit: number;
    totalCollectedAmount: number;
    totalGrossRevenue: number;
    collectedServiceFees: number;
    collectedServiceFeesVAT: number;
    collectedServiceFeesExclVAT: number;
    totalCollectedPrincipal: number;
    totalOverdueFees: number;
    totalSettlementFees: number;
    totalRemainingAmount: number;
    totalVAT: number;
    totalInterestVAT: number;
    totalManagementFeeVAT: number;
    totalSettlementFeeVAT: number;
    outstandingLoans: number;
  };
  canViewAll: boolean;
  collectedAmount: {
    total: number;
    count: number;
  };
};

export default function SummaryCards({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  currencyFormatter,
  reportData,
  canViewAll,
  collectedAmount,
}: SummaryCardsProps) {
  // Use VAT amounts directly from loan_statements
  const collectedInterestVAT = reportData.totalInterestVAT || 0;
  const collectedFeeVAT = reportData.totalManagementFeeVAT || 0;
  const settlementFeeVAT = reportData.totalSettlementFeeVAT || 0;

  const totalServiceFees = reportData.collectedServiceFees || 0;
  // Use actual values from loan_service_fees table
  const serviceFeesExclVAT = reportData.collectedServiceFeesExclVAT || 0;
  const vatOnServiceFees = reportData.collectedServiceFeesVAT || 0;

  const collectedFeeExcl = reportData.collectedFees || 0;
  const collectedFeeGross = reportData.collectedFees + collectedFeeVAT;

  const collectedInterestExcl = reportData.collectedInterest || 0;
  const collectedInterestGross =
    reportData.collectedInterest + collectedInterestVAT;

  const settlementFeeExcl = reportData.totalSettlementFees || 0;
  const settlementFeeGross = reportData.totalSettlementFees + settlementFeeVAT;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">
            {reportData.totalApplications}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center px-2 h-7 rounded-md bg-blue-500 text-white font-bold">
              {reportData.disbursedCount}
            </div>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(reportData.totalLoanAmount)} ₫
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Average Loan Term
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {reportData.averageLoanTerm} months
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {currencyFormatter.format(reportData.totalCommission)} ₫
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Collected Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center px-2 h-7 rounded-md bg-orange-500 text-white font-bold">
              {collectedAmount.count}
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {currencyFormatter.format(reportData.totalCollectedAmount)} ₫
            </p>
          </div>
          {canViewAll && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="grid grid-cols-1 xl:grid-cols-2 items-center gap-2 space-y-1">
                <p>
                  Collected Fee (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedFeeExcl)} ₫
                  </span>
                </p>
                <p>
                  Collected Interest (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedInterestExcl)} ₫
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 items-center gap-2 space-y-1">
                <p>
                  Collected Principal:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(
                      reportData.totalCollectedPrincipal
                    )}{" "}
                    ₫
                  </span>
                </p>
                <p>
                  Collected Overdue Fees:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(reportData.totalOverdueFees)} ₫
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 items-center gap-2 space-y-1">
                <p>
                  Collected VAT:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(reportData.totalVAT)} ₫
                  </span>
                </p>

                <p>
                  Collected Remaining Amount:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(reportData.totalRemainingAmount)}{" "}
                    ₫
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 my-10">
                <p>
                  Collected Settlement Fees (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(settlementFeeExcl)} ₫
                  </span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Collected Service Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">
            {currencyFormatter.format(totalServiceFees)} ₫
          </p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>
              Service Fees (excl. VAT):{" "}
              <span className="font-semibold text-foreground">
                {currencyFormatter.format(serviceFeesExclVAT)} ₫
              </span>
            </p>
            <p>
              VAT Amount (10%):{" "}
              <span className="font-semibold text-foreground">
                {currencyFormatter.format(vatOnServiceFees)} ₫
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {canViewAll && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-indigo-500">
                {currencyFormatter.format(collectedFeeGross)} ₫
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  Collected Fee (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedFeeExcl)} ₫
                  </span>
                </p>
                <p>
                  VAT Amount (10%):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedFeeVAT)} ₫
                  </span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Potential:{" "}
                <span className="font-semibold text-foreground">
                  {currencyFormatter.format(reportData.potentialFees || 0)} ₫
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-teal-500">
                {currencyFormatter.format(collectedInterestGross)} ₫
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  Collected Interest (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedInterestExcl)} ₫
                  </span>
                </p>
                <p>
                  VAT Amount (10%):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedInterestVAT)} ₫
                  </span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Potential:{" "}
                <span className="font-semibold text-foreground">
                  {currencyFormatter.format(reportData.potentialInterest || 0)}{" "}
                  ₫
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">
                {currencyFormatter.format(
                  reportData.totalCollectedPrincipal || 0
                )}{" "}
                ₫
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Overdue Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">
                {currencyFormatter.format(reportData.totalOverdueFees || 0)} ₫
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Settlement Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-700">
                {currencyFormatter.format(settlementFeeGross)} ₫
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  Settlement Fees (excl. VAT):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(settlementFeeExcl)} ₫
                  </span>
                </p>
                <p>
                  VAT Amount (10%):{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(settlementFeeVAT)} ₫
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected Remaining Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-cyan-600">
                {currencyFormatter.format(reportData.totalRemainingAmount || 0)}{" "}
                ₫
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Collected VAT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-pink-600">
                {currencyFormatter.format(reportData.totalVAT || 0)} ₫
              </p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  VAT Fee:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedFeeVAT)} ₫
                  </span>
                </p>
                <p>
                  VAT Interest:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(collectedInterestVAT)} ₫
                  </span>
                </p>
                <p>
                  VAT Settlement Fees:{" "}
                  <span className="font-semibold text-foreground">
                    {currencyFormatter.format(settlementFeeVAT)} ₫
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Outstanding Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-blue-500">
                  {currencyFormatter.format(reportData.outstandingLoans || 0)} ₫
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Overdue Debt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-500 text-white font-bold">
                  {reportData.overdueDebtCount}
                </div>
                <p className="text-2xl font-bold text-red-500">
                  {currencyFormatter.format(reportData.overdueDebt || 0)} ₫
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Estimated Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-500">
                {currencyFormatter.format(reportData.estimatedProfit || 0)} ₫
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
