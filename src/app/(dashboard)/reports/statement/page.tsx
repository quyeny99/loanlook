
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
import { DeleteStatementDialog } from "@/components/delete-statement-dialog";
import { type Statement } from "@/lib/data";

const initialStatementData: Statement[] = [
  {
    id: "1",
    loanCode: "LN001",
    notes: "Đây là ghi chú cho khoản thanh toán đầu tiên.",
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
    loanCode: "LN002",
    notes: "Ghi chú này có thể dài hơn một chút để kiểm tra việc xuống dòng.",
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
    loanCode: "LN003",
    notes: "Thanh toán đúng hạn.",
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
    loanCode: "LN004",
    notes: "Khách hàng tất toán sớm.",
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

const currencyFormatter = new Intl.NumberFormat('de-DE', {});
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});


export default function StatementPage() {
  const [statementData, setStatementData] = useState<Statement[]>(initialStatementData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null);

  const openAddDialog = () => {
    setEditingStatement(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (statement: Statement) => {
    setEditingStatement(statement);
    setIsAddDialogOpen(true);
  };
  
  const openDeleteDialog = (statement: Statement) => {
    setStatementToDelete(statement);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveStatement = (statement: Omit<Statement, 'id'> & { id?: string }) => {
    if (statement.id) {
      // Update existing statement
      setStatementData(prevData =>
        prevData.map(s => (s.id === statement.id ? { ...s, ...statement } as Statement : s))
      );
    } else {
      // Add new statement
      setStatementData(prevData => [
        ...prevData,
        { ...statement, id: String(Date.now()) } as Statement,
      ]);
    }
  };

  const handleDeleteStatement = () => {
    if (statementToDelete) {
      setStatementData(prevData => prevData.filter(s => s.id !== statementToDelete.id));
      setStatementToDelete(null);
    }
  };

  const handleReload = () => {
    setStatementData(initialStatementData);
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center text-sm text-muted-foreground">
        <span className='cursor-pointer' onClick={() => window.location.href = '/reports'}>Báo cáo</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-foreground">Sao kê</span>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sao kê tài khoản</CardTitle>
              <CardDescription>
                Chi tiết các khoản thanh toán và phí vay.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleReload}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sao kê
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead className="text-right">Gốc</TableHead>
                <TableHead className="text-right">Lãi vay</TableHead>
                <TableHead className="text-right">Phí quản lý</TableHead>
                <TableHead className="text-right">Phí trễ hạn</TableHead>
                <TableHead className="text-right">Phí tất toán</TableHead>
                <TableHead className="text-right">Thu dư</TableHead>
                <TableHead className="text-right">Thuế GTGT</TableHead>
                <TableHead className="text-right">Tổng thu</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
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
                  <TableCell>{row.loanCode}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(row.paymentDate))}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.principal)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.interest)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.loanManagementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.latePaymentPenalty)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.settlementFee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.surplusCollection)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.vatPayable)}</TableCell>
                  <TableCell className="text-right font-bold">{currencyFormatter.format(totalCollection)}</TableCell>
                  <TableCell>
                    <div className="min-w-[150px] whitespace-normal break-words">
                      {row.notes}
                    </div>
                  </TableCell>
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
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => openDeleteDialog(row)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
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
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        statementToEdit={editingStatement}
      />
      <DeleteStatementDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteStatement}
        statement={statementToDelete}
      />
    </div>
  );
}
