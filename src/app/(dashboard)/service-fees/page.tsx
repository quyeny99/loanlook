"use client";

import { useState, useEffect, useCallback, Fragment, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddServiceFeeDialog } from "@/components/add-service-fee-dialog";
import { DeleteServiceFeeDialog } from "@/components/delete-service-fee-dialog";
import { LoanPagination } from "@/components/loan-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { type LoanServiceFee } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { canCreate, canUpdate, canDelete, canAccessPage } from "@/lib/utils";
import { redirect } from "next/navigation";

import { currencyFormatter } from "@/lib/constants";

const paymentDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const ITEMS_PER_PAGE = 10;

function ServiceFeesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [serviceFeeData, setServiceFeeData] = useState<LoanServiceFee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingServiceFee, setEditingServiceFee] =
    useState<LoanServiceFee | null>(null);
  const [serviceFeeToDelete, setServiceFeeToDelete] =
    useState<LoanServiceFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const { isAdmin, loginId, currentProfile } = useAuth();
  const { toast } = useToast();

  // Check access permission
  if (currentProfile && !canAccessPage(currentProfile.role, "/service-fees")) {
    redirect("/");
  }

  const canCreateServiceFee = canCreate(currentProfile?.role);
  const canUpdateServiceFee = canUpdate(currentProfile?.role);
  const canDeleteServiceFee = canDelete(currentProfile?.role);
  // Get current page and search from URL params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchTerm = searchParams.get("search") || "";

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const fetchServiceFees = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get total count with search filter
      let countQuery = supabase
        .from("loan_service_fees")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery = countQuery.or(
          `loan_id.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error counting service fees:", countError);
      } else if (count !== null) {
        setTotalCount(count);
      }

      // Calculate pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      console.log("Fetching service fees from Supabase...", {
        from,
        to,
        currentPage,
        searchTerm,
      });

      // Build query with filters
      let dataQuery = supabase.from("loan_service_fees").select("*");

      // Add search filter if search term exists
      if (searchTerm) {
        dataQuery = dataQuery.or(
          `loan_id.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`
        );
      }

      dataQuery = dataQuery
        .order("payment_date", { ascending: false })
        .range(from, to);

      const { data, error } = await dataQuery;

      if (error) {
        console.error("Error fetching service fees:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("Fetched data:", data);

      if (data) {
        setServiceFeeData(data as LoanServiceFee[]);
      }
    } catch (error) {
      console.error("Failed to fetch service fees:", error);
      console.error("Full error:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchServiceFees();
  }, [fetchServiceFees]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmedValue = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmedValue) {
      params.set("search", trimmedValue);
      params.set("page", "1"); // Reset to page 1 when searching
    } else {
      params.delete("search");
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }, 500);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const openAddDialog = () => {
    setEditingServiceFee(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (serviceFee: LoanServiceFee) => {
    setEditingServiceFee(serviceFee);
    setIsAddDialogOpen(true);
  };

  const openDeleteDialog = (serviceFee: LoanServiceFee) => {
    setServiceFeeToDelete(serviceFee);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveServiceFee = async (
    serviceFee: Omit<
      LoanServiceFee,
      "id" | "created_at" | "updated_at" | "created_by"
    > & { id?: string }
  ) => {
    try {
      const supabase = createClient();
      const params = new URLSearchParams(searchParams.toString());

      if (!loginId) {
        toast({
          title: "Error",
          description: "Please log in to save the service fee.",
          variant: "destructive",
        });
        return;
      }

      if (serviceFee.id) {
        // Update existing service fee
        const { error } = await supabase
          .from("loan_service_fees")
          .update({
            loan_id: serviceFee.loan_id,
            payment_date: serviceFee.payment_date,
            note: serviceFee.note,
            appraisal_fee: serviceFee.appraisal_fee,
            appraisal_fee_vat: serviceFee.appraisal_fee_vat,
            disbursement_fee: serviceFee.disbursement_fee,
            disbursement_fee_vat: serviceFee.disbursement_fee_vat,
            vat_amount: serviceFee.vat_amount,
            total_amount: serviceFee.total_amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", serviceFee.id);

        if (error) {
          console.error("Error updating service fee:", error);
          return;
        }
        params.set("page", currentPage.toString());
      } else {
        // Add new service fee
        const { error } = await supabase.from("loan_service_fees").insert({
          loan_id: serviceFee.loan_id,
          payment_date: serviceFee.payment_date,
          note: serviceFee.note,
          appraisal_fee: serviceFee.appraisal_fee,
          appraisal_fee_vat: serviceFee.appraisal_fee_vat,
          disbursement_fee: serviceFee.disbursement_fee,
          disbursement_fee_vat: serviceFee.disbursement_fee_vat,
          vat_amount: serviceFee.vat_amount,
          total_amount: serviceFee.total_amount,
          created_by: loginId,
        });

        if (error) {
          console.error("Error inserting service fee:", error);
          return;
        }
        params.set("page", "1");
      }

      // Preserve current page after save and refresh data from database
      router.push(`?${params.toString()}`, { scroll: false });

      // Refresh data
      await fetchServiceFees();
    } catch (error) {
      console.error("Failed to save service fee:", error);
    }
  };

  const handleDeleteServiceFee = async () => {
    if (serviceFeeToDelete) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("loan_service_fees")
          .delete()
          .eq("id", serviceFeeToDelete.id);

        if (error) {
          console.error("Error deleting service fee:", error);
          return;
        }

        setServiceFeeToDelete(null);
        // Check if need to go to last page after deletion
        const newTotalCount = totalCount - 1;
        const totalPages = Math.ceil(newTotalCount / ITEMS_PER_PAGE);
        const params = new URLSearchParams(searchParams.toString());

        if (currentPage > totalPages && totalPages > 0) {
          params.set("page", totalPages.toString());
        } else {
          params.set("page", currentPage.toString());
        }

        router.push(`?${params.toString()}`, { scroll: false });

        // Refresh data
        await fetchServiceFees();
      } catch (error) {
        console.error("Failed to delete service fee:", error);
      }
    }
  };

  const handleReload = () => {
    fetchServiceFees();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Fees</CardTitle>
              <CardDescription>
                Manage appraisal and disbursement fees for loans.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by loan ID or note..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-[250px]"
              />
              {canCreateServiceFee && (
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add service fee
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleReload}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "8%" }}>Loan ID</TableHead>
                <TableHead style={{ width: "8%" }}>Payment Date</TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Appraisal Fee
                </TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Appraisal Fee VAT
                </TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Disbursement Fee
                </TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Disbursement Fee VAT
                </TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Total VAT
                </TableHead>
                <TableHead className="text-right" style={{ width: "8%" }}>
                  Total Fee
                </TableHead>
                <TableHead style={{ width: "12%" }}>Notes</TableHead>
                {canCreateServiceFee && (
                  <TableHead
                    className="text-right"
                    style={{ width: "5%" }}
                  ></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    {canCreateServiceFee && (
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : serviceFeeData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={(canUpdateServiceFee || canDeleteServiceFee) ? 11 : 10}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">
                      No service fees data
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                <Fragment key="service-fee-data">
                  {serviceFeeData.map((row) => {
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.loan_id}</TableCell>
                        <TableCell>
                          {row.payment_date
                            ? paymentDateFormatter.format(
                                new Date(row.payment_date)
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(row.appraisal_fee)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(row.appraisal_fee_vat)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(row.disbursement_fee)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(row.disbursement_fee_vat)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currencyFormatter.format(row.vat_amount)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {currencyFormatter.format(row.total_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[150px] whitespace-normal break-words">
                            {row.note}
                          </div>
                        </TableCell>

                        {(canUpdateServiceFee || canDeleteServiceFee) && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canUpdateServiceFee && (
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(row)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {canDeleteServiceFee && (
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => openDeleteDialog(row)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </Fragment>
              )}
            </TableBody>
          </Table>
          {totalCount > 0 && (
            <div className="mt-4">
              <LoanPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <AddServiceFeeDialog
        key={editingServiceFee ? editingServiceFee.id : "add"}
        onSave={handleSaveServiceFee}
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        serviceFeeToEdit={editingServiceFee}
      />
      <DeleteServiceFeeDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteServiceFee}
        serviceFee={serviceFeeToDelete}
      />
    </div>
  );
}

function ServiceFeesPageFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Phí dịch vụ</span>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phí dịch vụ khoản vay</CardTitle>
              <CardDescription>
                Quản lý phí thẩm định và phí giải ngân cho các khoản vay.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ServiceFeesPage() {
  return (
    <Suspense fallback={<ServiceFeesPageFallback />}>
      <ServiceFeesPageContent />
    </Suspense>
  );
}
