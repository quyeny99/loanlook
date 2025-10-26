
'use client';

import { useState, useEffect, useCallback, Fragment } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, MoreHorizontal, Pencil, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStatementDialog } from "@/components/add-statement-dialog";
import { DeleteStatementDialog } from "@/components/delete-statement-dialog";
import { LoanPagination } from "@/components/loan-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { type Statement } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";

const currencyFormatter = new Intl.NumberFormat('de-DE', {});
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const ITEMS_PER_PAGE = 10;

export default function StatementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statementData, setStatementData] = useState<Statement[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  // Get current page and search from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('search') || '';

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const fetchStatements = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get total count with search filter
      let countQuery = supabase.from('loan_statements').select('*', { count: 'exact', head: true });
      
      if (searchTerm) {
        countQuery = countQuery.or(`loan_id.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`);
      }
      
      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error counting statements:', countError);
      } else if (count !== null) {
        setTotalCount(count);
      }

      // Calculate pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      console.log('Fetching statements from Supabase...', { from, to, currentPage, searchTerm });
      
      // Build query with filters
      let dataQuery = supabase.from('loan_statements').select('*');
      
      // Add search filter if search term exists
      if (searchTerm) {
        dataQuery = dataQuery.or(`loan_id.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`);
      }
      
      // Apply order and range
      dataQuery = dataQuery.order('payment_date', { ascending: false }).range(from, to);
      
      const { data, error } = await dataQuery;

      if (error) {
        console.error('Error fetching statements:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return;
      }

      console.log('Fetched data:', data);
      
      if (data) {
        setStatementData(data as Statement[]);
      }
    } catch (error) {
      console.error('Failed to fetch statements:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmedValue = value.trim();
    const params = new URLSearchParams(searchParams.toString());
    
    if (trimmedValue) {
      params.set('search', trimmedValue);
      params.set('page', '1'); // Reset to page 1 when searching
    } else {
      params.delete('search');
      params.set('page', '1');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, 500);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

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

  const handleSaveStatement = async (statement: Omit<Statement, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { id?: string }) => {
    try {
      const supabase = createClient();
      
      if (statement.id) {
        // Update existing statement
        const { error } = await supabase
          .from('loan_statements')
          .update({
            loan_id: statement.loan_id,
            note: statement.note,
            payment_date: statement.payment_date,
            principal_amount: statement.principal_amount,
            interest_amount: statement.interest_amount,
            management_fee: statement.management_fee,
            overdue_fee: statement.overdue_fee,
            settlement_fee: statement.settlement_fee,
            remaining_amount: statement.remaining_amount,
            vat_amount: statement.vat_amount,
            total_amount: statement.total_amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', statement.id);

        if (error) {
          console.error('Error updating statement:', error);
          return;
        }
      } else {
        // Add new statement
        const { error } = await supabase
          .from('loan_statements')
          .insert({
            loan_id: statement.loan_id,
            note: statement.note,
            payment_date: statement.payment_date,
            principal_amount: statement.principal_amount,
            interest_amount: statement.interest_amount,
            management_fee: statement.management_fee,
            overdue_fee: statement.overdue_fee,
            settlement_fee: statement.settlement_fee,
            remaining_amount: statement.remaining_amount,
            vat_amount: statement.vat_amount,
            total_amount: statement.total_amount,
          });

        if (error) {
          console.error('Error inserting statement:', error);
          return;
        }
      }

      // Reset to page 1 and refresh data from database
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
      
      // Refresh data
      await fetchStatements();
    } catch (error) {
      console.error('Failed to save statement:', error);
    }
  };

  const handleDeleteStatement = async () => {
    if (statementToDelete) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('loan_statements')
          .delete()
          .eq('id', statementToDelete.id);

        if (error) {
          console.error('Error deleting statement:', error);
          return;
        }

        setStatementToDelete(null);
        // Check if need to go to last page after deletion
        const newTotalCount = totalCount - 1;
        const totalPages = Math.ceil(newTotalCount / ITEMS_PER_PAGE);
        const params = new URLSearchParams(searchParams.toString());
        
        if (currentPage > totalPages && totalPages > 0) {
          params.set('page', totalPages.toString());
        } else {
          params.set('page', currentPage.toString());
        }
        
        router.push(`?${params.toString()}`, { scroll: false });
        
        // Refresh data
        await fetchStatements();
      } catch (error) {
        console.error('Failed to delete statement:', error);
      }
    }
  };

  const handleReload = () => {
    fetchStatements();
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
              <Input
                placeholder="Tìm kiếm theo mã hoặc ghi chú..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-[250px]"
              />
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sao kê
              </Button>
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
                <TableHead style={{ width: '8%' }}>Mã khoản vay</TableHead>
                <TableHead style={{ width: '9%' }}>Ngày thanh toán</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Gốc</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Lãi vay</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Phí quản lý</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Phí trễ hạn</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Phí tất toán</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Thu dư</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Thuế GTGT</TableHead>
                <TableHead className="text-right" style={{ width: '9%' }}>Tổng thu</TableHead>
                <TableHead style={{ width: '12%' }}>Ghi chú</TableHead>
                <TableHead className="text-right" style={{ width: '8%' }}>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : statementData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12">
                    <p className="text-muted-foreground">Không có dữ liệu sao kê</p>
                  </TableCell>
                </TableRow>
              ) : (
                <Fragment key="statement-data">
                  {statementData.map((row) => {
                return (
                <TableRow key={row.id}>
                  <TableCell>{row.loan_id}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(row.payment_date))}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.principal_amount)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.interest_amount)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.management_fee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.overdue_fee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.settlement_fee)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.remaining_amount)}</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(row.vat_amount)}</TableCell>
                  <TableCell className="text-right font-bold">{currencyFormatter.format(row.total_amount)}</TableCell>
                  <TableCell>
                    <div className="min-w-[150px] whitespace-normal break-words">
                      {row.note}
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
                </Fragment>
              )}
            </TableBody>
          </Table>
          {!loading && totalCount > 0 && (
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
