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

// Chart Colors
export const CHART_COLORS = [
  "#3b82f6",
  "#a855f7",
  "#2dd4bf",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export const CHART_COLORS_MONTHLY = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
  "#a4c8e0",
  "#d8a4e0",
];

// API Constants
export const API_BASE_URL = "https://api.y99.vn/data/Application/";

export const API_VALUES =
  "id,payment_status__code,loanapp__disbursement,legal_type__code,fees,source,source__name,legal_type,status__index,appcntr__signature,appcntr__update_time,appcntr__user__fullname,approve_time,product,commission,customer,customer__code,product__type__en,update_time,updater__fullname,updater__fullname,source__name,creator__fullname,approver,approver__fullname,product,product__type__name,product__type__en,product__type__code,product__category__name,product__category__code,product__commission,branch,customer,customer__code,status,status__name,status__en,branch__id,branch__name,branch__code,branch__type__en,branch__type__code,branch__type__id,branch__type__name,country__id,country__code,country__name,country__en,currency,currency__code,loan_amount,loan_term,code,fullname,phone,province,district,address,sex,sex__name,sex__en,issue_place,loan_term,loan_amount,legal_type__name,legal_code,legal_type__en,issue_date,issue_place,country,collaborator,collaborator__id,collaborator__user,collaborator__fullname,collaborator__code,create_time,update_time,salary_income,business_income,other_income,living_expense,loan_expense,other_expense,credit_fee,disbursement_fee,loan_fee,colateral_fee,note,commission,commission_rate,payment_status,payment_info,history,ability,ability__name,ability__en,ability__code,doc_audit,onsite_audit,approve_amount,approve_term,loanapp,loanapp__code,purpose,purpose__code,purpose__name,purpose__en,purpose__index,loanapp__dbm_entry__date";

export const API_VALUES_DISBURSED =
  "id,payment_status__code,loanapp__disbursement,loanapp__dbm_entry__date,approve_amount,approve_term,code,commission,country,country__name,country__en,legal_type__name,province,product__type__en,source__name,legal_type__code";

export const LOAN_SCHEDULE_API_VALUES = [
  "id",
  "type",
  "status",
  "paid_amount",
  "remain_amount",
  "ovd_amount",
  "itr_income",
  "to_date",
  "pay_amount",
  "detail",
];

// Currency Formatter
export const currencyFormatter = new Intl.NumberFormat("de-DE", {});

// Math Constants
export const RADIAN = Math.PI / 180;

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

// User Roles
export const USER_ROLES = {
  USER: "user",
  CS: "cs",
  CA: "ca",
  SHAREHOLDER: "shareholder",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Countries
export const COUNTRIES: Record<
  string,
  { name: string; en: string; id: number }
> = {
  "Việt Nam": {
    name: "Việt Nam",
    en: "Vietnam",
    id: 1,
  },
  Singapore: {
    name: "Singapore",
    en: "Singapore",
    id: 2,
  },
  "Đài Loan": {
    name: "Đài Loan",
    en: "Taiwan",
    id: 3,
  },
} as const;

// Legal Types
export const LEGAL_TYPES: Record<
  string,
  { name: string; code: string }
> = {
  "Căn cước công dân": {
    name: "Căn cước công dân",
    code: "CCCD",
  },
  "Hộ chiếu": { name: "Hộ chiếu", code: "HC" },
} as const;
