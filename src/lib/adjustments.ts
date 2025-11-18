import { type Application, type Adjustment } from "@/lib/types";

/**
 * Apply disbursement adjustments to a list of applications
 * @param disbursedApplications - Original list of disbursed applications
 * @param filteredAdjustments - List of adjustments filtered by date range/month/day
 * @returns Adjusted list of disbursed applications
 */
export function applyDisbursementAdjustments(
  disbursedApplications: Application[],
  filteredAdjustments: Adjustment[]
): Application[] {
  // Create a copy to avoid mutating the original array
  let adjustedApplications = [...disbursedApplications];

  // Process each adjustment
  filteredAdjustments.forEach((adj) => {
    if (adj.amount > 0) {
      // Positive adjustment: Add or create application
      // First, try to find existing application by related_ap_code
      const existingAppIndex = adjustedApplications.findIndex(
        (app) => app.code === adj.related_ap_code
      );

      if (existingAppIndex >= 0) {
        // If found, update the disbursement amount
        adjustedApplications[existingAppIndex] = {
          ...adjustedApplications[existingAppIndex],
          loanapp__disbursement:
            (adjustedApplications[existingAppIndex].loanapp__disbursement ||
              0) + adj.amount,
          loanapp__dbm_entry__date: adj.date,
        };
      } else {
        // If not found, create a virtual application
        // Use first application as template if available, otherwise create minimal one
        const templateApp = adjustedApplications[0];
        const virtualApp: Application = {
          ...(templateApp || ({} as Application)),
          id: -Math.abs(adj.id), // Use negative ID to indicate virtual
          code: adj.related_ap_code,
          loanapp__code: adj.related_ln_code,
          loanapp__disbursement: adj.amount,
          loanapp__dbm_entry__date: adj.date,
          approve_amount: adj.amount,
          approve_term: adj?.approve_term || 0,
          commission: adj?.commission,
          payment_status__code: "unpaid",
          country: adj?.country || 1,
          country__name: adj?.country__name || "Việt Nam",
          country__en: adj?.country__en || "Vietnam",
          legal_type__name: adj?.legal_type__name || "",
          legal_type__code: adj?.legal_type__code || "",
          province: adj?.province || "",
          product__type__en: adj?.product__type__en || "",
          source__name: adj?.source__name || "",
        };
        adjustedApplications.push(virtualApp);
      }
    } else if (adj.amount < 0) {
      // Negative adjustment: Remove or reduce application
      const existingAppIndex = adjustedApplications.findIndex(
        (app) => app.code === adj.related_ap_code
      );

      if (existingAppIndex >= 0) {
        const currentDisbursement =
          adjustedApplications[existingAppIndex].loanapp__disbursement || 0;
        const adjustmentAmount = Math.abs(adj.amount);

        if (currentDisbursement <= adjustmentAmount) {
          // Remove the application if adjustment amount >= current disbursement
          adjustedApplications.splice(existingAppIndex, 1);
        } else {
          // Reduce the disbursement amount
          adjustedApplications[existingAppIndex] = {
            ...adjustedApplications[existingAppIndex],
            loanapp__disbursement: currentDisbursement - adjustmentAmount,
          };
        }
      }
      // If application not found, it might be outside date range, so we skip it
    }
  });

  return adjustedApplications;
}
