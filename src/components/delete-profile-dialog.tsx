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
import { type Profile } from "@/lib/types";

type DeleteProfileDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  profile: Profile | null;
};

export function DeleteProfileDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  profile,
}: DeleteProfileDialogProps) {
  const [inputId, setInputId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setInputId("");
    }
  }, [isOpen]);

  if (!profile) {
    return null;
  }

  const isMatch = inputId === String(profile.id);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this profile?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This action will permanently delete
            the profile for user <strong>{profile.username}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To confirm, please enter the ID of the profile:{" "}
            <strong className="text-foreground">{profile.id}</strong>
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

