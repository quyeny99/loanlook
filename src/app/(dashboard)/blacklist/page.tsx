"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense, useState } from "react";
import { BlacklistCustomersTable } from "@/components/blacklist-customers-table";
import { AddCustomerToBlacklistDialog } from "@/components/add-customer-to-blacklist-dialog";
import { DeleteBlacklistCustomerDialog } from "@/components/delete-blacklist-customer-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Ban, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlacklistedCustomer } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function BlacklistPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] =
    useState<BlacklistedCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] =
    useState<BlacklistedCustomer | null>(null);
  const [resetToPage1, setResetToPage1] = useState(false);
  const { toast } = useToast();

  const handleAddSuccess = () => {
    const isEditMode = !!customerToEdit;
    setRefreshToken((v) => v + 1);

    // If adding new customer, reset to page 1
    // If updating, keep current page
    if (!isEditMode) {
      setResetToPage1(true);
    }

    setCustomerToEdit(null);
  };

  const handleEdit = (customer: BlacklistedCustomer) => {
    setCustomerToEdit(customer);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (customer: BlacklistedCustomer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("blacklisted_customers")
        .delete()
        .eq("id", customerToDelete.id);

      if (error) {
        console.error("Error deleting customer:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete customer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer has been removed from blacklist.",
      });

      setCustomerToDelete(null);
      setIsDeleteDialogOpen(false);
      setRefreshToken((v) => v + 1);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAddDialogClose = (open: boolean) => {
    if (!open) {
      setCustomerToEdit(null);
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
                <Ban className="h-6 w-6 text-red-600" />
                <CardTitle className="text-2xl font-bold">
                  Blacklisted Customers
                </CardTitle>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
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
              List of all customers who have been blacklisted from the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">Loading...</div>
              }
            >
              <BlacklistCustomersTable
                refreshToken={refreshToken}
                onLoadingChange={setTableLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                resetToPage1={resetToPage1}
                onResetPage1Complete={() => setResetToPage1(false)}
              />
            </Suspense>
          </CardContent>
        </Card>
        <AddCustomerToBlacklistDialog
          isOpen={isAddDialogOpen}
          setIsOpen={handleAddDialogClose}
          onSave={handleAddSuccess}
          customerToEdit={customerToEdit}
        />
        <DeleteBlacklistCustomerDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          customer={customerToDelete}
        />
      </main>
    </div>
  );
}
