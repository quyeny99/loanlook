"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense, useState } from "react";
import { ExcludeDisbursementTable } from "@/components/exclude-disbursement-table";
import { AddExcludeDisbursementDialog } from "@/components/add-exclude-disbursement-dialog";
import { DeleteExcludeDisbursementDialog } from "@/components/delete-exclude-disbursement-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessPage } from "@/lib/utils";
import type { ExcludeDisbursement } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { deleteExcludedDisbursement } from "@/lib/supabase";

export default function ExcludeDisbursementPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [resetToPage1, setResetToPage1] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [disbursementToEdit, setDisbursementToEdit] =
    useState<ExcludeDisbursement | null>(null);
  const [disbursementToDelete, setDisbursementToDelete] =
    useState<ExcludeDisbursement | null>(null);
  const { currentProfile } = useAuth();
  const { toast } = useToast();

  // Check access permission
  if (
    currentProfile &&
    !canAccessPage(currentProfile.role, "/exclude-disbursement")
  ) {
    redirect("/");
  }

  const handleAddSuccess = () => {
    const isEditMode = !!disbursementToEdit;
    setRefreshToken((v) => v + 1);

    // If adding new disbursement, reset to page 1
    // If updating, keep current page
    if (!isEditMode) {
      setResetToPage1(true);
    }

    setDisbursementToEdit(null);
  };

  const handleEdit = (disbursement: ExcludeDisbursement) => {
    setDisbursementToEdit(disbursement);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (disbursement: ExcludeDisbursement) => {
    setDisbursementToDelete(disbursement);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!disbursementToDelete) return;

    try {
      const { error } = await deleteExcludedDisbursement(
        disbursementToDelete.id
      );

      if (error) {
        console.error("Error deleting exclude disbursement:", error);
        toast({
          title: "Error",
          description:
            error.message || "Failed to delete exclude disbursement.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Exclude disbursement has been deleted.",
      });

      setDisbursementToDelete(null);
      setIsDeleteDialogOpen(false);
      setRefreshToken((v) => v + 1);
    } catch (error) {
      console.error("Failed to delete exclude disbursement:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAddDialogClose = (open: boolean) => {
    if (!open) {
      setDisbursementToEdit(null);
    }
    setIsAddDialogOpen(open);
  };

  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl font-bold">
                  Exclude Disbursement
                </CardTitle>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exclude Disbursement
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRefreshToken((v) => v + 1)}
                    disabled={tableLoading}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", tableLoading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
            </div>
            <CardDescription className="mt-2">
              List of disbursements that have been excluded from reports and
              calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">Loading...</div>
              }
            >
              <ExcludeDisbursementTable
                refreshToken={refreshToken}
                onLoadingChange={setTableLoading}
                resetToPage1={resetToPage1}
                onResetPage1Complete={() => setResetToPage1(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Suspense>
          </CardContent>
        </Card>
        <AddExcludeDisbursementDialog
          isOpen={isAddDialogOpen}
          setIsOpen={handleAddDialogClose}
          onSave={handleAddSuccess}
          disbursementToEdit={disbursementToEdit}
        />
        <DeleteExcludeDisbursementDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          disbursement={disbursementToDelete}
        />
      </main>
    </div>
  );
}
