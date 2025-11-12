"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

type SummaryCardsProps = {
  reportData: {
    totalApplications: number;
    totalRejected: number;
    loanAmount: number;
    disbursedCount: number;
    totalCommission: number;
    averageLoanTerm: number;
    commissionCount: number;
    collectedFees: number;
    collectedInterest: number;
    totalRevenue: number;
    totalCollectedAmount: number;
    totalGrossRevenue: number;
    totalCollectedPrincipal: number;
    totalOverdueFees: number;
    totalSettlementFees: number;
    totalRemainingAmount: number;
    totalVAT: number;
    outstandingLoans: number;
  };
  collectedAmount: {
    total: number;
    count: number;
  };
  date: Date;
  setDate: (date: Date) => void;
  isAdmin: boolean;
  collectedServiceFees: number;
};

const currencyFormatter = new Intl.NumberFormat("de-DE", {});

export default function SummaryCards({
  reportData,
  collectedAmount,
  date,
  setDate,
  isAdmin,
  collectedServiceFees,
}: SummaryCardsProps) {
  const total_before_vat =
    reportData.collectedFees +
    reportData.collectedInterest +
    reportData.totalSettlementFees;

  const interest_ratio =
    total_before_vat > 0 ? reportData.collectedInterest / total_before_vat : 0;
  const management_fee_ratio =
    total_before_vat > 0 ? reportData.collectedFees / total_before_vat : 0;
  const settlement_fee_ratio =
    total_before_vat > 0
      ? reportData.totalSettlementFees / total_before_vat
      : 0;

  const collectedInterestVAT = Math.round(reportData.totalVAT * interest_ratio);
  const collectedFeeVAT = Math.round(
    reportData.totalVAT * management_fee_ratio
  );
  const settlementFeeVAT = Math.round(
    reportData.totalVAT * settlement_fee_ratio
  );

  const totalServiceFees = collectedServiceFees || 0;
  const serviceFeesExclVAT = Math.floor(totalServiceFees / 1.1);
  const vatOnServiceFees = totalServiceFees - serviceFeesExclVAT;

  const collectedFeeExcl = reportData.collectedFees || 0;
  const collectedFeeGross = reportData.collectedFees + collectedFeeVAT;

  const collectedInterestExcl = reportData.collectedInterest || 0;
  const collectedInterestGross =
    reportData.collectedInterest + collectedInterestVAT;

  const settlementFeeExcl = reportData.totalSettlementFees || 0;
  const settlementFeeGross = reportData.totalSettlementFees + settlementFeeVAT;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total applications
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
          <CardTitle className="text-sm font-medium">Total rejected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {reportData.totalRejected}
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
            <p className="text-2xl font-bold text-blue-600">
              {currencyFormatter.format(reportData.loanAmount)} ₫
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
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center px-2 h-7 rounded-md bg-red-600 text-white font-bold">
              {reportData.commissionCount}
            </div>
            <p className="text-2xl font-bold text-red-600">
              {currencyFormatter.format(reportData.totalCommission)} ₫
            </p>
          </div>
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
          {isAdmin && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 items-center gap-2 space-y-1">
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
              <div className="grid grid-cols-2 items-center gap-2 space-y-1">
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
              <div className="grid grid-cols-2 items-center gap-2 space-y-1">
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
      {isAdmin && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Revenue ( Fees &amp; Interest )
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-500">
                {currencyFormatter.format(reportData.totalRevenue || 0)} ₫
              </p>
            </CardContent>
          </Card>
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
              <p className="text-2xl font-bold text-yellow-600">
                {currencyFormatter.format(reportData.outstandingLoans || 0)} ₫
              </p>
            </CardContent>
          </Card>
        </>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
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
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
}
