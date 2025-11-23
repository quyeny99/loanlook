import type { Loan, Adjustment } from "./types";
import type { ExcludeDisbursement } from "./types";
import { getAllExcludedDisbursements } from "./supabase";

export const loansData: Loan[] = [];

/**
 * Fetch adjustments from excluded_disbursements table
 * Converts ExcludeDisbursement to Adjustment format
 * Uses direction field to determine if amount should be positive (in) or negative (out)
 */
export async function getAdjustments(): Promise<Adjustment[]> {
  try {
    const data = await getAllExcludedDisbursements();

    if (!data || data.length === 0) {
      return [];
    }

    // Convert ExcludeDisbursement to Adjustment format
    // Keep direction field to determine if amount should be added or subtracted
    return data.map((excluded: ExcludeDisbursement) => ({
      date: excluded.date,
      type: "disbursement", // Convert type to "disbursement" for compatibility
      amount: Math.abs(excluded.amount), // Always use positive amount, direction determines operation
      direction: excluded.direction,
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
