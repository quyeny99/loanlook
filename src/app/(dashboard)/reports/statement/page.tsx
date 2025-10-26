
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statementData = [
  {
    paymentDate: "01/07/2024 09:30",
    principal: 5000000,
    interest: 500000,
    loanManagementFee: 50000,
    latePaymentPenalty: 0,
    settlementFee: 0,
    surplusCollection: 0,
    vatPayable: 55000,
  },
  {
    paymentDate: "01/08/2024 14:15",
    principal: 5000000,
    interest: 450000,
    loanManagementFee: 50000,
    latePaymentPenalty: 100000,
    settlementFee: 0,
    surplusCollection: 0,
    vatPayable: 50000,
  },
  {
    paymentDate: "01/09/2024 11:00",
    principal: 5000000,
    interest: 400000,
    loanManagementFee: 50000,
    latePaymentPenalty: 0,
    settlementFee: 0,
    surplusCollection: 20000,
    vatPayable: 45000,
  },
  {
    paymentDate: "26/10/2025 09:40",
    principal: 5000000,
    interest: 350000,
    loanManagementFee: 50000,
    latePaymentPenalty: 0,
    settlementFee: 1000000,
    surplusCollection: 0,
    vatPayable: 40000,
  },
];

const currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' });

export default function StatementPage() {
  return (
    <div className="space-y-6 mt-10">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Reports</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">Statement</span>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statement of Account</CardTitle>
              <CardDescription>
                Detailed breakdown of loan payments and fees.
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Statement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead className="text-right">Gốc</TableHead>
                <TableHead className="text-right">Lãi vay</TableHead>
                <TableHead className="text-right">Phí quản lý khoản vay</TableHead>
                <TableHead className="text-right">Phí phạt trễ hạn</TableHead>
                <TableHead className="text-right">Phí tất toán</TableHead>
                <TableHead className="text-right">Thu dư</TableHead>
                <TableHead className="text-right">Thuế GTGT phải nộp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statementData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.paymentDate}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.principal)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.interest)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.loanManagementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.latePaymentPenalty)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.settlementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.surplusCollection)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.vatPayable)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
