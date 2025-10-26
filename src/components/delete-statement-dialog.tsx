
"use client"

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
import { Label } from "@/components/ui/label";
import { type Statement } from "@/lib/data";

type DeleteStatementDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  statement: Statement | null;
};

export function DeleteStatementDialog({ isOpen, setIsOpen, onConfirm, statement }: DeleteStatementDialogProps) {
  const [inputId, setInputId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInputId("");
    }
  }, [isOpen]);

  if (!statement) {
    return null;
  }

  const isMatch = inputId === statement.id;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn mục sao kê.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
                Để xác nhận, vui lòng nhập ID của mục sao kê: <strong className="text-foreground">{statement.id}</strong>
            </p>
            <Input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
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
