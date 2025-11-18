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
import { type Statement } from "@/lib/types";

type DeleteStatementDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  statement: Statement | null;
};

export function DeleteStatementDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  statement,
}: DeleteStatementDialogProps) {
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
          <AlertDialogTitle>
            Are you sure you want to delete this statement?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This action will permanently delete
            the statement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To confirm, please enter the ID of the statement:{" "}
            <strong className="text-foreground">{statement.id}</strong>
          </p>
          <Input value={inputId} onChange={(e) => setInputId(e.target.value)} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!isMatch}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
