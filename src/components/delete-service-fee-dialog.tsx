"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { type LoanServiceFee } from "@/lib/data";

type DeleteServiceFeeDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  serviceFee: LoanServiceFee | null;
};

export function DeleteServiceFeeDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  serviceFee,
}: DeleteServiceFeeDialogProps) {
  const [inputId, setInputId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInputId("");
    }
  }, [isOpen]);

  if (!serviceFee) {
    return null;
  }

  const isMatch = inputId === serviceFee.id;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc chắn muốn xóa phí dịch vụ này?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Hành động này sẽ xóa vĩnh viễn
            phí dịch vụ này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Để xác nhận, vui lòng nhập ID của phí dịch vụ:{" "}
            <strong className="text-foreground">{serviceFee.id}</strong>
          </p>
          <Input value={inputId} onChange={(e) => setInputId(e.target.value)} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!isMatch}
            className="bg-red-600 hover:bg-red-700"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

