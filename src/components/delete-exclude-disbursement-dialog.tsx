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
import type { ExcludeDisbursement } from "@/lib/types";

type DeleteExcludeDisbursementDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  disbursement: ExcludeDisbursement | null;
};

export function DeleteExcludeDisbursementDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  disbursement,
}: DeleteExcludeDisbursementDialogProps) {
  const [inputId, setInputId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInputId("");
    }
  }, [isOpen]);

  if (!disbursement) {
    return null;
  }

  const isMatch = inputId === String(disbursement.id);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn có chắc chắn muốn xóa không?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn
            exclude disbursement khỏi danh sách.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Để xác nhận, vui lòng nhập ID của exclude disbursement:{" "}
            <strong className="text-foreground">{disbursement.id}</strong>
          </p>
          <Input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Nhập ID để xác nhận"
          />
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

