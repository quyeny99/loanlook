import type { Loan, Adjustment } from "./types";
import type { ExcludeDisbursement } from "./types";
import { createClient } from "@/utils/supabase/client";

export const loansData: Loan[] = [];

/**
 * Fetch adjustments from excluded_disbursements table
 * Converts ExcludeDisbursement to Adjustment format with negative amount to exclude from reports
 */
export async function getAdjustments(): Promise<Adjustment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("excluded_disbursements")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching adjustments:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Convert ExcludeDisbursement to Adjustment format
    // Use negative amount to exclude from reports
    return data.map((excluded: ExcludeDisbursement) => ({
      date: excluded.date,
      type: "disbursement", // Convert type to "disbursement" for compatibility
      amount: excluded.amount, // Negative amount to exclude
      reason: excluded.reason || "",
      related_ln_code: excluded.related_ln_code,
      related_ap_code: excluded.related_ap_code,
      reference_month: excluded.reference_month || "",
      fullname: excluded.fullname || "",
      approve_term: excluded.approve_term || 0,
      commission: excluded.commission || 0,
      country: excluded.country || 1,
      country__name: excluded.country__name || "",
      country__en: excluded.country__en || "",
      legal_type__name: excluded.legal_type__name || "",
      legal_type__code: excluded.legal_type__code || "",
      province: excluded.province || "",
      product__type__en: excluded.product__type__en || "",
      source__name: excluded.source__name || "",
      id: parseInt(excluded.id.replace(/-/g, "").substring(0, 8), 16) || 0, // Convert UUID to number for compatibility
    }));
  } catch (error) {
    console.error("Failed to fetch adjustments:", error);
    return [];
  }
}

// Legacy export for backward compatibility (deprecated - use getAdjustments() instead)
export const adjustments: Adjustment[] = [];
