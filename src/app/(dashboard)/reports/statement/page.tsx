
'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, MoreHorizontal, Pencil, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStatementDialog } from "@/components/add-statement-dialog";
import { type Statement } from "@/lib/data";

const initialStatementData: Statement[] = [
  {
    id: "1",
    paymentDate: "2024-07-01",
    principal: 5000000,
    interest: 500000,
    loanManagementFee: 50000,
    latePaymentPenalty: 0,
    settlementFee: 0,
    surplusCollection: 0,
    vatPayable: 55000,
  },
  {
    id: "2",
    paymentDate: "2024-08-01",
    principal: 5000000,
    interest: 450000,
    loanManagementFee: 50000,
    latePaymentPenalty: 100000,
    settlementFee: 0,
    surplusCollection: 0,
    vatPayable: 50000,
  },
  {
    id: "3",
    paymentDate: "2024-09-01",
    principal: 5000000,
    interest: 400000,
    loanManagementFee: 50000,
    latePaymentPenalty: 0,
    settlementFee: 0,
    surplusCollection: 20000,
    vatPayable: 45000,
  },
  {
    id: "4",
    paymentDate: "2025-10-26",
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
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});


export default function StatementPage() {
  const [statementData, setStatementData] = useState<Statement[]>(initialStatementData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);

  const openAddDialog = () => {
    setEditingStatement(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (statement: Statement) => {
    setEditingStatement(statement);
    setIsDialogOpen(true);
  };

  const handleSaveStatement = (statement: Omit<Statement, 'id'> & { id?: string }) => {
    if (statement.id) {
      // Update existing statement
      setStatementData(prevData =>
        prevData.map(s => (s.id === statement.id ? { ...s, ...statement } : s))
      );
    } else {
      // Add new statement
      setStatementData(prevData => [
        ...prevData,
        { ...statement, id: String(Date.now()) },
      ]);
    }
  };

  const handleReload = () => {
    setStatementData(initialStatementData);
  };
  
  return (
    <div className="space-y-6">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleReload}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Statement
              </Button>
            </div>
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
                <TableHead className="text-right">Tổng thu</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statementData.map((row) => {
                const totalCollection =
                  row.principal +
                  row.interest +
                  row.loanManagementFee +
                  row.latePaymentPenalty +
                  row.settlementFee +
                  row.surplusCollection;
                
                return (
                <TableRow key={row.id}>
                  <TableCell>{dateFormatter.format(new Date(row.paymentDate))}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.principal)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.interest)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.loanManagementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.latePaymentPenalty)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.settlementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.surplusCollection)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.vatPayable)}</TableCell>
                  <TableCell className="text-right font-bold">{currencyFormatter.format(totalCollection)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(row)}>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddStatementDialog
        key={editingStatement ? editingStatement.id : 'add'}
        onSave={handleSaveStatement}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        statementToEdit={editingStatement}
      />
    </div>
  );
}
