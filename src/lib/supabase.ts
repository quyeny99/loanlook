import { createClient } from "@/utils/supabase/client";
import type {
  ExcludeDisbursement,
  BlacklistedCustomer,
  Statement,
  LoanServiceFee,
  OverdueLoanStatus,
  Profile,
} from "./types";

// ============================================================================
// Excluded Disbursements
// ============================================================================

export async function getAllExcludedDisbursements(): Promise<
  ExcludeDisbursement[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("excluded_disbursements")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching excluded disbursements:", error);
    return [];
  }

  return data || [];
}

export async function getExcludedDisbursementsPaginated(
  page: number,
  pageSize: number
): Promise<{ data: ExcludeDisbursement[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get count
  const { count, error: countError } = await supabase
    .from("excluded_disbursements")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting excluded disbursements:", countError);
  }

  // Get data
  const { data, error } = await supabase
    .from("excluded_disbursements")
    .select("*")
    .order("date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching excluded disbursements:", error);
    return { data: [], count: count || 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function insertExcludedDisbursement(
  data: Omit<ExcludeDisbursement, "id" | "created_at" | "updated_at">
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase.from("excluded_disbursements").insert(data);

  return { error };
}

export async function updateExcludedDisbursement(
  id: string,
  data: Partial<Omit<ExcludeDisbursement, "id" | "created_at" | "updated_at">>
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("excluded_disbursements")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error };
}

export async function deleteExcludedDisbursement(
  id: string
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("excluded_disbursements")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================================
// Blacklisted Customers
// ============================================================================

export async function getBlacklistedCustomersPaginated(
  page: number,
  pageSize: number
): Promise<{ data: BlacklistedCustomer[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get count
  const { count, error: countError } = await supabase
    .from("blacklisted_customers")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting blacklisted customers:", countError);
  }

  // Get data
  const { data, error } = await supabase
    .from("blacklisted_customers")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching blacklisted customers:", error);
    return { data: [], count: count || 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function insertBlacklistedCustomer(
  data: Omit<
    BlacklistedCustomer,
    "id" | "created_at" | "updated_at" | "blacklisted_by_name"
  > & { blacklisted_by_name: string }
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase.from("blacklisted_customers").insert(data);

  return { error };
}

export async function updateBlacklistedCustomer(
  id: string,
  data: Partial<
    Omit<
      BlacklistedCustomer,
      | "id"
      | "created_at"
      | "updated_at"
      | "blacklisted_by"
      | "blacklisted_by_name"
    >
  >
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("blacklisted_customers")
    .update(data)
    .eq("id", id);

  return { error };
}

export async function deleteBlacklistedCustomer(
  id: string
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("blacklisted_customers")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================================
// Loan Statements
// ============================================================================

export async function getLoanStatementsByDate(
  date: string
): Promise<Statement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loan_statements")
    .select("*")
    .eq("payment_date", date);

  if (error) {
    console.error("Error fetching loan statements:", error);
    return [];
  }

  return data || [];
}

export async function getLoanStatementsPaginated(
  page: number,
  pageSize: number,
  filters?: { loan_id?: string; payment_date?: string }
): Promise<{ data: Statement[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("loan_statements").select("*", { count: "exact" });

  if (filters?.loan_id) {
    query = query.ilike("loan_id", `%${filters.loan_id}%`);
  }
  if (filters?.payment_date) {
    query = query.eq("payment_date", filters.payment_date);
  }

  const { data, error, count } = await query
    .order("payment_date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching loan statements:", error);
    return { data: [], count: count || 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function insertLoanStatement(
  data: Omit<Statement, "id" | "created_at" | "updated_at" | "created_by"> & {
    created_by?: string;
  }
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase.from("loan_statements").insert(data);

  return { error };
}

export async function updateLoanStatement(
  id: string,
  data: Partial<
    Omit<Statement, "id" | "created_at" | "updated_at" | "created_by">
  >
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("loan_statements")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error };
}

export async function deleteLoanStatement(id: string): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("loan_statements")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================================
// Loan Service Fees
// ============================================================================

export async function getLoanServiceFeesByDate(
  date: string
): Promise<LoanServiceFee[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loan_service_fees")
    .select("*")
    .eq("payment_date", date);

  if (error) {
    console.error("Error fetching loan service fees:", error);
    return [];
  }

  return data || [];
}

export async function getLoanServiceFeesPaginated(
  page: number,
  pageSize: number,
  filters?: { loan_id?: string; note?: string }
): Promise<{ data: LoanServiceFee[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("loan_service_fees")
    .select("*", { count: "exact" });

  if (filters?.loan_id) {
    query = query.ilike("loan_id", `%${filters.loan_id}%`);
  }
  if (filters?.note) {
    query = query.ilike("note", `%${filters.note}%`);
  }

  const { data, error, count } = await query
    .order("payment_date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching loan service fees:", error);
    return { data: [], count: count || 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function insertLoanServiceFee(
  data: Omit<
    LoanServiceFee,
    "id" | "created_at" | "updated_at" | "created_by"
  > & { created_by?: string }
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase.from("loan_service_fees").insert(data);

  return { error };
}

export async function updateLoanServiceFee(
  id: string,
  data: Partial<
    Omit<LoanServiceFee, "id" | "created_at" | "updated_at" | "created_by">
  >
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("loan_service_fees")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error };
}

export async function deleteLoanServiceFee(
  id: string
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("loan_service_fees")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================================
// Overdue Loan Status
// ============================================================================

export async function getOverdueLoanStatuses(
  loanIds?: string[]
): Promise<Map<string, OverdueLoanStatus>> {
  const supabase = createClient();
  let query = supabase.from("overdue_loan_status").select("*");

  if (loanIds && loanIds.length > 0) {
    query = query.in("loan_id", loanIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching overdue loan statuses:", error);
    return new Map();
  }

  const statusMap = new Map<string, OverdueLoanStatus>();
  (data || []).forEach((status) => {
    statusMap.set(status.loan_id, status as OverdueLoanStatus);
  });

  return statusMap;
}

export async function insertOverdueLoanStatus(
  data: Omit<OverdueLoanStatus, "created_at" | "updated_at">
): Promise<{ data: OverdueLoanStatus | null; error: any }> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("overdue_loan_status")
    .insert(data)
    .select()
    .single();

  return { data: result as OverdueLoanStatus | null, error };
}

export async function updateOverdueLoanStatus(
  loanId: string,
  data: Partial<
    Omit<OverdueLoanStatus, "loan_id" | "created_at" | "updated_at">
  >
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("overdue_loan_status")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("loan_id", loanId);

  return { error };
}

// ============================================================================
// Profiles
// ============================================================================

export async function getProfilesPaginated(
  page: number,
  pageSize: number
): Promise<{ data: Profile[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get count
  const { count, error: countError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting profiles:", countError);
  }

  // Get data
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching profiles:", error);
    return { data: [], count: count || 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getProfileByUsername(
  username: string
): Promise<{ data: Profile | null; error: any }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("username", username)
    .maybeSingle();

  return { data: data as Profile | null, error };
}

export async function insertProfile(
  data: Omit<Profile, "created_at" | "updated_at">
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").insert(data);

  return { error };
}

export async function updateProfileRole(
  id: number,
  role: string
): Promise<{ error: any }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { error };
}
