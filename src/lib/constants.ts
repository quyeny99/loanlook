export function getRowColorByDueDays(
  dueDays: number | null | undefined
): string {
  if (dueDays === 0) return "bg-green-50 border-green-500 hover:bg-green-100";
  if (dueDays !== null && dueDays !== undefined) {
    if (dueDays >= 1 && dueDays <= 6)
      return "bg-yellow-50 border-yellow-500 hover:bg-yellow-100";
    if (dueDays >= 7 && dueDays <= 14)
      return "bg-orange-200 border-orange-500 hover:bg-orange-300";
    if (dueDays >= 15) return "bg-red-200 border-red-500 hover:bg-red-300";
  }
  return "";
}

/**
 * Custom status values for overdue loans
 */
export const OVERDUE_CUSTOM_STATUS = {
  OVERDUE_FOLLOW_UP: "overdue_follow_up", // Giai đoạn quá hạn / theo dõi
  REMINDER_SENT: "reminder_sent", // Đang nhắc nợ
  CONTACTED_NO_RESPONSE: "contacted_no_response", // Đã liên hệ nhưng chưa trả lời
  CANNOT_CONTACT: "cannot_contact", // Không liên lạc được
  PROMISE_TO_PAY: "promise_to_pay", // Hứa thanh toán (có ngày hứa)
  PARTIAL_PAYMENT: "partial_payment", // Đã thanh toán 1 phần
  OVERDUE_DAYS: "overdue_days", // Quá hạn X ngày
  SPECIAL_HANDLING: "special_handling", // Giai đoạn xử lý đặc biệt
  LEGAL_PROCESS: "legal_process", // Đang xử lý pháp lý
  TRANSFERRED_TO_RECOVERY: "transferred_to_recovery", // Chuyển thu hồi nợ chuyên trách
} as const;

export type OverdueCustomStatus =
  (typeof OVERDUE_CUSTOM_STATUS)[keyof typeof OVERDUE_CUSTOM_STATUS];

/**
 * Display labels for custom status values (Vietnamese)
 */
export const OVERDUE_CUSTOM_STATUS_LABELS: Record<OverdueCustomStatus, string> =
  {
    [OVERDUE_CUSTOM_STATUS.OVERDUE_FOLLOW_UP]: "Giai đoạn quá hạn / theo dõi",
    [OVERDUE_CUSTOM_STATUS.REMINDER_SENT]: "Đang nhắc nợ",
    [OVERDUE_CUSTOM_STATUS.CONTACTED_NO_RESPONSE]:
      "Đã liên hệ nhưng chưa trả lời",
    [OVERDUE_CUSTOM_STATUS.CANNOT_CONTACT]: "Không liên lạc được",
    [OVERDUE_CUSTOM_STATUS.PROMISE_TO_PAY]: "Hứa thanh toán (có ngày hứa)",
    [OVERDUE_CUSTOM_STATUS.PARTIAL_PAYMENT]: "Đã thanh toán 1 phần",
    [OVERDUE_CUSTOM_STATUS.OVERDUE_DAYS]: "Quá hạn X ngày",
    [OVERDUE_CUSTOM_STATUS.SPECIAL_HANDLING]: "Giai đoạn xử lý đặc biệt",
    [OVERDUE_CUSTOM_STATUS.LEGAL_PROCESS]: "Đang xử lý pháp lý",
    [OVERDUE_CUSTOM_STATUS.TRANSFERRED_TO_RECOVERY]:
      "Chuyển thu hồi nợ chuyên trách",
  };

/**
 * Display labels for custom status values (English)
 */
export const OVERDUE_CUSTOM_STATUS_LABELS_EN: Record<
  OverdueCustomStatus,
  string
> = {
  [OVERDUE_CUSTOM_STATUS.OVERDUE_FOLLOW_UP]: "Overdue Follow Up",
  [OVERDUE_CUSTOM_STATUS.REMINDER_SENT]: "Reminder Sent",
  [OVERDUE_CUSTOM_STATUS.CONTACTED_NO_RESPONSE]: "Contacted No Response",
  [OVERDUE_CUSTOM_STATUS.CANNOT_CONTACT]: "Cannot Contact",
  [OVERDUE_CUSTOM_STATUS.PROMISE_TO_PAY]: "Promise to Pay",
  [OVERDUE_CUSTOM_STATUS.PARTIAL_PAYMENT]: "Partial Payment",
  [OVERDUE_CUSTOM_STATUS.OVERDUE_DAYS]: "Overdue Days",
  [OVERDUE_CUSTOM_STATUS.SPECIAL_HANDLING]: "Special Handling",
  [OVERDUE_CUSTOM_STATUS.LEGAL_PROCESS]: "Legal Process",
  [OVERDUE_CUSTOM_STATUS.TRANSFERRED_TO_RECOVERY]: "Transferred to Recovery",
};

/**
 * Color mapping for custom status values based on severity level
 */
export const OVERDUE_CUSTOM_STATUS_COLORS: Record<
  OverdueCustomStatus,
  { bg: string; text: string; border: string }
> = {
  [OVERDUE_CUSTOM_STATUS.OVERDUE_FOLLOW_UP]: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  [OVERDUE_CUSTOM_STATUS.REMINDER_SENT]: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  [OVERDUE_CUSTOM_STATUS.CONTACTED_NO_RESPONSE]: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  [OVERDUE_CUSTOM_STATUS.CANNOT_CONTACT]: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
  },
  [OVERDUE_CUSTOM_STATUS.PROMISE_TO_PAY]: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  [OVERDUE_CUSTOM_STATUS.PARTIAL_PAYMENT]: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-300",
  },
  [OVERDUE_CUSTOM_STATUS.OVERDUE_DAYS]: {
    bg: "bg-red-100",
    text: "text-red-900",
    border: "border-red-400",
  },
  [OVERDUE_CUSTOM_STATUS.SPECIAL_HANDLING]: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  [OVERDUE_CUSTOM_STATUS.LEGAL_PROCESS]: {
    bg: "bg-red-200",
    text: "text-red-950",
    border: "border-red-500",
  },
  [OVERDUE_CUSTOM_STATUS.TRANSFERRED_TO_RECOVERY]: {
    bg: "bg-red-300",
    text: "text-red-950",
    border: "border-red-600",
  },
};
